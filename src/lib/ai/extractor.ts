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
    // Don't waste an API call on tiny pages
    if (pageText.length < 50) {
      console.warn(`[Extractor] Page text too short (${pageText.length} chars) for ${sourceUrl}`);
      return [];
    }

    const prompt = `You are a data extraction expert. Extract structured records from the following web page content.

TASK: ${context}
SOURCE URL: ${sourceUrl}
REQUIRED COLUMNS: ${JSON.stringify(columns)}

WEB PAGE CONTENT:
${pageText.slice(0, 10000)}

INSTRUCTIONS:
1. Find ALL records/entries that match the task requirements
2. Extract data for EACH required column
3. If a value is not found for a column, use "" (empty string)
4. Return a JSON array of objects
5. Each object must have keys matching the REQUIRED COLUMNS exactly (case-sensitive)
6. Return ONLY valid JSON — no markdown, no explanation, no backticks
7. If no relevant data found, return an empty array: []
8. Extract REAL data from the page. Do NOT fabricate or hallucinate values.
9. Even partial records (some columns filled) are valuable — include them.

Example response format:
[{"${columns[0]}": "value1", "${columns.length > 1 ? columns[1] : 'col2'}": "value2"}]`;

    const response = await generateAIContent(
      'You are a precise data extractor. Return ONLY a valid JSON array. No markdown. No backticks. No explanation text before or after the JSON.',
      prompt
    );

    // Clean the response — handle common LLM quirks
    let cleaned = response
      .replace(/```json\n?/g, '')
      .replace(/\n?```/g, '')
      .replace(/^[^[]*(\[)/, '$1')  // Remove any text before the first [
      .replace(/(\])[^]]*$/, '$1')  // Remove any text after the last ]
      .trim();

    // If response doesn't start with [, try to find the JSON array
    if (!cleaned.startsWith('[')) {
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleaned = arrayMatch[0];
      } else {
        console.warn(`[Extractor] No JSON array found in response for ${sourceUrl}`);
        return [];
      }
    }

    const data = JSON.parse(cleaned);
    
    if (!Array.isArray(data)) {
      console.warn(`[Extractor] Parsed result is not an array for ${sourceUrl}`);
      return [];
    }

    console.log(`[Extractor] Parsed ${data.length} raw records from ${sourceUrl}`);

    const validRecords = data.map(row => {
      const record: Record<string, string> = {};
      for (const col of columns) {
        // Try exact match, then case-insensitive match
        const val = row[col] ?? row[col.toLowerCase()] ?? row[col.toUpperCase()] ?? '';
        record[col] = String(val).trim();
      }
      record['_source'] = sourceUrl;
      return record;
    }).filter(row => {
      // Keep rows where at least ONE column has data
      return columns.some(col => row[col] && row[col].length > 0);
    });

    console.log(`[Extractor] ${validRecords.length} valid records after filtering from ${sourceUrl}`);
    return validRecords;
  } catch (error) {
    console.error(`[Extractor] Extraction failed for ${sourceUrl}:`, error);
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
