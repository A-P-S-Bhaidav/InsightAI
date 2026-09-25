import { sanitizeInput, rateLimit } from '@/lib/security';

describe('sanitizeInput', () => {
  it('removes HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  it('removes javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('caps at 10000 chars', () => {
    const longStr = 'a'.repeat(15000);
    expect(sanitizeInput(longStr).length).toBe(10000);
  });

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

describe('rateLimit', () => {
  it('allows requests within limit', async () => {
    const result = await rateLimit('test-ip-1');
    expect(result).toBe(true);
  });

  it('blocks after exceeding limit', async () => {
    const ip = 'test-ip-flood-' + Date.now();
    // Consume all 30 points
    for (let i = 0; i < 30; i++) {
      await rateLimit(ip);
    }
    const result = await rateLimit(ip);
    expect(result).toBe(false);
  });
});
