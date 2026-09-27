import { parsePrompt } from './src/lib/ai/prompt-parser';
import { runAgenticRAG } from './src/lib/ai/agent';

async function test() {
  console.log('Testing LLM knowledge generation...');
  const prompt = "Find 10 AI startup founders and their emails";
  console.log('Parsing prompt:', prompt);
  const parsed = await parsePrompt(prompt);
  console.log('Parsed:', parsed);
  
  console.log('Running agentic RAG...');
  const result = await runAgenticRAG(parsed, (step) => {
    console.log(`[Step ${step.type}] ${step.description} - ${step.status} ${step.result || ''}`);
  });
  
  console.log('Final Data Length:', result.data.length);
  if (result.data.length > 0) {
    console.log('Sample data:', result.data[0]);
  }
}

test().catch(console.error);
