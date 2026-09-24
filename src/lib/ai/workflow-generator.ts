import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedPrompt } from './prompt-parser';

export interface WorkflowStepPlan {
  name: string;
  type: 'scrape' | 'transform' | 'validate' | 'deduplicate' | 'export';
  config: Record<string, unknown>;
  order: number;
}

export interface WorkflowPlan {
  name: string;
  description: string;
  steps: WorkflowStepPlan[];
}

export async function generateWorkflow(parsed: ParsedPrompt): Promise<WorkflowPlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateFallbackWorkflow(parsed);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemInstruction = `
    You are an expert data engineering AI. Generate a multi-step data collection workflow based on the parsed requirements.
    The workflow MUST include steps: scrape → transform → validate → deduplicate → export.
    Return ONLY a JSON object conforming to the following structure:
    {
      "name": "string (workflow name)",
      "description": "string (workflow description)",
      "steps": [
        {
          "name": "string",
          "type": "scrape | transform | validate | deduplicate | export",
          "config": {},
          "order": number
        }
      ]
    }
    `;

    const result = await model.generateContent([systemInstruction, JSON.stringify(parsed)]);
    const responseText = result.response.text();
    
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText) as WorkflowPlan;
  } catch (error) {
    console.error('Error generating workflow with Gemini:', error);
    return generateFallbackWorkflow(parsed);
  }
}

function generateFallbackWorkflow(parsed: ParsedPrompt): WorkflowPlan {
  return {
    name: `Workflow for ${parsed.dataType}`,
    description: parsed.description,
    steps: [
      {
        name: 'Data Collection',
        type: 'scrape',
        config: { sources: parsed.sources, keywords: parsed.keywords },
        order: 1,
      },
      {
        name: 'Data Transformation',
        type: 'transform',
        config: { format: 'standard' },
        order: 2,
      },
      {
        name: 'Data Validation',
        type: 'validate',
        config: { strict: false },
        order: 3,
      },
      {
        name: 'Deduplication',
        type: 'deduplicate',
        config: { fields: ['id'] },
        order: 4,
      },
      {
        name: 'Data Export',
        type: 'export',
        config: { format: parsed.outputFormat },
        order: 5,
      },
    ],
  };
}
