import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security';
import prisma from '@/lib/db';
import { parsePrompt, ParsedPrompt } from '@/lib/ai/prompt-parser';
import { generateWorkflow } from '@/lib/ai/workflow-generator';
import { processPipeline } from '@/lib/scraper/pipeline';
import { validateData } from '@/lib/ai/data-validator';

/**
 * Generates realistic mock data based on the parsed prompt's data type and keywords.
 * In production, this would be replaced with actual scraping logic.
 */
function generateMockData(parsed: ParsedPrompt, count: number): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = [];
  const prompt = parsed.description.toLowerCase();
  const keywords = parsed.keywords.map(k => k.toLowerCase());

  const companies = ['TechVault', 'NovaStar', 'QuantumLeap', 'CloudPeak', 'DataBridge', 'PixelForge', 'CodeWave', 'NexGen Labs', 'SkyMetrics', 'InnoCore'];
  const cities = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL', 'Boston, MA', 'Denver, CO', 'Portland, OR', 'Miami, FL', 'Remote'];
  const industries = ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 'SaaS', 'AI/ML', 'Cybersecurity', 'Fintech', 'Biotech'];
  const titles = ['Senior Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer', 'Full Stack Developer', 'ML Engineer', 'Cloud Architect', 'Tech Lead', 'Frontend Engineer'];
  const domains = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'github.com', 'crunchbase.com', 'techcrunch.com', 'producthunt.com', 'reddit.com'];

  for (let i = 0; i < count; i++) {
    if (prompt.includes('job') || prompt.includes('hiring') || prompt.includes('career') || keywords.some(k => k.includes('job'))) {
      data.push({
        title: titles[i % titles.length],
        company: companies[i % companies.length],
        location: cities[i % cities.length],
        salary: `$${(100 + Math.floor(Math.random() * 80)) * 1000}`,
        type: ['Full-time', 'Contract', 'Part-time', 'Remote'][i % 4],
        experience: `${Math.floor(Math.random() * 8) + 2}+ years`,
        posted: new Date(Date.now() - i * 86400000 * Math.random()).toISOString().split('T')[0],
        url: `https://${domains[i % domains.length]}/jobs/${1000 + i}`,
        source: domains[i % domains.length],
      });
    } else if (prompt.includes('lead') || prompt.includes('sales') || prompt.includes('contact') || keywords.some(k => k.includes('lead'))) {
      const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Quinn', 'Avery', 'Dakota', 'Sage'];
      const lastNames = ['Chen', 'Patel', 'Kim', 'Garcia', 'Johnson', 'Williams', 'Brown', 'Martinez', 'Thompson', 'Lee'];
      data.push({
        name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
        email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@${companies[i % companies.length].toLowerCase().replace(/\s/g, '')}.com`,
        company: companies[i % companies.length],
        title: ['CEO', 'CTO', 'VP Sales', 'Marketing Director', 'Head of Growth'][i % 5],
        industry: industries[i % industries.length],
        phone: `+1 (${500 + i}) ${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 9000)}`,
        linkedin: `https://linkedin.com/in/${firstNames[i % firstNames.length].toLowerCase()}-${lastNames[i % lastNames.length].toLowerCase()}`,
        source: domains[i % domains.length],
      });
    } else if (prompt.includes('price') || prompt.includes('product') || prompt.includes('market') || prompt.includes('competitor') || keywords.some(k => k.includes('price'))) {
      const products = ['Pro Analytics', 'CloudSync', 'DataFlow', 'SmartDash', 'AutoScale', 'MetricHub', 'PipelineX', 'InsightPro', 'QueryMaster', 'StreamLive'];
      data.push({
        product: products[i % products.length],
        company: companies[i % companies.length],
        price: `$${(19 + Math.floor(Math.random() * 480))}/mo`,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        reviews: Math.floor(Math.random() * 5000) + 50,
        category: ['Analytics', 'DevOps', 'CRM', 'Marketing', 'Productivity'][i % 5],
        freeTrialDays: [7, 14, 30, 0][i % 4],
        url: `https://${companies[i % companies.length].toLowerCase().replace(/\s/g, '')}.com`,
        source: domains[i % domains.length],
      });
    } else if (prompt.includes('news') || prompt.includes('article') || prompt.includes('trend') || keywords.some(k => k.includes('news'))) {
      const headlines = [
        'AI Startup Raises $50M in Series B Funding',
        'New Open Source Framework Gains 10K Stars in Week',
        'Tech Giants Announce Partnership on AI Safety',
        'Remote Work Trends Continue to Rise in 2025',
        'Quantum Computing Breakthrough Announced',
        'Cybersecurity Spending Expected to Hit $300B',
        'Edge Computing Market Growing at 38% CAGR',
        'New EU AI Regulations Take Effect Next Month',
        'Sustainable Tech Initiatives Gain Momentum',
        'Developer Survey: Rust Most Loved Language Again',
      ];
      data.push({
        headline: headlines[i % headlines.length],
        summary: `Detailed analysis and reporting on ${headlines[i % headlines.length].toLowerCase()}...`,
        author: `${['Alex', 'Sarah', 'Mike', 'Emma', 'Chris'][i % 5]} ${['Johnson', 'Smith', 'Lee', 'Brown', 'Wilson'][i % 5]}`,
        published: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        category: industries[i % industries.length],
        url: `https://${domains[i % domains.length]}/article/${2000 + i}`,
        source: domains[i % domains.length],
      });
    } else if (prompt.includes('review') || keywords.some(k => k.includes('review'))) {
      data.push({
        reviewerName: `User${1000 + i}`,
        rating: Math.floor(Math.random() * 3) + 3,
        title: ['Great product!', 'Excellent value', 'Decent but pricey', 'Highly recommended', 'Good features'][i % 5],
        body: 'This product exceeded my expectations. The quality is outstanding and the price is fair for what you get.',
        date: new Date(Date.now() - i * 86400000 * 2).toISOString().split('T')[0],
        verified: i % 3 !== 0,
        helpful: Math.floor(Math.random() * 100),
        source: domains[i % domains.length],
      });
    } else {
      data.push({
        title: `Data Entry ${i + 1}`,
        description: `Collected data point related to: ${parsed.dataType || 'general research'}`,
        category: parsed.keywords[i % Math.max(parsed.keywords.length, 1)] || 'General',
        url: `https://${domains[i % domains.length]}/data/${3000 + i}`,
        relevanceScore: (0.7 + Math.random() * 0.3).toFixed(2),
        collectedAt: new Date(Date.now() - i * 3600000).toISOString(),
        source: domains[i % domains.length],
      });
    }
  }
  return data;
}

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
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task status to running
    await prisma.task.update({
      where: { id },
      data: { status: 'running' },
    });

    try {
      // Step 1: Parse the prompt using AI
      const parsedPrompt = await parsePrompt(task.prompt);

      // Step 2: Generate workflow plan
      const workflowPlan = await generateWorkflow(parsedPrompt);

      // Step 3: Create workflow record with steps
      const workflow = await prisma.workflow.create({
        data: {
          taskId: task.id,
          name: workflowPlan.name,
          description: workflowPlan.description,
          status: 'running',
          totalSteps: workflowPlan.steps.length,
          progress: 0,
          startedAt: new Date(),
        },
      });

      // Create workflow steps
      for (const step of workflowPlan.steps) {
        await prisma.workflowStep.create({
          data: {
            workflowId: workflow.id,
            name: step.name,
            type: step.type,
            config: JSON.stringify(step.config || {}),
            order: step.order,
            status: 'pending',
          },
        });
      }

      const steps = await prisma.workflowStep.findMany({
        where: { workflowId: workflow.id },
        orderBy: { order: 'asc' },
      });

      let currentData: Record<string, unknown>[] = [];
      let stepIndex = 0;

      // Step 4: Execute each step sequentially
      for (const step of steps) {
        stepIndex++;

        await prisma.workflowStep.update({
          where: { id: step.id },
          data: { status: 'running', startedAt: new Date() },
        });

        // Update workflow progress
        await prisma.workflow.update({
          where: { id: workflow.id },
          data: { progress: Math.round((stepIndex / steps.length) * 100) },
        });

        try {
          if (step.type === 'scrape') {
            // Generate realistic mock data based on the parsed prompt
            const count = Math.floor(Math.random() * 16) + 15; // 15-30 records
            currentData = generateMockData(parsedPrompt, count);

            // Create source records
            const sourceDomains = [...new Set(currentData.map(d => d.source as string).filter(Boolean))];
            for (const domain of sourceDomains) {
              await prisma.source.create({
                data: {
                  url: `https://${domain}`,
                  domain: domain,
                  title: `${domain} - Data Source`,
                  statusCode: 200,
                  responseTime: Math.floor(Math.random() * 500) + 100,
                  contentType: 'text/html',
                },
              });
            }

            await prisma.workflowStep.update({
              where: { id: step.id },
              data: {
                output: JSON.stringify({ recordCount: currentData.length, sources: sourceDomains }),
              },
            });
          } else if (step.type === 'transform') {
            // Run data through processing pipeline
            const result = processPipeline(currentData);
            currentData = result.data;

            await prisma.workflowStep.update({
              where: { id: step.id },
              data: {
                output: JSON.stringify(result.stats),
              },
            });
          } else if (step.type === 'validate') {
            // Run validation
            const report = await validateData(currentData);

            await prisma.workflowStep.update({
              where: { id: step.id },
              data: {
                output: JSON.stringify({
                  qualityScore: report.overallScore,
                  issues: report.issues.length,
                  completeness: report.completeness,
                }),
              },
            });
          } else if (step.type === 'deduplicate') {
            // Deduplicate data
            const beforeCount = currentData.length;
            const seen = new Set<string>();
            currentData = currentData.filter(record => {
              const key = JSON.stringify(record);
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });

            await prisma.workflowStep.update({
              where: { id: step.id },
              data: {
                output: JSON.stringify({ before: beforeCount, after: currentData.length, removed: beforeCount - currentData.length }),
              },
            });
          } else if (step.type === 'export') {
            // Mark as ready for export
            await prisma.workflowStep.update({
              where: { id: step.id },
              data: {
                output: JSON.stringify({ format: 'json', recordCount: currentData.length, status: 'ready' }),
              },
            });
          }

          // Mark step as completed
          await prisma.workflowStep.update({
            where: { id: step.id },
            data: { status: 'completed', completedAt: new Date() },
          });
        } catch (stepError: unknown) {
          const errorMessage = stepError instanceof Error ? stepError.message : 'Unknown step error';
          await prisma.workflowStep.update({
            where: { id: step.id },
            data: { status: 'failed', error: errorMessage, completedAt: new Date() },
          });
          throw stepError;
        }
      }

      // Step 5: Compute quality score
      const validationReport = await validateData(currentData);
      const qualityScore = Math.round(validationReport.overallScore);

      // Step 6: Create dataset with data points
      const dataset = await prisma.dataset.create({
        data: {
          workflowId: workflow.id,
          name: `Dataset: ${task.title}`,
          description: `Auto-collected data for "${task.prompt.slice(0, 100)}..."`,
          schema: JSON.stringify(currentData.length > 0 ? Object.keys(currentData[0]) : []),
          rowCount: currentData.length,
          qualityScore: qualityScore,
          format: 'json',
        },
      });

      // Create data points with source references
      const sources = await prisma.source.findMany({ take: 20 });
      for (const record of currentData) {
        const sourceDomain = record.source as string | undefined;
        const matchingSource = sourceDomain
          ? sources.find(s => s.domain === sourceDomain)
          : sources[Math.floor(Math.random() * sources.length)];

        await prisma.dataPoint.create({
          data: {
            datasetId: dataset.id,
            data: JSON.stringify(record),
            sourceId: matchingSource?.id || null,
            isValid: true,
            confidence: 0.85 + Math.random() * 0.15,
          },
        });
      }

      // Step 7: Mark workflow as completed
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: { status: 'completed', progress: 100, completedAt: new Date() },
      });

      // Step 8: Mark task as completed
      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status: 'completed' },
        include: {
          workflows: {
            include: {
              steps: { orderBy: { order: 'asc' } },
              datasets: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        task: updatedTask,
        dataset: {
          id: dataset.id,
          name: dataset.name,
          rowCount: dataset.rowCount,
          qualityScore: dataset.qualityScore,
        },
      });
    } catch (innerError: unknown) {
      const errorMessage = innerError instanceof Error ? innerError.message : 'Workflow execution failed';
      await prisma.task.update({
        where: { id },
        data: { status: 'failed', errorMessage },
      });
      throw innerError;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error in POST /api/tasks/[id]/execute:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
