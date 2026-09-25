import * as cheerio from 'cheerio';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

/**
 * Web search via DuckDuckGo HTML — no API key needed
 */
export async function webSearch(query: string, maxResults: number = 8): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodedQuery}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InsightAI/2.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return results;
    const html = await response.text();
    const $ = cheerio.load(html);

    $('.result').each((i, el) => {
      if (i >= maxResults) return false;
      const titleEl = $(el).find('.result__title a');
      const snippetEl = $(el).find('.result__snippet');
      const rawUrl = titleEl.attr('href') || '';

      // DuckDuckGo wraps URLs — extract the actual URL
      let url = rawUrl;
      try {
        const match = rawUrl.match(/uddg=([^&]+)/);
        if (match) url = decodeURIComponent(match[1]);
      } catch { /* keep raw */ }

      if (url && !url.includes('duckduckgo.com')) {
        let domain = '';
        try { domain = new URL(url).hostname; } catch { /* */ }
        results.push({
          title: titleEl.text().trim(),
          url,
          snippet: snippetEl.text().trim(),
          domain,
        });
      }
    });
  } catch (error) {
    console.error('[WebSearch] Search failed:', error);
  }

  return results;
}

/**
 * Fetch and extract text content from a URL
 */
export async function fetchPageContent(url: string): Promise<{ text: string; html: string; title: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InsightAI/2.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, nav, footer
    $('script, style, nav, footer, header, aside, .sidebar, .advertisement, .cookie-banner').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim();
    const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 15000);

    return { text, html, title };
  } catch (error) {
    console.error(`[WebSearch] Failed to fetch ${url}:`, error);
    return null;
  }
}
