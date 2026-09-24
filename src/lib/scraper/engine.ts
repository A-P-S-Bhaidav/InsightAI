import * as cheerio from 'cheerio';

export interface PaginationConfig {
  nextSelector: string;
  maxPages: number;
}

export interface ScrapeConfig {
  url: string;
  selectors: Record<string, string>;
  pagination?: PaginationConfig;
  maxPages?: number;
  delay?: number;
}

export interface ScrapeResult {
  data: Record<string, string>[];
  sourceUrl: string;
  fetchedAt: Date;
  statusCode: number;
  responseTime: number;
  robotsAllowed: boolean;
  error?: string;
}

const USER_AGENT = 'InsightAI-Bot/2.0 (+https://insightai.app/bot)';

// Rate limiter per domain — max 1 request per 2 seconds
const domainTimestamps = new Map<string, number>();
const RATE_LIMIT_MS = 2000;

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check robots.txt for the given URL
 */
async function checkRobotsTxt(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;
    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return true; // No robots.txt = allowed

    const text = await response.text();
    const lines = text.split('\n');
    let applies = false;

    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith('user-agent:')) {
        const agent = trimmed.replace('user-agent:', '').trim();
        applies = agent === '*' || agent.includes('insightai');
      }
      if (applies && trimmed.startsWith('disallow:')) {
        const path = trimmed.replace('disallow:', '').trim();
        if (path && parsed.pathname.startsWith(path)) {
          return false; // Disallowed
        }
      }
    }
    return true;
  } catch {
    return true; // If we can't read robots.txt, assume allowed
  }
}

/**
 * Rate-limit per domain
 */
async function rateLimitDomain(hostname: string): Promise<void> {
  const lastRequest = domainTimestamps.get(hostname) || 0;
  const elapsed = Date.now() - lastRequest;
  if (elapsed < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - elapsed);
  }
  domainTimestamps.set(hostname, Date.now());
}

/**
 * Scrape a single URL using cheerio
 */
export async function scrapeUrl(config: ScrapeConfig): Promise<ScrapeResult> {
  const startTime = Date.now();
  const data: Record<string, string>[] = [];
  let statusCode = 200;

  try {
    const parsed = new URL(config.url);

    // Check robots.txt compliance
    const robotsAllowed = await checkRobotsTxt(config.url);
    if (!robotsAllowed) {
      return {
        data: [],
        sourceUrl: config.url,
        fetchedAt: new Date(),
        statusCode: 403,
        responseTime: Date.now() - startTime,
        robotsAllowed: false,
        error: 'Blocked by robots.txt',
      };
    }

    // Rate limit per domain
    await rateLimitDomain(parsed.hostname);

    const response = await fetch(config.url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });
    statusCode = response.status;

    if (!response.ok) {
      return {
        data: [],
        sourceUrl: config.url,
        fetchedAt: new Date(),
        statusCode,
        responseTime: Date.now() - startTime,
        robotsAllowed: true,
        error: `HTTP ${statusCode}`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try to extract multiple items if selectors match repeated elements
    const selectorKeys = Object.keys(config.selectors);
    if (selectorKeys.length > 0) {
      const firstSelector = config.selectors[selectorKeys[0]];
      const elements = $(firstSelector);

      if (elements.length > 1) {
        // Multiple elements found — extract each as a row
        elements.each((_, el) => {
          const row: Record<string, string> = {};
          for (const [key, selector] of Object.entries(config.selectors)) {
            // Try to find the selector within the parent context
            const val = $(el).find(selector.replace(firstSelector, '')).text().trim()
              || $(el).text().trim();
            row[key] = val.slice(0, 500); // Cap field length
          }
          data.push(row);
        });
      } else {
        // Single extraction
        const row: Record<string, string> = {};
        for (const [key, selector] of Object.entries(config.selectors)) {
          row[key] = $(selector).text().trim().slice(0, 500);
        }
        if (Object.values(row).some(v => v.length > 0)) {
          data.push(row);
        }
      }
    }

    // Pagination support
    if (config.pagination && data.length > 0) {
      const maxPages = Math.min(config.pagination.maxPages, config.maxPages || 5);
      let nextUrl = $(config.pagination.nextSelector).attr('href');
      let pageCount = 1;

      while (nextUrl && pageCount < maxPages) {
        const fullUrl = nextUrl.startsWith('http') ? nextUrl : `${parsed.protocol}//${parsed.host}${nextUrl}`;
        await rateLimitDomain(parsed.hostname);
        await sleep(config.delay || 1000);

        try {
          const pageRes = await fetch(fullUrl, {
            headers: { 'User-Agent': USER_AGENT },
            signal: AbortSignal.timeout(10000),
          });
          if (!pageRes.ok) break;

          const pageHtml = await pageRes.text();
          const $page = cheerio.load(pageHtml);

          const firstSel = config.selectors[selectorKeys[0]];
          $page(firstSel).each((_, el) => {
            const row: Record<string, string> = {};
            for (const [key, selector] of Object.entries(config.selectors)) {
              row[key] = $page(el).find(selector.replace(firstSel, '')).text().trim()
                || $page(el).text().trim();
              row[key] = row[key].slice(0, 500);
            }
            data.push(row);
          });

          nextUrl = $page(config.pagination.nextSelector).attr('href');
          pageCount++;
        } catch {
          break;
        }
      }
    }
  } catch (error) {
    console.error('Scraping error:', error);
    statusCode = 500;
    return {
      data: [],
      sourceUrl: config.url,
      fetchedAt: new Date(),
      statusCode,
      responseTime: Date.now() - startTime,
      robotsAllowed: true,
      error: error instanceof Error ? error.message : 'Scraping failed',
    };
  }

  return {
    data,
    sourceUrl: config.url,
    fetchedAt: new Date(),
    statusCode,
    responseTime: Date.now() - startTime,
    robotsAllowed: true,
  };
}

/**
 * Scrape multiple URLs with concurrency control
 */
export async function scrapeMultiple(
  configs: ScrapeConfig[],
  concurrency: number = 2
): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  for (let i = 0; i < configs.length; i += concurrency) {
    const batch = configs.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(config => scrapeUrl(config))
    );
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }
  }

  return results;
}
