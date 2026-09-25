import { generateAIContent } from './client';

/**
 * Extract structured data records from raw web page text using LLM
 */
export async function extractStructuredData(
  pageText: string,
  columns: string[],
  context: string,
  sourceUrl: string
): Promise<Record<string, string>[]> {
  try {
    const prompt = `You are a data extraction expert. Extract structured records from the following web page content.

TASK: ${context}
SOURCE URL: ${sourceUrl}
REQUIRED COLUMNS: ${JSON.stringify(columns)}

WEB PAGE CONTENT:
${pageText.slice(0, 8000)}

INSTRUCTIONS:
1. Find ALL records/entries that match the task requirements
2. Extract data for EACH required column
3. If a value is not found, use "" (empty string)
4. Return a JSON array of objects
5. Each object must have keys matching the REQUIRED COLUMNS exactly
6. Return ONLY valid JSON — no markdown, no explanation
7. If no relevant data found, return []

IMPORTANT: Extract REAL data from the page, do not make up values.`;

    const response = await generateAIContent(
      'You are a precise data extractor. Return ONLY valid JSON arrays. No markdown. No backticks. No explanation.',
      prompt
    );

    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleaned);
    
    if (Array.isArray(data)) {
      return data.map(row => {
        const cleaned: Record<string, string> = {};
        for (const col of columns) {
          cleaned[col] = String(row[col] || '');
        }
        cleaned['_source'] = sourceUrl;
        return cleaned;
      }).filter(row => {
        // Filter out rows where ALL columns are empty
        return columns.some(col => row[col] && row[col].length > 0);
      });
    }
    return [];
  } catch (error) {
    console.error('[Extractor] Extraction failed:', error);
    return [];
  }
}

/**
 * Merge and deduplicate extracted records from multiple sources
 */
export function mergeRecords(
  allRecords: Record<string, string>[],
  columns: string[]
): Record<string, string>[] {
  const seen = new Set<string>();
  const merged: Record<string, string>[] = [];

  for (const record of allRecords) {
    // Create a dedup key from the first 2-3 non-empty columns
    const keyParts = columns
      .slice(0, 3)
      .map(col => (record[col] || '').toLowerCase().trim())
      .filter(v => v.length > 0);
    
    const key = keyParts.join('|');
    if (key.length > 0 && !seen.has(key)) {
      seen.add(key);
      merged.push(record);
    }
  }

  return merged;
}
