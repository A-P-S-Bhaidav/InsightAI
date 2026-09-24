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
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scrapeUrl(config: ScrapeConfig): Promise<ScrapeResult> {
  const startTime = Date.now();
  const data: Record<string, string>[] = [];
  let statusCode = 200;

  try {
    const response = await fetch(config.url);
    statusCode = response.status;
    const html = await response.text();
    const $ = cheerio.load(html);

    // Simple extraction based on selectors
    // Assuming each selector extracts one field per page for simplicity,
    // or handles multiple items if the selector matches multiple elements.
    const extractedData: Record<string, string> = {};
    for (const [key, selector] of Object.entries(config.selectors)) {
      extractedData[key] = $(selector).text().trim();
    }
    data.push(extractedData);

    if (config.delay) {
      await sleep(config.delay);
    }
  } catch (error) {
    console.error('Scraping error:', error);
    statusCode = 500;
  }

  const responseTime = Date.now() - startTime;

  return {
    data,
    sourceUrl: config.url,
    fetchedAt: new Date(),
    statusCode,
    responseTime,
  };
}
