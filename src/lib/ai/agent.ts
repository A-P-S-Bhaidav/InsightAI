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
 * Data Extraction Engine Orchestrator — Reliable Data Collection Pipeline
 * 
 * Strategy: LLM-First with Web Augmentation
 * 1. PLAN: Create research plan
 * 2. GENERATE: Use LLM knowledge to produce a strong baseline dataset
 * 3. SEARCH + SCRAPE: Try to find real web data to augment/verify
 * 4. MERGE: Combine LLM + web data, deduplicate
 * 5. VALIDATE: Score quality
 */
export async function runAgenticRAG(
  parsed: ParsedPrompt,
  onStep?: (step: AgentStep) => void
): Promise<AgentResult> {
  const steps: AgentStep[] = [];
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
  console.log(`[Agent] Plan: ${plan.searchQueries.length} queries`);
  updateStep(0, {
    status: 'completed',
    result: `${plan.searchQueries.length} queries, ${plan.targetSites.length} target sites`,
    completedAt: new Date(),
  });

  // ===== STEP 2: GENERATE BASELINE FROM LLM KNOWLEDGE =====
  // This is the most reliable data source — Gemini's training data
  addStep({ type: 'synthesize', description: 'Generating baseline dataset from AI knowledge...', status: 'running', startedAt: new Date() });
  let allData: Record<string, string>[] = [];
  
  try {
    const llmData = await generateDataFromLLMKnowledge(parsed, columns, []);
    console.log(`[Agent] LLM baseline: ${llmData.length} records`);
    allData.push(...llmData);
    if (llmData.length > 0) sourcesUsed.push('AI Knowledge Base');
  } catch (error) {
    console.error('[Agent] LLM baseline failed:', error);
  }

  updateStep(1, {
    status: 'completed',
    result: `Generated ${allData.length} baseline records from AI knowledge`,
    completedAt: new Date(),
  });

  // ===== STEP 3: WEB SEARCH + SCRAPE (augmentation) =====
  addStep({ type: 'search', description: 'Searching web for additional data...', status: 'running', startedAt: new Date() });
  
  const webData: Record<string, string>[] = [];
  try {
    const allSearchResults: SearchResult[] = [];
    
    for (const query of plan.searchQueries.slice(0, 3)) {
      try {
        const results = await webSearch(query, 5);
        allSearchResults.push(...results);
        totalSearches++;
        console.log(`[Agent] Search "${query.slice(0, 40)}..." → ${results.length} results`);
      } catch (error) {
        console.error(`[Agent] Search failed for "${query}":`, error);
      }
    }

    // Deduplicate URLs
    const uniqueUrls = new Map<string, SearchResult>();
    for (const r of allSearchResults) {
      if (!uniqueUrls.has(r.url)) uniqueUrls.set(r.url, r);
    }

    const sortedResults = [...uniqueUrls.values()].slice(0, 4);
    console.log(`[Agent] Fetching ${sortedResults.length} pages...`);

    // Fetch and extract from pages
    for (const result of sortedResults) {
      try {
        const content = await fetchPageContent(result.url);
        if (!content || content.text.length < 50) continue;
        totalPages++;

        const extracted = await extractStructuredData(
          content.text, columns, parsed.description, result.url
        );

        if (extracted.length > 0) {
          webData.push(...extracted);
          sourcesUsed.push(result.url);
          console.log(`[Agent] Extracted ${extracted.length} records from ${result.url}`);
        }
      } catch (error) {
        console.error(`[Agent] Failed to process ${result.url}:`, error);
      }
    }
  } catch (error) {
    console.error('[Agent] Web search phase failed:', error);
  }

  console.log(`[Agent] Web scraping produced ${webData.length} additional records`);
  updateStep(2, {
    status: 'completed',
    result: `Found ${webData.length} records from ${totalPages} web pages`,
    completedAt: new Date(),
  });

  // ===== STEP 4: MERGE + DEDUPLICATE =====
  addStep({ type: 'validate', description: 'Merging and deduplicating all data...', status: 'running', startedAt: new Date() });
  
  // Combine: web data takes priority (more likely to be current), then LLM data
  const combined = [...webData, ...allData];
  const mergedData = mergeRecords(combined, columns);
  
  console.log(`[Agent] Final merged: ${mergedData.length} unique records (${webData.length} web + ${allData.length} LLM, removed ${combined.length - mergedData.length} dupes)`);
  
  updateStep(3, {
    status: 'completed',
    result: `${mergedData.length} unique records after merge`,
    completedAt: new Date(),
  });

  const quality = computeQuality(mergedData, columns);
  console.log(`[Agent] DONE: ${mergedData.length} records, quality ${quality}%`);

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
 * Use LLM's training knowledge to generate factual data.
 * This is the PRIMARY data source — always produces results.
 */
export async function generateDataFromLLMKnowledge(
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

  const targetCount = parsed.targetCount || 15;

  const prompt = `You are a knowledgeable data research assistant. Based on your training knowledge, provide real, factual data matching this request.

TASK: ${parsed.description}
DATA TYPE: ${parsed.dataType}
REQUIRED COLUMNS: ${JSON.stringify(columns)}
TARGET: Provide at least ${targetCount} records
${excludeClause}

CRITICAL INSTRUCTIONS:
1. Provide ${targetCount}-${targetCount + 10} REAL, FACTUAL records
2. Each record MUST have ALL of these exact column keys: ${JSON.stringify(columns)}
3. Only include information you are confident is accurate
4. Return ONLY a valid JSON array — no markdown, no backticks, no explanation, no text before or after
5. Every value must be a string
6. Fill in as many columns as possible — empty strings only as last resort
7. Make sure the data is diverse and covers different entries

Your response must start with [ and end with ]`;

  const response = await generateAIContent(
    `You are a factual data provider. Return ONLY a valid JSON array of objects. Each object must have these exact keys: ${JSON.stringify(columns)}. No markdown. No backticks. No explanation. Start your response with [ and end with ].`,
    prompt
  );

  // Robust JSON extraction
  let cleaned = response.trim();
  
  // Strip markdown code fences
  cleaned = cleaned.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
  
  // Find the JSON array in the response
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  
  if (firstBracket === -1 || lastBracket === -1 || lastBracket <= firstBracket) {
    console.error('[Agent] LLM response has no JSON array:', cleaned.slice(0, 200));
    return [];
  }
  
  cleaned = cleaned.slice(firstBracket, lastBracket + 1);

  try {
    const data = JSON.parse(cleaned);
    if (!Array.isArray(data)) {
      console.error('[Agent] LLM response parsed but is not array');
      return [];
    }

    console.log(`[Agent] LLM generated ${data.length} raw records`);

    return data.map(row => {
      const record: Record<string, string> = {};
      for (const col of columns) {
        // Try exact match, then case-insensitive
        const val = row[col] 
          ?? Object.entries(row).find(([k]) => k.toLowerCase() === col.toLowerCase())?.[1]
          ?? '';
        record[col] = String(val).trim();
      }
      record['_source'] = 'AI Knowledge Base';
      return record;
    }).filter(row => columns.some(col => row[col] && row[col].length > 0));
  } catch (parseError) {
    console.error('[Agent] Failed to parse LLM JSON:', parseError);
    console.error('[Agent] Raw cleaned:', cleaned.slice(0, 500));
    return [];
  }
}

/**
 * Create a research plan using LLM
 */
export async function createResearchPlan(parsed: ParsedPrompt, columns: string[], priority: string = 'medium'): Promise<ResearchPlan> {
  try {
    const isHighVolume = (parsed.targetCount && parsed.targetCount > 50) || priority === 'high';
    const queryCount = isHighVolume ? "15-20" : "5-7";
    const prompt = `Create a web research plan for collecting this data:

TASK: ${parsed.description}
DATA TYPE: ${parsed.dataType}
COLUMNS NEEDED: ${JSON.stringify(columns)}
KEYWORDS: ${JSON.stringify(parsed.keywords)}

CRITICAL: The search queries MUST be extremely short, concise, and optimized for search engines (e.g. use quotes and boolean operators like: "AI Engineer" AND "Gurugram" jobs 2026). Do NOT use long conversational sentences as search queries.

Return a JSON object (no markdown, no backticks):
{
  "searchQueries": ["${queryCount} short, optimized boolean search queries"],
  "targetSites": ["domains likely to have this data"],
  "extractionStrategy": "brief description",
  "expectedColumns": ${JSON.stringify(columns)}
}`;

    const response = await generateAIContent(
      'You create web research plans. Return ONLY valid JSON. No markdown.',
      prompt
    );

    let cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned) as ResearchPlan;
  } catch (error) {
    console.error('[Agent] Plan creation failed, using fallback:', error);
    const baseQuery = parsed.keywords.join(' ') || parsed.description.slice(0, 50);
    return {
      searchQueries: [
        baseQuery,
        `${baseQuery} list`,
        `${baseQuery} directory 2024`,
        `list of ${parsed.dataType}`,
        `${parsed.dataType} database`,
      ],
      targetSites: ['crunchbase.com', 'linkedin.com', 'techcrunch.com', 'wikipedia.org'],
      extractionStrategy: 'Extract structured data from pages',
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

  const firstCol = columns[0];
  const uniqueFirst = new Set(data.map(r => (r[firstCol] || '').toLowerCase())).size;
  const uniqueness = (uniqueFirst / data.length) * 100;

  return Math.round((completeness * 0.6 + uniqueness * 0.4));
}
