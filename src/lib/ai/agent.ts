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
 * 6. SYNTHESIZES: If web data is insufficient, uses LLM knowledge as fallback
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
  console.log(`[Agent] Plan created: ${plan.searchQueries.length} queries, ${plan.targetSites.length} target sites`);
  console.log(`[Agent] Queries: ${JSON.stringify(plan.searchQueries)}`);
  updateStep(0, {
    status: 'completed',
    result: `${plan.searchQueries.length} queries, ${plan.targetSites.length} target sites`,
    completedAt: new Date(),
  });

  // ===== STEP 2: SEARCH =====
  addStep({ type: 'search', description: 'Searching the web...', status: 'running', startedAt: new Date() });
  const allSearchResults: SearchResult[] = [];

  for (const query of plan.searchQueries.slice(0, 4)) {
    try {
      const results = await webSearch(query, 6);
      allSearchResults.push(...results);
      totalSearches++;
      console.log(`[Agent] Query "${query}" returned ${results.length} results`);
    } catch (error) {
      console.error(`[Agent] Search failed for "${query}":`, error);
    }
    await sleep(300);
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

  console.log(`[Agent] Total unique URLs after dedup: ${sortedResults.length}`);
  updateStep(1, {
    status: 'completed',
    result: `Found ${sortedResults.length} unique results from ${totalSearches} searches`,
    completedAt: new Date(),
  });

  // ===== STEP 3: RETRIEVE + EXTRACT =====
  addStep({ type: 'retrieve', description: 'Fetching and extracting data from pages...', status: 'running', startedAt: new Date() });

  const pagesToFetch = sortedResults.slice(0, 5);
  
  // Fetch pages concurrently (2 at a time) for speed
  for (let i = 0; i < pagesToFetch.length; i += 2) {
    const batch = pagesToFetch.slice(i, i + 2);
    const batchPromises = batch.map(async (result) => {
      try {
        const content = await fetchPageContent(result.url);
        if (!content || content.text.length < 50) {
          console.warn(`[Agent] Skipping ${result.url} — too little content (${content?.text.length || 0} chars)`);
          return;
        }
        totalPages++;

        // Use LLM to extract structured data
        const extracted = await extractStructuredData(
          content.text,
          columns,
          parsed.description,
          result.url
        );

        console.log(`[Agent] Extracted ${extracted.length} records from ${result.url}`);

        if (extracted.length > 0) {
          allData.push(...extracted);
          sourcesUsed.push(result.url);
        }
      } catch (error) {
        console.error(`[Agent] Failed to process ${result.url}:`, error);
      }
    });

    await Promise.all(batchPromises);
  }

  console.log(`[Agent] Total extracted records after scraping: ${allData.length}`);
  updateStep(2, {
    status: 'completed',
    result: `Extracted ${allData.length} records from ${totalPages} pages`,
    completedAt: new Date(),
  });

  // ===== STEP 4: VALIDATE + DEDUPLICATE =====
  addStep({ type: 'validate', description: 'Validating and deduplicating...', status: 'running', startedAt: new Date() });
  let mergedData = mergeRecords(allData, columns);
  console.log(`[Agent] After dedup: ${mergedData.length} records (removed ${allData.length - mergedData.length} duplicates)`);
  updateStep(3, {
    status: 'completed',
    result: `${mergedData.length} unique records (removed ${allData.length - mergedData.length} duplicates)`,
    completedAt: new Date(),
  });

  // ===== STEP 5: SYNTHESIZE / LLM KNOWLEDGE FALLBACK =====
  // If web scraping returned too few results, use Gemini's own knowledge
  if (mergedData.length < 5) {
    addStep({ type: 'synthesize', description: 'Augmenting with AI knowledge...', status: 'running', startedAt: new Date() });
    console.log(`[Agent] Only ${mergedData.length} records from web. Running LLM knowledge fallback...`);

    try {
      const llmData = await generateDataFromLLMKnowledge(parsed, columns, mergedData);
      console.log(`[Agent] LLM knowledge fallback returned ${llmData.length} records`);

      if (llmData.length > 0) {
        // Merge LLM data with web data, web data takes priority
        const combined = [...mergedData, ...llmData];
        mergedData = mergeRecords(combined, columns);
        sourcesUsed.push('AI Knowledge Base');
      }
    } catch (error) {
      console.error('[Agent] LLM knowledge fallback failed:', error);
    }

    updateStep(steps.length - 1, {
      status: 'completed',
      result: `Final: ${mergedData.length} records after AI augmentation`,
      completedAt: new Date(),
    });
  }

  const quality = computeQuality(mergedData, columns);
  console.log(`[Agent] Final result: ${mergedData.length} records, quality: ${quality}`);

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
 * Use LLM's training knowledge to generate data when web scraping fails.
 * This is a fallback — clearly marked as "AI Knowledge" source.
 */
async function generateDataFromLLMKnowledge(
  parsed: ParsedPrompt,
  columns: string[],
  existingData: Record<string, string>[]
): Promise<Record<string, string>[]> {
  const existingNames = existingData
    .map(r => r[columns[0]] || '')
    .filter(n => n.length > 0);

  const excludeClause = existingNames.length > 0
    ? `\nDo NOT include these (already collected): ${existingNames.join(', ')}`
    : '';

  const prompt = `You are a knowledgeable data research assistant. Based on your training knowledge, provide real, factual data matching this request.

TASK: ${parsed.description}
DATA TYPE: ${parsed.dataType}
REQUIRED COLUMNS: ${JSON.stringify(columns)}
${excludeClause}

INSTRUCTIONS:
1. Provide 10-20 REAL, FACTUAL records based on your knowledge
2. Each record must have values for ALL columns: ${JSON.stringify(columns)}
3. Only include information you are confident is accurate
4. Return ONLY a valid JSON array — no markdown, no backticks, no explanation
5. Every value must be a string

Example format:
[{"${columns[0]}": "Example Value", "${columns.length > 1 ? columns[1] : 'Description'}": "Example"}]`;

  const response = await generateAIContent(
    'You are a factual data provider. Return ONLY a valid JSON array of real data. No markdown. No backticks.',
    prompt
  );

  // Clean and parse
  let cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/\n?```/g, '')
    .trim();

  if (!cleaned.startsWith('[')) {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) cleaned = match[0];
    else return [];
  }

  const data = JSON.parse(cleaned);
  if (!Array.isArray(data)) return [];

  return data.map(row => {
    const record: Record<string, string> = {};
    for (const col of columns) {
      record[col] = String(row[col] ?? row[col.toLowerCase()] ?? '');
    }
    record['_source'] = 'AI Knowledge Base';
    return record;
  }).filter(row => columns.some(col => row[col] && row[col].length > 0));
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
- Direct queries: "list of deep tech startup founders 2024"
- Site-specific: "site:crunchbase.com deep tech startups"
- List queries: "top AI companies founders CEO name email"
- Data-specific: "deep tech startup CEO founder database"`;

    const response = await generateAIContent(
      'You create web research plans. Return ONLY valid JSON. No markdown.',
      prompt
    );

    let cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    if (!cleaned.startsWith('{')) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) cleaned = match[0];
    }
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
        `${parsed.dataType} database ${parsed.keywords[0] || ''}`,
        `list of ${parsed.dataType} 2024`,
      ],
      targetSites: ['crunchbase.com', 'linkedin.com', 'techcrunch.com', 'wikipedia.org'],
      extractionStrategy: 'Extract structured data from search results and linked pages',
      expectedColumns: columns,
    };
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
