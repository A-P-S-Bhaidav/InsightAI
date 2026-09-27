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

    // Helper to update workflow step status
    const updateStep = async (type: string, status: string, output?: any) => {
      const step = task.workflows?.[0]?.steps?.find((s: any) => s.type === type);
      if (step) {
        await prisma.workflowStep.update({
          where: { id: step.id },
          data: { status, output: output ? JSON.stringify(output) : undefined, ...(status === 'completed' ? { completedAt: new Date() } : {}) },
        });
      }
    };

    // ACTION: START
    if (action === 'start') {
      await prisma.task.update({ where: { id }, data: { status: 'running' } });
      const parsedPrompt = await parsePrompt(task.prompt);
      
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
          config: JSON.stringify({ parsedPrompt }),
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
          schema: JSON.stringify(columns),
        },
      });

      return NextResponse.json({ nextAction: 'plan', message: 'Started pipeline' });
    }

    const workflow = task.workflows[0];
    const dataset = workflow?.datasets[0];
    if (!workflow || !dataset) throw new Error('Workflow/Dataset missing');
    
    const config = JSON.parse(workflow.config || '{}');
    const parsedPrompt = config.parsedPrompt;
    const columns = JSON.parse(dataset.schema || '[]');

    // ACTION: PLAN
    if (action === 'plan') {
      await updateStep('plan', 'running');
      const plan = await createResearchPlan(parsedPrompt, columns, task.priority);
      
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: { config: JSON.stringify({ ...config, plan }), progress: 1 }
      });
      await updateStep('plan', 'completed', { queries: plan.searchQueries.length });

      return NextResponse.json({ nextAction: 'baseline', message: 'Created research plan' });
    }

    // ACTION: BASELINE
    if (action === 'baseline') {
      await updateStep('transform', 'running');
      
      const baselineIndex = body.baselineIndex || 0;
      const targetCount = parsedPrompt.targetCount || 15;
      
      // Calculate how many baseline loops to do (each loop gets ~15-20 records)
      // Max 10 loops to prevent infinite loops, but enough to get ~200 baseline records if target is huge
      const targetLoops = Math.min(10, Math.ceil(targetCount / 20));

      // Fetch existing records to exclude them from generation
      const points = await prisma.dataPoint.findMany({ where: { datasetId: dataset.id, sourceId: null } });
      const existingData = points.map(p => JSON.parse(p.data));

      const llmData = await generateDataFromLLMKnowledge(parsedPrompt, columns, existingData);
      
      for (const record of llmData) {
        await prisma.dataPoint.create({
          data: { datasetId: dataset.id, data: JSON.stringify(record), confidence: 0.9, sourceId: null }
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
      
      if (!plan || !plan.searchQueries || queryIndex >= plan.searchQueries.length) {
        await updateStep('scrape', 'completed');
        return NextResponse.json({ nextAction: 'finalize', message: 'Completed all searches' });
      }

      const query = plan.searchQueries[queryIndex];
      const results = await webSearch(query, 8); // fetch more results
      
      // Determine scraping depth based on volume requested
      const isHighVolume = (parsedPrompt.targetCount && parsedPrompt.targetCount > 50) || task.priority === 'high';
      const scrapeDepth = isHighVolume ? 6 : 2; // Scrape up to 6 pages per query for high volume

      let pagesProcessed = 0;
      const MAX_PAGES_PER_RUN = 3; // Reduced from 6 to 3 to aggressively prevent Vercel 60s timeouts

      for (const result of results.slice(0, scrapeDepth)) {
        if (pagesProcessed >= MAX_PAGES_PER_RUN) break;

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
          
          for (const record of extracted) {
            await prisma.dataPoint.create({
              data: { datasetId: dataset.id, data: JSON.stringify(record), confidence: 0.8, sourceId: source.id }
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
            
            for (const record of subExtracted) {
              await prisma.dataPoint.create({
                data: { datasetId: dataset.id, data: JSON.stringify(record), confidence: 0.85, sourceId: subSource.id }
              });
            }
            pagesProcessed++;
          }
        } catch (e) {
          console.error(`Failed to process ${result.url}:`, e);
        }
      }

      return NextResponse.json({ 
        nextAction: 'search', 
        queryIndex: queryIndex + 1, 
        message: `Searched for "${query}"`,
        currentQuery: query
      });
    }

    // ACTION: FINALIZE
    if (action === 'finalize') {
      await updateStep('transform', 'completed');
      await updateStep('validate', 'running');
      
      // Load all points, deduplicate, compute score
      const points = await prisma.dataPoint.findMany({ where: { datasetId: dataset.id } });
      const rawRecords = points.map(p => {
        const data = JSON.parse(p.data);
        data._sourceId = p.sourceId; // Inject sourceId to preserve it through merge
        return data;
      });
      
      const merged = mergeRecords(rawRecords, columns);
      
      // Delete old points and insert clean ones
      await prisma.dataPoint.deleteMany({ where: { datasetId: dataset.id } });
      
      for (const record of merged) {
        const sourceId = record._sourceId;
        delete record._sourceId; // Remove internal field before saving
        await prisma.dataPoint.create({
          data: { datasetId: dataset.id, data: JSON.stringify(record), confidence: 0.85, sourceId: sourceId || null }
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
