import { generateAIContent } from './client';
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

CRITICAL: The search queries MUST be extremely short, concise, and optimized for search engines (e.g. use quotes and boolean operators like: "AI Engineer" AND "Gurugram" jobs 2026). Do NOT use long conversational sentences as search queries. Do NOT use the "site:" operator — it is not supported by our search engine.

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

