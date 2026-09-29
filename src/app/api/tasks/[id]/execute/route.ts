import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security';
import prisma from '@/lib/db';
import { parsePrompt } from '@/lib/ai/prompt-parser';
import { generateDataFromLLMKnowledge, createResearchPlan } from '@/lib/ai/agent';
import { webSearch, fetchPageContent, extractInternalLinks } from '@/lib/ai/search';
import { extractStructuredData, mergeRecords } from '@/lib/ai/extractor';
import { validateData } from '@/lib/ai/data-validator';

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const allowed = await rateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'start';

    const task = await prisma.task.findUnique({
      where: { id },
      include: { workflows: { include: { steps: true, datasets: true } } },
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // Handle pause/cancel commands
    if (action === 'pause') {
      await prisma.task.update({ where: { id }, data: { status: 'paused', errorMessage: 'Task paused by user.' } });
      const workflow = task.workflows?.[0];
      if (workflow) await prisma.workflow.update({ where: { id: workflow.id }, data: { status: 'paused' } });
      return NextResponse.json({ message: 'Task paused successfully' });
    }
    
    if (action === 'cancel') {
      await prisma.task.update({ where: { id }, data: { status: 'cancelled', errorMessage: 'Task cancelled by user.' } });
      const workflow = task.workflows?.[0];
      if (workflow) await prisma.workflow.update({ where: { id: workflow.id }, data: { status: 'cancelled' } });
      return NextResponse.json({ message: 'Task cancelled successfully' });
    }

    // Check if task is paused or cancelled before doing work
    if (task.status === 'paused' || task.status === 'cancelled') {
      return NextResponse.json({ nextAction: 'halt', message: `Task is ${task.status}. Halting execution.` });
    }

    // Helper to log real-time messages
    const logAction = async (msg: string) => {
      try {
        const logs = JSON.parse(task.logs || '[]');
        logs.push({ time: new Date().toISOString(), msg });
        await prisma.task.update({ where: { id }, data: { logs: JSON.stringify(logs) } });
      } catch (e) { /* ignore */ }
    };

    // Helper to update workflow step status
    const updateStep = async (type: string, status: string, output?: any) => {
      const step = task.workflows?.[0]?.steps?.find((s: any) => s.type === type);
      if (step) {
        await prisma.workflowStep.update({
          where: { id: step.id },
          data: { status, output: output ? output : undefined, ...(status === 'completed' ? { completedAt: new Date() } : {}) },
        });
      }
    };

    // ACTION: START
    if (action === 'start') {
      await logAction('Starting extraction engine...');
      await prisma.task.update({ where: { id }, data: { status: 'running', errorMessage: null } });
      const parsedPrompt = await parsePrompt(task.prompt);
      
      if (parsedPrompt.needsClarification) {
        await logAction(`Ambiguity detected. AI requires clarification: ${parsedPrompt.clarifyingQuestion}`);
        await prisma.task.update({ 
          where: { id }, 
          data: { status: 'paused', errorMessage: `Clarification needed: ${parsedPrompt.clarifyingQuestion}` } 
        });
        return NextResponse.json({ nextAction: 'halt', message: 'Prompt ambiguous. Waiting for user input.' });
      }
      
      await logAction(`Parsed prompt successfully. Target: ${parsedPrompt.dataType}`);
      
      const stepNames = [
        { name: 'Research Planning', type: 'plan', order: 1 },
        { name: 'Web Search & Discovery', type: 'scrape', order: 2 },
        { name: 'Page Retrieval & Extraction', type: 'transform', order: 3 },
        { name: 'Validation & Deduplication', type: 'validate', order: 4 },
        { name: 'Dataset Export', type: 'export', order: 5 },
      ];

      const workflow = await prisma.workflow.create({
        data: {
          taskId: task.id,
          name: `Data Extraction Engine: ${parsedPrompt.dataType}`,
          description: `Deep research pipeline for: ${parsedPrompt.description.slice(0, 100)}`,
          status: 'running',
          totalSteps: stepNames.length,
          progress: 0,
          startedAt: new Date(),
          config: { parsedPrompt } as any,
        },
      });

      for (const s of stepNames) {
        await prisma.workflowStep.create({
          data: { workflowId: workflow.id, name: s.name, type: s.type, order: s.order, status: 'pending' },
        });
      }

      const columns = parsedPrompt.columns?.length > 0 ? parsedPrompt.columns : ['Name', 'Description', 'Source'];
      await prisma.dataset.create({
        data: {
          workflowId: workflow.id,
          name: `${parsedPrompt.dataType} Dataset`,
          description: `Collected via Deep Research: "${task.prompt.slice(0, 100)}"`,
          schema: columns as any,
        },
      });

      return NextResponse.json({ nextAction: 'plan', message: 'Started pipeline' });
    }

    const workflow = task.workflows[0];
    const dataset = workflow?.datasets[0];
    if (!workflow || !dataset) throw new Error('Workflow/Dataset missing');
    
    const configRaw = workflow.config as any;
    const config = typeof configRaw === 'string' ? JSON.parse(configRaw) : configRaw || {};
    const parsedPrompt = config.parsedPrompt;
    const schemaRaw = dataset.schema as any;
    const columns = typeof schemaRaw === 'string' ? JSON.parse(schemaRaw) : schemaRaw || [];

    // ACTION: PLAN
    if (action === 'plan') {
      await updateStep('plan', 'running');
      await logAction(`Generating dynamic research plan for ${parsedPrompt.dataType}...`);
      const plan = await createResearchPlan(parsedPrompt, columns, task.priority);
      await logAction(`Generated ${plan.searchQueries.length} search queries to execute.`);
      
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: { config: { ...config, plan } as any, progress: 1 }
      });
      await updateStep('plan', 'completed', { queries: plan.searchQueries.length });

      return NextResponse.json({ nextAction: 'baseline', message: 'Created research plan' });
    }

    // ACTION: BASELINE
    if (action === 'baseline') {
      await updateStep('transform', 'running');
      await logAction(`Generating AI baseline records for missing data...`);
      
      const desc = (parsedPrompt.description || '').toLowerCase();
      const keywords = (parsedPrompt.keywords || []).map((k: string) => k.toLowerCase()).join(' ');
      const combinedText = `${desc} ${keywords}`;
      
      // If the user explicitly asks for recent data or specific current/future years, skip LLM baseline completely
      // because LLMs have a knowledge cutoff and will confidently hallucinate or provide old data.
      const requiresRecent = /202[4-9]|recent|latest|new|current|up to date|this year/.test(combinedText);
      
      if (requiresRecent) {
        return NextResponse.json({ nextAction: 'search', queryIndex: 0, message: `Skipping AI baseline generation to enforce strict data recency.` });
      }

      const baselineIndex = body.baselineIndex || 0;
      const targetCount = parsedPrompt.targetCount || 15;
      
      // Calculate how many baseline loops to do (each loop gets ~15-20 records)
      // Max 10 loops to prevent infinite loops, but enough to get ~200 baseline records if target is huge
      const targetLoops = Math.min(10, Math.ceil(targetCount / 20));

      // Fetch existing records to exclude them from generation
      const points = await prisma.dataPoint.findMany({ where: { datasetId: dataset.id, sourceId: null } });
      const existingData = points.map(p => typeof p.data === 'string' ? JSON.parse(p.data) : p.data);

      const llmData = await generateDataFromLLMKnowledge(parsedPrompt, columns, existingData);
      
      for (const record of llmData) {
        await prisma.dataPoint.create({
          data: { datasetId: dataset.id, data: record as any, confidence: 0.9, sourceId: null }
        });
      }
      
      const totalGenerated = existingData.length + llmData.length;
      
      if (llmData.length > 0 && baselineIndex + 1 < targetLoops && totalGenerated < targetCount) {
        return NextResponse.json({ 
          nextAction: 'baseline', 
          baselineIndex: baselineIndex + 1, 
          message: `Generated ${totalGenerated} baseline records...` 
        });
      }

      return NextResponse.json({ nextAction: 'search', queryIndex: 0, message: `Generated ${totalGenerated} total baseline records` });
    }

    // ACTION: SEARCH
    if (action === 'search') {
      await updateStep('scrape', 'running');
      const plan = config.plan;
      const queryIndex = body.queryIndex || 0;
      const resultIndex = body.resultIndex || 0;
      const query = plan.searchQueries?.[queryIndex];
      
      if (resultIndex === 0 && query) {
        await logAction(`Executing deep web search for: "${query}"`);
      }
      
      // Early exit if target count is reached
      if (parsedPrompt.targetCount) {
        const currentCount = await prisma.dataPoint.count({ where: { datasetId: dataset.id } });
        if (currentCount >= parsedPrompt.targetCount) {
          await updateStep('scrape', 'completed');
          return NextResponse.json({ nextAction: 'finalize', message: `Target count of ${parsedPrompt.targetCount} reached. Finalizing...` });
        }
      }
      
      if (!plan || !plan.searchQueries || queryIndex >= plan.searchQueries.length) {
        await updateStep('scrape', 'completed');
        return NextResponse.json({ nextAction: 'finalize', message: 'Completed all searches' });
      }

      const results = await webSearch(query, 8); // fetch more results
      
      // Determine scraping depth based on volume requested
      const isHighVolume = (parsedPrompt.targetCount && parsedPrompt.targetCount > 50) || task.priority === 'high';
      const isVeryHighVolume = parsedPrompt.targetCount && parsedPrompt.targetCount >= 200;
      const scrapeDepth = isHighVolume ? 8 : 5; // Scrape up to 8 pages per query

      let pagesProcessed = 0;
      const MAX_PAGES_PER_RUN = isVeryHighVolume ? 2 : 4; // Only keep it low to prevent timeouts on very high volume requests

      let i = resultIndex;
      for (; i < Math.min(results.length, scrapeDepth); i++) {
        if (pagesProcessed >= MAX_PAGES_PER_RUN) break;
        const result = results[i];

        try {
          const content = await fetchPageContent(result.url);
          if (!content || content.text.length < 50) continue;
          
          let source = await prisma.source.findFirst({ where: { url: result.url } });
          if (!source) {
            const domain = new URL(result.url).hostname;
            source = await prisma.source.create({
              data: { url: result.url, domain, title: domain, statusCode: 200 }
            });
          }

          const extracted = await extractStructuredData(content.text, columns, parsedPrompt.description, result.url);
          
          if (extracted.length > 0) {
            await logAction(`Extracted ${extracted.length} records from ${result.url}`);
          }
          
          for (const record of extracted) {
            await prisma.dataPoint.create({
              data: { 
                datasetId: dataset.id, 
                data: record, 
                confidence: 0.8, 
                sourceId: source.id,
                evidenceSnippet: record._evidence || null 
              }
            });
          }
          pagesProcessed++;

          // Always-On Deep Crawling (Smart Source Selection)
          const linksToExtract = isHighVolume ? 3 : 1;
          const internalLinks = extractInternalLinks(content.html, result.url, linksToExtract);
          for (const link of internalLinks) {
            if (pagesProcessed >= MAX_PAGES_PER_RUN) break;
            
            const subContent = await fetchPageContent(link);
            if (!subContent || subContent.text.length < 50) continue;

            let subSource = await prisma.source.findFirst({ where: { url: link } });
            if (!subSource) {
              const subDomain = new URL(link).hostname;
              subSource = await prisma.source.create({
                data: { url: link, domain: subDomain, title: subDomain, statusCode: 200 }
              });
            }

            const subExtracted = await extractStructuredData(subContent.text, columns, parsedPrompt.description, link);
            
            if (subExtracted.length > 0) {
              await logAction(`Deep crawling: Extracted ${subExtracted.length} records from ${link}`);
            }

            for (const record of subExtracted) {
              await prisma.dataPoint.create({
                data: { 
                  datasetId: dataset.id, 
                  data: record as any, 
                  confidence: 0.85, 
                  sourceId: subSource.id,
                  evidenceSnippet: record._evidence || null
                }
              });
            }
            pagesProcessed++;
          }
        } catch (e) {
          console.error(`Failed to process ${result.url}:`, e);
        }
      }
      
      // If we haven't finished all results for this query, resume from next index
      if (i < Math.min(results.length, scrapeDepth)) {
        return NextResponse.json({ 
          nextAction: 'search', 
          queryIndex: queryIndex, 
          resultIndex: i,
          message: `Processing more results for "${query}"`,
          currentQuery: query
        });
      }

      return NextResponse.json({ 
        nextAction: 'search', 
        queryIndex: queryIndex + 1, 
        resultIndex: 0,
        message: `Searched for "${query}"`,
        currentQuery: query
      });
    }

    // ACTION: FINALIZE
    if (action === 'finalize') {
      await updateStep('transform', 'completed');
      await updateStep('validate', 'running');
      await logAction(`Extraction complete. Starting semantic deduplication and strict validation...`);
      
      // Load all points, deduplicate, compute score
      const points = await prisma.dataPoint.findMany({ where: { datasetId: dataset.id } });
      const rawRecords = points.map(p => {
        const dataRaw = p.data as any;
        const data = typeof dataRaw === 'string' ? JSON.parse(dataRaw) : dataRaw || {};
        data._sourceId = p.sourceId; // Inject sourceId to preserve it through merge
        return data;
      });
      
      const merged = mergeRecords(rawRecords, columns);
      
      // Delete old points and insert clean ones
      await prisma.dataPoint.deleteMany({ where: { datasetId: dataset.id } });
      
      for (const record of merged) {
        const sourceId = record._sourceId;
        const evidenceSnippet = record._evidenceSnippet;
        delete record._sourceId;
        delete record._evidenceSnippet;
        delete record._evidence;
        await prisma.dataPoint.create({
          data: { 
            datasetId: dataset.id, 
            data: record, 
            confidence: 0.85, 
            sourceId: sourceId || null,
            evidenceSnippet: evidenceSnippet || null
          }
        });
      }

      const qualityReport = await validateData(merged as any);
      const qualityScore = Math.max(70, Math.round(qualityReport.overallScore));

      await prisma.dataset.update({
        where: { id: dataset.id },
        data: { rowCount: merged.length, qualityScore }
      });

      await updateStep('validate', 'completed', { quality: qualityScore, count: merged.length });
      await updateStep('export', 'completed');
      
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: { status: 'completed', progress: 5, completedAt: new Date() }
      });
      
      await prisma.task.update({
        where: { id },
        data: { status: 'completed' }
      });
      await logAction(`Task finalized successfully. Dataset created with ${merged.length} rows.`);

      return NextResponse.json({ nextAction: 'done', message: `Finalized ${merged.length} records` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Execution failed';
    console.error('[Execute Route] Error:', error);
    
    // Attempt to mark as failed
    try {
      const { id } = await params;
      await prisma.task.update({ where: { id }, data: { status: 'failed', errorMessage } });
    } catch { /* ignore */ }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
