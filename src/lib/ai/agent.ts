import { generateAIContent } from './client';
import { webSearch, fetchPageContent, SearchResult } from './search';
import { extractStructuredData, mergeRecords } from './extractor';
import { ParsedPrompt } from './prompt-parser';

export interface AgentStep {
  type: 'plan' | 'search' | 'retrieve' | 'extract' | 'validate' | 'synthesize';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface AgentResult {
  data: Record<string, string>[];
  steps: AgentStep[];
  sourcesUsed: string[];
  totalSearches: number;
  totalPagesScraped: number;
  quality: number;
}

interface ResearchPlan {
  searchQueries: string[];
  targetSites: string[];
  extractionStrategy: string;
  expectedColumns: string[];
}

/**
 * Agentic RAG Orchestrator
 * 
 * Multi-step AI agent that:
 * 1. PLANS: Creates a research plan with multiple search strategies
 * 2. SEARCHES: Executes web searches across multiple queries
 * 3. RETRIEVES: Fetches and parses the most relevant pages
 * 4. EXTRACTS: Uses LLM to extract structured data from each page
 * 5. VALIDATES: Cross-references data, removes duplicates
 * 6. SYNTHESIZES: Fills gaps by doing targeted follow-up searches
 */
export async function runAgenticRAG(
  parsed: ParsedPrompt,
  onStep?: (step: AgentStep) => void
): Promise<AgentResult> {
  const steps: AgentStep[] = [];
  const allData: Record<string, string>[] = [];
  const sourcesUsed: string[] = [];
  let totalSearches = 0;
  let totalPages = 0;

  const columns = parsed.columns?.length > 0
    ? parsed.columns
    : ['Name', 'Description', 'Source'];

  const addStep = (step: AgentStep) => {
    steps.push(step);
    onStep?.(step);
  };

  const updateStep = (index: number, updates: Partial<AgentStep>) => {
    Object.assign(steps[index], updates);
    onStep?.(steps[index]);
  };

  // ===== STEP 1: PLAN =====
  addStep({ type: 'plan', description: 'Creating research plan...', status: 'running', startedAt: new Date() });
  const plan = await createResearchPlan(parsed, columns);
  updateStep(0, {
    status: 'completed',
    result: `${plan.searchQueries.length} queries, ${plan.targetSites.length} target sites`,
    completedAt: new Date(),
  });

  // ===== STEP 2: SEARCH =====
  addStep({ type: 'search', description: 'Searching the web...', status: 'running', startedAt: new Date() });
  const allSearchResults: SearchResult[] = [];

  for (const query of plan.searchQueries.slice(0, 5)) {
    const results = await webSearch(query, 6);
    allSearchResults.push(...results);
    totalSearches++;
    await sleep(500); // Be polite
  }

  // Deduplicate URLs
  const uniqueUrls = new Map<string, SearchResult>();
  for (const r of allSearchResults) {
    if (!uniqueUrls.has(r.url)) {
      uniqueUrls.set(r.url, r);
    }
  }

  // Prioritize target sites
  const sortedResults = [...uniqueUrls.values()].sort((a, b) => {
    const aMatch = plan.targetSites.some(site => a.domain.includes(site));
    const bMatch = plan.targetSites.some(site => b.domain.includes(site));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  updateStep(1, {
    status: 'completed',
    result: `Found ${sortedResults.length} unique results from ${totalSearches} searches`,
    completedAt: new Date(),
  });

  // ===== STEP 3: RETRIEVE + EXTRACT =====
  addStep({ type: 'retrieve', description: 'Fetching and extracting data from pages...', status: 'running', startedAt: new Date() });

  const pagesToFetch = sortedResults.slice(0, 8); // Max 8 pages
  
  for (const result of pagesToFetch) {
    try {
      const content = await fetchPageContent(result.url);
      if (!content || content.text.length < 100) continue;
      totalPages++;

      // Use LLM to extract structured data
      const extracted = await extractStructuredData(
        content.text,
        columns,
        parsed.description,
        result.url
      );

      if (extracted.length > 0) {
        allData.push(...extracted);
        sourcesUsed.push(result.url);
      }

      await sleep(1000); // Rate limit
    } catch (error) {
      console.error(`[Agent] Failed to process ${result.url}:`, error);
    }
  }

  updateStep(2, {
    status: 'completed',
    result: `Extracted ${allData.length} records from ${totalPages} pages`,
    completedAt: new Date(),
  });

  // ===== STEP 4: VALIDATE + DEDUPLICATE =====
  addStep({ type: 'validate', description: 'Validating and deduplicating...', status: 'running', startedAt: new Date() });
  const mergedData = mergeRecords(allData, columns);
  updateStep(3, {
    status: 'completed',
    result: `${mergedData.length} unique records (removed ${allData.length - mergedData.length} duplicates)`,
    completedAt: new Date(),
  });

  // ===== STEP 5: SYNTHESIZE (fill gaps if needed) =====
  if (mergedData.length < 5 && parsed.targetCount !== 0) {
    addStep({ type: 'synthesize', description: 'Running follow-up searches to fill gaps...', status: 'running', startedAt: new Date() });

    // Create more specific follow-up queries
    const followUpQueries = await generateFollowUpQueries(parsed, mergedData.length);
    
    for (const query of followUpQueries.slice(0, 3)) {
      const results = await webSearch(query, 5);
      totalSearches++;

      for (const r of results.slice(0, 3)) {
        if (sourcesUsed.includes(r.url)) continue;
        try {
          const content = await fetchPageContent(r.url);
          if (!content || content.text.length < 100) continue;
          totalPages++;

          const extracted = await extractStructuredData(
            content.text, columns, parsed.description, r.url
          );
          if (extracted.length > 0) {
            allData.push(...extracted);
            sourcesUsed.push(r.url);
          }
          await sleep(1000);
        } catch { /* skip */ }
      }
    }

    const finalMerged = mergeRecords([...mergedData, ...allData], columns);
    updateStep(4, {
      status: 'completed',
      result: `Final: ${finalMerged.length} records after follow-up`,
      completedAt: new Date(),
    });

    // Compute quality
    const quality = computeQuality(finalMerged, columns);

    return {
      data: finalMerged,
      steps,
      sourcesUsed,
      totalSearches,
      totalPagesScraped: totalPages,
      quality,
    };
  }

  const quality = computeQuality(mergedData, columns);

  return {
    data: mergedData,
    steps,
    sourcesUsed,
    totalSearches,
    totalPagesScraped: totalPages,
    quality,
  };
}

/**
 * Step 1: Use LLM to create a research plan
 */
async function createResearchPlan(parsed: ParsedPrompt, columns: string[]): Promise<ResearchPlan> {
  try {
    const prompt = `Create a web research plan for collecting this data:

TASK: ${parsed.description}
DATA TYPE: ${parsed.dataType}
COLUMNS NEEDED: ${JSON.stringify(columns)}
KEYWORDS: ${JSON.stringify(parsed.keywords)}

Return a JSON object (no markdown, no backticks):
{
  "searchQueries": ["5-7 specific web search queries that will find this data"],
  "targetSites": ["domains most likely to have this data, e.g. crunchbase.com, linkedin.com"],
  "extractionStrategy": "brief description of how to extract the data",
  "expectedColumns": ["the column names we expect to fill"]
}

Make search queries SPECIFIC and VARIED. Include:
- Direct queries: "deep tech startup founders email"
- Site-specific: "site:crunchbase.com deep tech startups 2024"
- List queries: "list of deep tech companies founders"
- Data-specific: "deep tech startup CEO linkedin profile"`;

    const response = await generateAIContent(
      'You create web research plans. Return ONLY valid JSON. No markdown.',
      prompt
    );

    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as ResearchPlan;
  } catch (error) {
    console.error('[Agent] Plan creation failed, using fallback:', error);
    // Fallback plan
    const baseQuery = parsed.keywords.join(' ') || parsed.description.slice(0, 50);
    return {
      searchQueries: [
        baseQuery,
        `${baseQuery} list data`,
        `${baseQuery} directory`,
        `site:crunchbase.com ${baseQuery}`,
        `${parsed.dataType} database ${parsed.keywords[0] || ''}`,
      ],
      targetSites: ['crunchbase.com', 'linkedin.com', 'techcrunch.com', 'wikipedia.org'],
      extractionStrategy: 'Extract structured data from search results and linked pages',
      expectedColumns: columns,
    };
  }
}

/**
 * Generate follow-up queries when initial results are insufficient
 */
async function generateFollowUpQueries(parsed: ParsedPrompt, currentCount: number): Promise<string[]> {
  try {
    const prompt = `I'm collecting ${parsed.dataType} data but only found ${currentCount} records so far.
Original task: ${parsed.description}

Generate 3 DIFFERENT search queries that might find MORE results. Be creative — try different angles, synonyms, or related terms.
Return ONLY a JSON array of strings. No markdown.`;

    const response = await generateAIContent(
      'Return ONLY a JSON array of search query strings. No markdown.',
      prompt
    );
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return [
      `${parsed.dataType} list directory`,
      `top ${parsed.keywords[0] || parsed.dataType} 2024`,
      `${parsed.description.slice(0, 40)} database`,
    ];
  }
}

/**
 * Compute data quality score
 */
function computeQuality(data: Record<string, string>[], columns: string[]): number {
  if (data.length === 0) return 0;

  let totalFilled = 0;
  let totalFields = 0;

  for (const row of data) {
    for (const col of columns) {
      totalFields++;
      if (row[col] && row[col].trim().length > 0) {
        totalFilled++;
      }
    }
  }

  const completeness = (totalFilled / totalFields) * 100;

  // Check uniqueness of first column
  const firstCol = columns[0];
  const uniqueFirst = new Set(data.map(r => (r[firstCol] || '').toLowerCase())).size;
  const uniqueness = (uniqueFirst / data.length) * 100;

  return Math.round((completeness * 0.6 + uniqueness * 0.4));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
