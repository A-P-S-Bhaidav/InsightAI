import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter: 30 requests per minute per IP
const rateLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
});

export async function rateLimit(ip: string): Promise<boolean> {
  try {
    await rateLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove JS protocol
    .trim()
    .slice(0, 10000); // Max length
}

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
