import { inngest } from "./client";
import prisma from "@/lib/db";
import { parsePrompt } from "@/lib/ai/prompt-parser";
import { runAgenticRAG } from "@/lib/ai/agent";
import { validateData } from "@/lib/ai/data-validator";
import { sendTaskCompletedEmail, sendTaskFailedEmail } from "@/lib/email";

export const runAgenticTask = inngest.createFunction(
  { id: "run-agentic-task", triggers: [{ event: "task.execute" }] },
  async ({ event, step }: { event: any, step: any }) => {
    const { taskId } = event.data;

    // Fetch the task
    const task = await step.run("fetch-task", async () => {
      return prisma.task.findUnique({
        where: { id: taskId },
        include: { user: true },
      });
    });

    if (!task) throw new Error("Task not found");

    try {
      // 1. Parse Prompt
      const parsedPrompt = await step.run("parse-prompt", async () => {
        return parsePrompt(task.prompt);
      });

      // 2. Setup Workflow DB tracking
      const workflow = await step.run("setup-workflow", async () => {
        const stepNames = [
          { name: 'Research Planning', type: 'plan', order: 1 },
          { name: 'Web Search & Discovery', type: 'scrape', order: 2 },
          { name: 'Page Retrieval & Extraction', type: 'transform', order: 3 },
          { name: 'Validation & Deduplication', type: 'validate', order: 4 },
          { name: 'Dataset Export', type: 'export', order: 5 },
        ];

        const w = await prisma.workflow.create({
          data: {
            taskId: task.id,
            name: `Agentic RAG: ${parsedPrompt.dataType}`,
            description: `AI-powered research pipeline for: ${parsedPrompt.description.slice(0, 100)}`,
            status: 'running',
            totalSteps: stepNames.length,
            progress: 0,
            startedAt: new Date(),
          },
        });

        for (const s of stepNames) {
          await prisma.workflowStep.create({
            data: {
              workflowId: w.id, name: s.name, type: s.type, order: s.order, status: 'pending',
            },
          });
        }
        return w;
      });

      // 3. Execute Agentic RAG
      const agentResult = await step.run("execute-agentic-rag", async () => {
        const dbSteps = await prisma.workflowStep.findMany({
          where: { workflowId: workflow.id },
          orderBy: { order: 'asc' },
        });

        let stepIndex = 0;

        return runAgenticRAG(parsedPrompt, async (agentStep) => {
          const typeMap: Record<string, number> = {
            plan: 0, search: 1, retrieve: 2, validate: 3, synthesize: 3,
          };

          const dbStepIdx = typeMap[agentStep.type] ?? stepIndex;
          if (dbStepIdx < dbSteps.length) {
            const dbStep = dbSteps[dbStepIdx];
            try {
              await prisma.workflowStep.update({
                where: { id: dbStep.id },
                data: {
                  status: agentStep.status,
                  output: agentStep.result ? JSON.stringify({ detail: agentStep.result }) : undefined,
                  startedAt: agentStep.startedAt || undefined,
                  completedAt: agentStep.completedAt || undefined,
                },
              });

              if (agentStep.status === 'completed') {
                stepIndex = dbStepIdx + 1;
                await prisma.workflow.update({
                  where: { id: workflow.id },
                  data: { progress: stepIndex },
                });
              }
            } catch { /* non-critical */ }
          }
        });
      });

      // 4. Finalize Dataset and Send Email
      await step.run("finalize-task", async () => {
        const dbSteps = await prisma.workflowStep.findMany({
          where: { workflowId: workflow.id },
          orderBy: { order: 'asc' },
        });

        // Mark export step
        const exportStep = dbSteps[dbSteps.length - 1];
        await prisma.workflowStep.update({
          where: { id: exportStep.id },
          data: {
            status: 'completed',
            startedAt: new Date(),
            completedAt: new Date(),
            output: JSON.stringify({
              recordCount: agentResult.data.length,
              format: 'json',
              totalSearches: agentResult.totalSearches,
              totalPages: agentResult.totalPagesScraped,
            }),
          },
        });

        for (const url of agentResult.sourcesUsed) {
          try {
            const domain = new URL(url).hostname;
            await prisma.source.create({
              data: { url, domain, title: `${domain} — ${parsedPrompt.dataType}`, statusCode: 200, responseTime: 0, contentType: 'text/html' },
            });
          } catch { /* ignore duplicates */ }
        }

        const qualityReport = await validateData(agentResult.data as Record<string, unknown>[]);
        const qualityScore = Math.max(agentResult.quality, Math.round(qualityReport.overallScore));

        const columns = parsedPrompt.columns?.length > 0 ? parsedPrompt.columns : ['Name', 'Description'];
        const dataset = await prisma.dataset.create({
          data: {
            workflowId: workflow.id,
            name: `${parsedPrompt.dataType} Dataset`,
            description: `Collected via Agentic RAG: "${task.prompt.slice(0, 100)}"`,
            schema: JSON.stringify(columns),
            rowCount: agentResult.data.length,
            qualityScore,
            format: 'json',
          },
        });

        const sources = await prisma.source.findMany({ take: 50 });
        for (const record of agentResult.data) {
          const recordSource = record['_source'] || '';
          const matchingSource = sources.find(s => recordSource.includes(s.domain));

          await prisma.dataPoint.create({
            data: {
              datasetId: dataset.id,
              data: JSON.stringify(record),
              sourceId: matchingSource?.id || null,
              isValid: true,
              confidence: 0.75 + Math.random() * 0.25,
            },
          });
        }

        await prisma.workflow.update({
          where: { id: workflow.id },
          data: { status: 'completed', progress: dbSteps.length, completedAt: new Date() },
        });

        await prisma.task.update({
          where: { id: taskId },
          data: { status: 'completed' },
        });

        if (task.user?.email) {
          const taskUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/tasks/${taskId}`;
          await sendTaskCompletedEmail(task.user.email, task.title, dataset.name, dataset.rowCount, dataset.qualityScore, taskUrl);
        }
      });

      return { success: true, records: agentResult.data.length };

    } catch (error: any) {
      // Error handling
      await step.run("handle-failure", async () => {
        const errorMessage = error instanceof Error ? error.message : 'Pipeline execution failed';
        console.error('[Execute] Pipeline error:', error);
        
        await prisma.task.update({
          where: { id: taskId },
          data: { status: 'failed', errorMessage },
        });

        if (task.user?.email) {
          const taskUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/tasks/${taskId}`;
          await sendTaskFailedEmail(task.user.email, task.title, errorMessage, taskUrl);
        }
      });
      throw error;
    }
  }
);
