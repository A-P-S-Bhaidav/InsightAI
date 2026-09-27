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
    const geminiModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash'];

    for (const modelName of geminiModels) {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const result = await model.generateContent([systemPrompt, userPrompt]);
          console.log(`[AI Client] Used provider: Gemini (${modelName})`);
          return result.response.text();
        } catch (error: any) {
          geminiError = error;
          if (error?.status === 429) {
            console.warn(`[AI Client] Gemini rate limited. Attempt ${attempt}`);
            await sleep(1000 * Math.pow(2, attempt - 1));
          } else if (error?.status === 404 || error?.status === 503 || error?.status === 400) {
            console.warn(`[AI Client] Gemini model ${modelName} failed with ${error.status}, trying next model...`);
            break; // Move to next model
          } else {
            console.error(`[AI Client] Gemini error on attempt ${attempt}:`, error);
            if (attempt < 2) await sleep(1000);
          }
        }
      }
    }
  } else {
    console.warn('[AI Client] GEMINI_API_KEY missing, skipping Gemini.');
  }

  // Fallback to Groq
  if (groqKey) {
    console.log('[AI Client] Falling back to Groq...');
    const groq = new Groq({ apiKey: groqKey });
    const groqModels = ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'llama3-8b-8192'];

    for (const modelName of groqModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
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
          if (error?.status === 429) {
            console.warn(`[AI Client] Groq rate limited. Attempt ${attempt}`);
            await sleep(1000 * Math.pow(2, attempt - 1));
          } else if (error?.status === 404 || error?.status === 400) {
            console.warn(`[AI Client] Groq model ${modelName} unavailable, trying next...`);
            break; // Move to next model
          } else {
            console.error(`[AI Client] Groq error on attempt ${attempt}:`, error);
            if (attempt < 2) await sleep(1000);
          }
        }
      }
    }
    throw new Error('All Groq models failed. Gemini error: ' + (geminiError?.message || 'none'));
  }

  throw new Error('Failed to generate AI content');
}
