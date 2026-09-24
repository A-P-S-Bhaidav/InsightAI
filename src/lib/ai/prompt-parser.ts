import { generateAIContent } from './client';

export interface ParsedPrompt {
  dataType: string;
  keywords: string[];
  sources: string[];
  outputFormat: 'table' | 'json' | 'csv';
  filters: Record<string, string>;
  constraints: string[];
  targetCount: number | null;
  description: string;
}

export async function parsePrompt(prompt: string): Promise<ParsedPrompt> {
  const systemInstruction = `
    You are an expert AI data requirement parser. Extract structured requirements from the user's natural-language business prompt.
    Return ONLY a JSON object conforming to the following structure, with no markdown formatting or extra text:
    {
      "dataType": "string (what kind of data)",
      "keywords": ["string (relevant search terms)"],
      "sources": ["string (mentioned domains/platforms)"],
      "outputFormat": "table | json | csv (default to table)",
      "filters": {"key": "value (any specific conditions)"},
      "constraints": ["string (limitations or requirements)"],
      "targetCount": number (or null if not specified),
      "description": "string (short summary of the task)"
    }
  `;

  try {
    const responseText = await generateAIContent(systemInstruction, prompt);
    
    // Clean up markdown if present
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText) as ParsedPrompt;
  } catch (error) {
    console.error('Error parsing prompt with AI client:', error);
    return generateFallback(prompt);
  }
}

function generateFallback(prompt: string): ParsedPrompt {
  const keywords = prompt.split(' ').filter(word => word.length > 4);
  return {
    dataType: 'Extracted Data',
    keywords,
    sources: [],
    outputFormat: 'table',
    filters: {},
    constraints: [],
    targetCount: null,
    description: `Fallback extraction for: ${prompt.substring(0, 50)}...`,
  };
}
