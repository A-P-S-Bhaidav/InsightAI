import { generateAIContent } from './client';
import fuzzysort from 'fuzzysort';

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
3. If a value is missing, use "" (empty string). DO NOT drop the row if some columns are missing.
4. Return a JSON array of objects.
5. Each object MUST have keys matching the REQUIRED COLUMNS exactly (case-sensitive).
6. Each object MUST also include a special key "_evidence" containing the exact, literal quote or HTML snippet from the text that proves this data is real.
7. Return ONLY valid JSON — no markdown, no explanation, no backticks.
8. AGGRESSIVE EXTRACTION: We need volume. Extract every possible matching entity you can find on the page.
9. STRICT ENFORCEMENT ON DATES: If the task specifies a timeframe, you MUST IGNORE any outdated records.

Example response format:
[
  {
    "${columns[0]}": "value1", 
    "${columns.length > 1 ? columns[1] : 'col2'}": "value2",
    "_evidence": "Exact quote from the text showing value1 and value2"
  }
]`;

    const response = await generateAIContent(
      'You are a high-volume data extractor. Return ONLY a valid JSON array. No markdown. Extract every matching record you can find, even if partial.',
      prompt,
      'extraction'
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
      record['_evidence'] = row['_evidence'] || '';
      return record;
    }).filter(row => {
      // Keep rows where at least ONE user column has data
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
 * Merge and deduplicate extracted records from multiple sources using Fuzzy Matching
 */
export function mergeRecords(
  allRecords: Record<string, string>[],
  columns: string[]
): Record<string, string>[] {
  const merged: Record<string, string>[] = [];
  const seen = new Map<string, Record<string, string>>();

  for (const record of allRecords) {
    // Generate a core identity string for this record
    const key = columns
      .map(col => (record[col] || '').toLowerCase().trim())
      .filter(v => v.length > 0)
      .join('|');

    if (!key) continue;

    if (seen.has(key)) {
      const existing = seen.get(key)!;
      // Merge missing fields into the existing record
      for (const col of columns) {
        if (!existing[col] && record[col]) {
          existing[col] = record[col];
        }
      }
      // Prefer the record with the most evidence
      if (!existing['_evidenceSnippet'] && record['_evidence']) {
        existing['_evidenceSnippet'] = record['_evidence'];
      }
    } else {
      // Map _evidence to _evidenceSnippet for the final schema
      const finalRecord = { ...record };
      if (finalRecord['_evidence']) {
        finalRecord['_evidenceSnippet'] = finalRecord['_evidence'];
        delete finalRecord['_evidence'];
      }
      seen.set(key, finalRecord);
      merged.push(finalRecord);
    }
  }

  return merged;
}
