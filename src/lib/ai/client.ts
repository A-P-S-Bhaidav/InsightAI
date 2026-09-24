import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const MAX_RETRIES = 3;

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await model.generateContent([systemPrompt, userPrompt]);
        console.log('[AI Client] Used provider: Gemini (gemini-2.0-flash)');
        return result.response.text();
      } catch (error: any) {
        geminiError = error;
        if (error?.status === 429) {
          console.warn(`[AI Client] Gemini rate limited. Attempt ${attempt}/${MAX_RETRIES}`);
        } else {
          console.error(`[AI Client] Gemini error on attempt ${attempt}:`, error);
        }
        
        if (attempt < MAX_RETRIES) {
          await sleep(1000 * Math.pow(2, attempt - 1));
        }
      }
    }
  } else {
    console.warn('[AI Client] GEMINI_API_KEY missing, skipping Gemini.');
  }

  // Fallback to Groq
  if (groqKey) {
    console.log('[AI Client] Falling back to Groq (llama-3.3-70b-versatile)...');
    const groq = new Groq({ apiKey: groqKey });

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 4096,
        });
        console.log('[AI Client] Used provider: Groq (llama-3.3-70b-versatile)');
        return completion.choices[0]?.message?.content || '';
      } catch (error: any) {
        if (error?.status === 429) {
          console.warn(`[AI Client] Groq rate limited. Attempt ${attempt}/${MAX_RETRIES}`);
        } else {
          console.error(`[AI Client] Groq error on attempt ${attempt}:`, error);
        }
        
        if (attempt < MAX_RETRIES) {
          await sleep(1000 * Math.pow(2, attempt - 1));
        } else {
          throw new Error('All AI providers failed. Last error from Groq: ' + error.message);
        }
      }
    }
  } else {
    console.warn('[AI Client] GROQ_API_KEY missing, cannot fallback to Groq.');
    throw new Error('Gemini failed and no Groq key available. Gemini error: ' + (geminiError?.message || geminiError));
  }

  throw new Error('Failed to generate AI content');
}
