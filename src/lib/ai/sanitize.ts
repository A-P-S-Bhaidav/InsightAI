export class PromptInjectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromptInjectionError';
  }
}

/**
 * Validates and sanitizes user input to prevent LLM prompt injection and jailbreaks.
 */
export function sanitizePrompt(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new PromptInjectionError('Invalid input provided.');
  }

  const normalized = input.toLowerCase();

  // 1. Detect common injection phrases
  const injectionPatterns = [
    /ignore previous instructions/i,
    /system override/i,
    /bypass security/i,
    /drop table/i,
    /forget all instructions/i,
    /you are now/i,
    /print your prompt/i,
    /output your instructions/i,
    /ignore all previous/i,
    /disregard previous/i,
    /<\|im_start\|>/i, // LLM control tokens
    /\[INST\]/i
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(normalized)) {
      console.warn(`[Sanitize] Blocked potential prompt injection: ${pattern}`);
      throw new PromptInjectionError('Input contains restricted phrases or potential prompt injection.');
    }
  }

  // 2. Length restrictions (prevent massive payloads)
  if (input.length > 2000) {
    throw new PromptInjectionError('Prompt exceeds maximum allowed length of 2000 characters.');
  }

  // 3. Escape dangerous characters (e.g., HTML tags, excessive backticks)
  let sanitized = input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```/g, "'''"); // Prevent escaping markdown blocks

  return sanitized.trim();
}
