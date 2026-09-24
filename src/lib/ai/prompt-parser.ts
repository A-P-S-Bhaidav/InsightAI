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
  columns: string[];
}

export async function parsePrompt(prompt: string): Promise<ParsedPrompt> {
  const systemInstruction = `You are an expert AI data requirement parser. Extract structured requirements from the user's natural-language business prompt.

IMPORTANT: The "columns" field should list the exact data columns/fields the user wants to collect. Infer these from the prompt.
The "keywords" field should contain multi-word search phrases, NOT individual words.

Return ONLY a JSON object with NO markdown, NO backticks:
{
  "dataType": "string - category of data (e.g. 'Startup Founders', 'Job Listings', 'Product Prices')",
  "keywords": ["multi-word search phrases relevant to the query"],
  "sources": ["specific websites or platforms mentioned or implied"],
  "outputFormat": "table",
  "filters": {"key": "value for any specific conditions"},
  "constraints": ["any limitations mentioned"],
  "targetCount": null,
  "description": "concise summary of what data to collect",
  "columns": ["list of column names the user wants, e.g. 'Founder Name', 'Company', 'Email', 'LinkedIn URL'"]
}

Example for "Get me founders of AI startups with their emails":
{
  "dataType": "Startup Founders",
  "keywords": ["AI startup founders", "deep tech founders", "startup CEO contact"],
  "sources": ["crunchbase.com", "linkedin.com"],
  "outputFormat": "table",
  "filters": {"industry": "AI/Deep Tech"},
  "constraints": [],
  "targetCount": null,
  "description": "Contact information for founders of AI/deep tech startups including email and LinkedIn",
  "columns": ["Founder Name", "Company Name", "Email", "LinkedIn URL", "Industry", "Location"]
}`;

  try {
    const responseText = await generateAIContent(systemInstruction, prompt);
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedText) as ParsedPrompt;
    // Ensure columns exist
    if (!parsed.columns || parsed.columns.length === 0) {
      parsed.columns = inferColumns(prompt);
    }
    return parsed;
  } catch (error) {
    console.error('Error parsing prompt with AI client:', error);
    return generateFallback(prompt);
  }
}

function inferColumns(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const columns: string[] = ['Name'];

  if (lower.includes('email')) columns.push('Email');
  if (lower.includes('linkedin')) columns.push('LinkedIn URL');
  if (lower.includes('twitter') || lower.includes('x.com')) columns.push('Twitter/X');
  if (lower.includes('phone') || lower.includes('contact')) columns.push('Phone');
  if (lower.includes('company') || lower.includes('startup') || lower.includes('business')) columns.push('Company');
  if (lower.includes('founder') || lower.includes('ceo') || lower.includes('cto')) columns.push('Title/Role');
  if (lower.includes('location') || lower.includes('city') || lower.includes('country')) columns.push('Location');
  if (lower.includes('funding') || lower.includes('raised') || lower.includes('investment')) columns.push('Funding');
  if (lower.includes('industry') || lower.includes('sector')) columns.push('Industry');
  if (lower.includes('website') || lower.includes('url') || lower.includes('link')) columns.push('Website');
  if (lower.includes('salary') || lower.includes('pay') || lower.includes('compensation')) columns.push('Salary');
  if (lower.includes('rating') || lower.includes('review') || lower.includes('score')) columns.push('Rating');
  if (lower.includes('price') || lower.includes('cost')) columns.push('Price');
  if (lower.includes('description') || lower.includes('about')) columns.push('Description');

  if (columns.length === 1) columns.push('Description', 'Source');
  return columns;
}

function generateFallback(prompt: string): ParsedPrompt {
  // Extract meaningful multi-word phrases, NOT individual words
  const lower = prompt.toLowerCase();
  const keywords: string[] = [];

  // Extract noun phrases by looking for meaningful chunks
  const chunks = prompt.split(/[,;.]/).map(s => s.trim()).filter(s => s.length > 5);
  if (chunks.length > 0) keywords.push(...chunks.slice(0, 3));
  else keywords.push(prompt.slice(0, 80));

  // Detect data type from prompt
  let dataType = 'General Data';
  if (lower.includes('founder') || lower.includes('ceo')) dataType = 'Startup Founders';
  else if (lower.includes('job') || lower.includes('hiring') || lower.includes('career')) dataType = 'Job Listings';
  else if (lower.includes('startup') || lower.includes('company')) dataType = 'Companies';
  else if (lower.includes('product') || lower.includes('price')) dataType = 'Products';
  else if (lower.includes('news') || lower.includes('article')) dataType = 'News Articles';
  else if (lower.includes('lead') || lower.includes('contact')) dataType = 'Business Contacts';
  else if (lower.includes('review')) dataType = 'Reviews';
  else if (lower.includes('research') || lower.includes('paper')) dataType = 'Research Papers';

  // Detect sources
  const sources: string[] = [];
  if (lower.includes('linkedin')) sources.push('linkedin.com');
  if (lower.includes('crunchbase')) sources.push('crunchbase.com');
  if (lower.includes('github')) sources.push('github.com');

  return {
    dataType,
    keywords,
    sources,
    outputFormat: 'table',
    filters: {},
    constraints: [],
    targetCount: null,
    description: prompt,
    columns: inferColumns(prompt),
  };
}
