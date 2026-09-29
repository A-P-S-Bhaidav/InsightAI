import { generateAIContent } from './client';
import { ParsedPrompt } from './prompt-parser';

export interface WorkflowStepPlan {
  name: string;
  type: 'scrape' | 'transform' | 'validate' | 'deduplicate' | 'export';
  config: Record<string, unknown>;
  order: number;
  dependsOn?: string[];
}

export interface WorkflowPlan {
  name: string;
  description: string;
  steps: WorkflowStepPlan[];
}

export async function generateWorkflow(parsed: ParsedPrompt): Promise<WorkflowPlan> {
  const systemInstruction = `
    You are an expert data engineering AI. Generate a multi-step data collection workflow based on the parsed requirements.
    The workflow MUST include steps: scrape → transform → validate → deduplicate → export.
    You must output a Directed Acyclic Graph (DAG) by specifying 'dependsOn' arrays for steps that rely on previous steps.
    Return ONLY a JSON object conforming to the following structure:
    {
      "name": "string (workflow name)",
      "description": "string (workflow description)",
      "steps": [
        {
          "name": "string (unique identifier for step)",
          "type": "scrape | transform | validate | deduplicate | export",
          "config": {},
          "order": number,
          "dependsOn": ["array of previous step names this step depends on"]
        }
      ]
    }
  `;

  try {
    const responseText = await generateAIContent(systemInstruction, JSON.stringify(parsed));
    
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText) as WorkflowPlan;
  } catch (error) {
    console.error('Error generating workflow with AI client:', error);
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
        dependsOn: [],
      },
      {
        name: 'Data Transformation',
        type: 'transform',
        config: { format: 'standard' },
        order: 2,
        dependsOn: ['Data Collection'],
      },
      {
        name: 'Data Validation',
        type: 'validate',
        config: { strict: false },
        order: 3,
        dependsOn: ['Data Transformation'],
      },
      {
        name: 'Deduplication',
        type: 'deduplicate',
        config: { fields: ['id'] },
        order: 4,
        dependsOn: ['Data Validation'],
      },
      {
        name: 'Data Export',
        type: 'export',
        config: { format: parsed.outputFormat },
        order: 5,
        dependsOn: ['Deduplication'],
      },
    ],
  };
}
