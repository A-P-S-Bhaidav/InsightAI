import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Define the available providers for easy reference
type AIProvider = 'Gemini' | 'Groq' | 'Cohere' | 'OpenRouter' | 'TogetherAI' | 'HuggingFace' | 'SambaNova';

// Helper function to call specific providers
async function callProvider(provider: AIProvider, systemPrompt: string, userPrompt: string): Promise<string> {
  switch (provider) {
    case 'Gemini': {
      const key = process.env.GEMINI_API_KEY;
      if (!key) throw new Error('GEMINI_API_KEY missing');
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: `SYSTEM: ${systemPrompt}\n\nUSER: ${userPrompt}` }] }],
          });
          const text = result.response.text();
          if (text) {
            console.log('[AI Client] Used provider: Gemini');
            return text;
          }
        } catch (e: any) {
          if (attempt === 2 || (e.status !== 429 && e.status !== 503)) throw e;
          await sleep(1000);
        }
      }
      throw new Error('Gemini failed');
    }

    case 'Groq': {
      const key = process.env.GROQ_API_KEY;
      if (!key) throw new Error('GROQ_API_KEY missing');
      const groq = new Groq({ apiKey: key });
      let models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-8b-8192'];
      try {
        const availableModels = await groq.models.list();
        const availableIds = availableModels.data.map((m: any) => m.id);
        const validModels = models.filter(m => availableIds.includes(m));
        if (validModels.length > 0) {
          models = validModels;
        } else if (availableIds.length > 0) {
          // If standard models are restricted, try whatever models are available (filtering out known audio models)
          models = availableIds.filter((id: string) => !id.includes('whisper'));
        }
      } catch (e) {
        console.warn('[AI Client] Failed to list Groq models:', e);
      }
      let lastGroqError: any = null;
      for (const modelName of models) {
        try {
          const completion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            model: modelName, temperature: 0.3, max_tokens: 4096,
          });
          console.log(`[AI Client] Used provider: Groq (${modelName})`);
          return completion.choices[0]?.message?.content || '';
        } catch (e: any) {
          lastGroqError = e;
          console.warn(`[AI Client] Groq model ${modelName} failed:`, e.message || e);
        }
      }
      throw new Error(`Groq failed: ${lastGroqError?.message || 'Unknown error'}`);
    }

    case 'Cohere': {
      const key = process.env.COHERE_API_KEY;
      if (!key) throw new Error('COHERE_API_KEY missing');
      const res = await fetch('https://api.cohere.com/v1/chat', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'accept': 'application/json' },
        body: JSON.stringify({ message: userPrompt, preamble: systemPrompt, model: 'command-r' })
      });
      const data = await res.json();
      if (data.text) {
        console.log('[AI Client] Used provider: Cohere (command-r)');
        return data.text;
      }
      throw new Error('Cohere failed');
    }

    case 'OpenRouter': {
      const key = process.env.OPENROUTER_API_KEY;
      if (!key) throw new Error('OPENROUTER_API_KEY missing');
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta-llama/llama-3-8b-instruct:free',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
        })
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        console.log('[AI Client] Used provider: OpenRouter');
        return data.choices[0].message.content;
      }
      throw new Error('OpenRouter failed');
    }

    case 'TogetherAI': {
      const key = process.env.TOGETHER_API_KEY;
      if (!key) throw new Error('TOGETHER_API_KEY missing');
      const res = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3-70b-chat-hf',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
        })
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        console.log('[AI Client] Used provider: Together AI');
        return data.choices[0].message.content;
      }
      throw new Error('Together AI failed');
    }

    case 'HuggingFace': {
      const key = process.env.HF_API_KEY;
      if (!key) throw new Error('HF_API_KEY missing');
      const res = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: `<|system|>\n${systemPrompt}\n<|user|>\n${userPrompt}\n<|assistant|>\n`,
          parameters: { max_new_tokens: 4096, temperature: 0.3 }
        })
      });
      const data = await res.json();
      if (data?.[0]?.generated_text) {
        console.log('[AI Client] Used provider: Hugging Face');
        const text = data[0].generated_text;
        return text.split('<|assistant|>\n').pop() || text;
      }
      throw new Error('Hugging Face failed');
    }

    case 'SambaNova': {
      const key = process.env.SAMBANOVA_API_KEY;
      if (!key) throw new Error('SAMBANOVA_API_KEY missing');
      const res = await fetch('https://api.sambanova.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'Meta-Llama-3.1-8B-Instruct',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
        })
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        console.log('[AI Client] Used provider: SambaNova');
        return data.choices[0].message.content;
      }
      throw new Error('SambaNova failed');
    }

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export async function generateAIContent(
  systemPrompt: string, 
  userPrompt: string, 
  taskType: 'extraction' | 'reasoning' | 'general' = 'general'
): Promise<string> {

  // Define routing priority based on task type
  let providerChain: AIProvider[] = [];

  if (taskType === 'extraction') {
    // RAG and JSON Extraction chain
    providerChain = ['Cohere', 'Groq', 'TogetherAI', 'Gemini'];
  } else if (taskType === 'reasoning' || taskType === 'general') {
    // Logic, Parsing, and General Reasoning chain
    providerChain = ['Gemini', 'OpenRouter', 'SambaNova', 'HuggingFace', 'Groq'];
  }

  // Execute the chain
  let lastError: any = null;
  for (const provider of providerChain) {
    try {
      return await callProvider(provider, systemPrompt, userPrompt);
    } catch (error: any) {
      console.warn(`[AI Client] Provider ${provider} skipped or failed:`, error.message || error);
      lastError = error;
    }
  }

  throw new Error(`All AI providers in the '${taskType}' chain exhausted. Last error: ${lastError?.message || 'Unknown'}`);
}
