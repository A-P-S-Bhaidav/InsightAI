import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateAIContent(systemPrompt: string, userPrompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    throw new Error('No AI provider API keys available.');
  }

  let geminiError: any = null;

  if (geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
    
    // If Groq is available, only try Gemini twice quickly before falling back
    const maxAttempts = groqKey ? 2 : 5;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await model.generateContent([systemPrompt, userPrompt]);
        console.log(`[AI Client] Used provider: Gemini (gemini-3.8-flash) on attempt ${attempt}`);
        return result.response.text();
      } catch (error: any) {
        geminiError = error;
        if (error?.status === 429 || error?.status === 503) {
          console.warn(`[AI Client] Gemini 503/429 (High Demand). Attempt ${attempt}/${maxAttempts}`);
          if (attempt < maxAttempts) {
            await sleep(1000 * attempt); // Fast backoff: 1s, 2s...
          }
        } else {
          console.error(`[AI Client] Gemini error on attempt ${attempt}:`, error);
          if (attempt < maxAttempts) await sleep(1000);
        }
      }
    }
    
    if (groqKey) {
      console.warn(`[AI Client] Gemini exhausted ${maxAttempts} attempts. Seamlessly falling back to Groq...`);
    }
  } else {
    console.warn('[AI Client] GEMINI_API_KEY missing, skipping Gemini.');
  }

  // Fallback 1: Groq
  if (groqKey) {
    console.log('[AI Client] Falling back to Groq...');
    const groq = new Groq({ apiKey: groqKey });
    
    // We try multiple models
    const groqModels = ['llama3-70b-8192', 'mixtral-8x7b-32768'];

    for (const modelName of groqModels) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: modelName,
          temperature: 0.3,
          max_tokens: 4096,
        });
        console.log(`[AI Client] Used provider: Groq (${modelName})`);
        return completion.choices[0]?.message?.content || '';
      } catch (error: any) {
        console.warn(`[AI Client] Groq model ${modelName} failed, trying next...`);
      }
    }
  }

  // Fallback 2: Cohere
  const cohereKey = process.env.COHERE_API_KEY;
  if (cohereKey) {
    console.log('[AI Client] Falling back to Cohere...');
    try {
      const res = await fetch('https://api.cohere.com/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cohereKey}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          message: userPrompt,
          preamble: systemPrompt,
          model: 'command-r'
        })
      });
      const data = await res.json();
      if (data.text) {
        console.log('[AI Client] Used provider: Cohere (command-r)');
        return data.text;
      }
    } catch (e) {
      console.warn('[AI Client] Cohere failed:', e);
    }
  }

  // Fallback 3: OpenRouter (Free Tier)
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    console.log('[AI Client] Falling back to OpenRouter...');
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3-8b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        console.log('[AI Client] Used provider: OpenRouter');
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.warn('[AI Client] OpenRouter failed:', e);
    }
  }

  // Fallback 4: Together AI
  const togetherKey = process.env.TOGETHER_API_KEY;
  if (togetherKey) {
    console.log('[AI Client] Falling back to Together AI...');
    try {
      const res = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${togetherKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3-70b-chat-hf',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        console.log('[AI Client] Used provider: Together AI');
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.warn('[AI Client] Together AI failed:', e);
    }
  }
  // Fallback 5: Hugging Face Inference API
  const hfKey = process.env.HF_API_KEY;
  if (hfKey) {
    console.log('[AI Client] Falling back to Hugging Face...');
    try {
      const res = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `<|system|>\n${systemPrompt}\n<|user|>\n${userPrompt}\n<|assistant|>\n`,
          parameters: { max_new_tokens: 4096, temperature: 0.3 }
        })
      });
      const data = await res.json();
      if (data?.[0]?.generated_text) {
        console.log('[AI Client] Used provider: Hugging Face');
        const text = data[0].generated_text;
        // Basic cleanup of HF instruct prompt formats
        return text.split('<|assistant|>\n').pop() || text;
      }
    } catch (e) {
      console.warn('[AI Client] Hugging Face failed:', e);
    }
  }

  // Fallback 6: Cerebras
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  if (cerebrasKey) {
    console.log('[AI Client] Falling back to Cerebras...');
    try {
      const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cerebrasKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        console.log('[AI Client] Used provider: Cerebras');
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.warn('[AI Client] Cerebras failed:', e);
    }
  }

  // Fallback 7: SambaNova
  const sambanovaKey = process.env.SAMBANOVA_API_KEY;
  if (sambanovaKey) {
    console.log('[AI Client] Falling back to SambaNova...');
    try {
      const res = await fetch('https://api.sambanova.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sambanovaKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'Meta-Llama-3.1-8B-Instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        console.log('[AI Client] Used provider: SambaNova');
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.warn('[AI Client] SambaNova failed:', e);
    }
  }

  throw new Error('All AI providers exhausted or failed. Gemini error: ' + (geminiError?.message || 'none'));
}
