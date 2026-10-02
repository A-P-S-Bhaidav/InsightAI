import * as cheerio from 'cheerio';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

/**
 * Web search with multiple fallback strategies:
 * 1. Firecrawl (Enterprise Scraping API) — if FIRECRAWL_API_KEY is set
 * 2. Serper.dev (Google Search API) — if SERPER_API_KEY is set
 * 3. DuckDuckGo JSON API (no key needed)
 * 4. Synthetic fallback from known directories
 */
export async function webSearch(query: string, maxResults: number = 8): Promise<SearchResult[]> {
  console.log(`[WebSearch] Searching: "${query}"`);

  // Helper for rate limiting between requests
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  // Strategy 1: Firecrawl API (Enterprise grade)
  if (process.env.FIRECRAWL_API_KEY) {
    const results = await searchViaFirecrawl(query, maxResults);
    if (results.length > 0) {
      console.log(`[WebSearch] Firecrawl returned ${results.length} results`);
      return results;
    }
    await sleep(300);
  }

  // Strategy 2: Serper.dev (Google Search)
  if (process.env.SERPER_API_KEY) {
    const results = await searchViaSerper(query, maxResults);
    if (results.length > 0) {
      console.log(`[WebSearch] Serper returned ${results.length} results`);
      return results;
    }
    await sleep(300);
  }

  // Strategy 3: Brave Search API (free tier: 2000 queries/month)
  if (process.env.BRAVE_API_KEY) {
    const results = await searchViaBrave(query, maxResults);
    if (results.length > 0) {
      console.log(`[WebSearch] Brave returned ${results.length} results`);
      return results;
    }
    await sleep(300);
  }

  // Strategy 4: DuckDuckGo JSON (instant answers)
  const ddgJsonResults = await searchViaDDGJson(query, maxResults);
  if (ddgJsonResults.length > 0) {
    console.log(`[WebSearch] DDG JSON returned ${ddgJsonResults.length} results`);
    return ddgJsonResults;
  }
  await sleep(500);

  // Strategy 5: DuckDuckGo HTML scraping (fallback)
  const ddgHtmlResults = await searchViaDDGHtml(query, maxResults);
  if (ddgHtmlResults.length > 0) {
    console.log(`[WebSearch] DDG HTML returned ${ddgHtmlResults.length} results`);
    return ddgHtmlResults;
  }

  // Strategy 6: Generate synthetic search URLs from known data sources
  console.warn(`[WebSearch] All search providers failed. Using synthetic URLs.`);
  return generateSyntheticResults(query);
}

/**
 * Serper.dev — Google Search API ($50/mo free tier with 2500 searches)
 */
async function searchViaSerper(query: string, maxResults: number): Promise<SearchResult[]> {
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, num: maxResults }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`[WebSearch] Serper returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    const organic = data.organic || [];

    return organic.map((item: { title: string; link: string; snippet: string }) => {
      let domain = '';
      try { domain = new URL(item.link).hostname; } catch { /* */ }
      return {
        title: item.title || '',
        url: item.link || '',
        snippet: item.snippet || '',
        domain,
      };
    });
  } catch (error) {
    console.error('[WebSearch] Serper search failed:', error);
    return [];
  }
}

/**
 * Firecrawl API — Enterprise Headless Scraping & Search
 */
async function searchViaFirecrawl(query: string, maxResults: number): Promise<SearchResult[]> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit: maxResults }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[WebSearch] Firecrawl returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    if (!data.success || !data.data) return [];

    return data.data.map((item: { title?: string; url?: string; description?: string; content?: string }) => {
      let domain = '';
      try { domain = new URL(item.url || '').hostname; } catch { /* */ }
      return {
        title: item.title || '',
        url: item.url || '',
        snippet: item.description || item.content?.substring(0, 200) || '',
        domain,
      };
    });
  } catch (error) {
    console.error('[WebSearch] Firecrawl search failed:', error);
    return [];
  }
}

/**
 * Brave Search API — Free tier with 2000 queries/month
 */
async function searchViaBrave(query: string, maxResults: number): Promise<SearchResult[]> {
  try {
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': process.env.BRAVE_API_KEY!,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`[WebSearch] Brave returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    const webResults = data.web?.results || [];

    return webResults.map((item: { title: string; url: string; description: string }) => {
      let domain = '';
      try { domain = new URL(item.url).hostname; } catch { /* */ }
      return {
        title: item.title || '',
        url: item.url || '',
        snippet: item.description || '',
        domain,
      };
    });
  } catch (error) {
    console.error('[WebSearch] Brave search failed:', error);
    return [];
  }
}

/**
 * DuckDuckGo JSON instant answer API
 */
async function searchViaDDGJson(query: string, maxResults: number): Promise<SearchResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_redirect=1&no_html=1`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) return [];
    const data = await response.json();

    const results: SearchResult[] = [];

    // Extract from RelatedTopics
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics) {
        if (results.length >= maxResults) break;

        if (topic.FirstURL && topic.Text) {
          let domain = '';
          try { domain = new URL(topic.FirstURL).hostname; } catch { /* */ }
          results.push({
            title: topic.Text.slice(0, 100),
            url: topic.FirstURL,
            snippet: topic.Text,
            domain,
          });
        }

        // Nested topics
        if (topic.Topics) {
          for (const sub of topic.Topics) {
            if (results.length >= maxResults) break;
            if (sub.FirstURL && sub.Text) {
              let domain = '';
              try { domain = new URL(sub.FirstURL).hostname; } catch { /* */ }
              results.push({
                title: sub.Text.slice(0, 100),
                url: sub.FirstURL,
                snippet: sub.Text,
                domain,
              });
            }
          }
        }
      }
    }

    // Also check Abstract
    if (data.AbstractURL && data.Abstract && results.length < maxResults) {
      let domain = '';
      try { domain = new URL(data.AbstractURL).hostname; } catch { /* */ }
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        snippet: data.Abstract,
        domain,
      });
    }

    return results;
  } catch (error) {
    console.error('[WebSearch] DDG JSON search failed:', error);
    return [];
  }
}

/**
 * DuckDuckGo HTML scraping (fallback)
 */
async function searchViaDDGHtml(query: string, maxResults: number): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    const response = await fetch(`https://html.duckduckgo.com/html/`, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      body: `q=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`[WebSearch] DDG HTML returned ${response.status}`);
      return results;
    }

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

      if (url && !url.includes('duckduckgo.com') && url.startsWith('http')) {
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
    console.error('[WebSearch] DDG HTML search failed:', error);
  }

  return results;
}
/**
 * Generate synthetic search results from well-known directories
 * when all search engines fail
 */
function generateSyntheticResults(query: string): SearchResult[] {
  const lower = query.toLowerCase();
  const results: SearchResult[] = [];

  // Detect what kind of data the user wants and provide direct URLs
  if (lower.includes('founder') || lower.includes('startup') || lower.includes('company')) {
    results.push(
      { title: `${query} - TechCrunch`, url: `https://techcrunch.com/?s=${encodeURIComponent(query)}`, snippet: 'TechCrunch startup coverage', domain: 'techcrunch.com' },
      { title: `${query} - Wikipedia`, url: `https://en.wikipedia.org/wiki/List_of_unicorn_startup_companies`, snippet: 'List of unicorn startups', domain: 'en.wikipedia.org' },
      { title: `${query} - Forbes`, url: `https://www.forbes.com/search/?q=${encodeURIComponent(query)}`, snippet: 'Forbes business search', domain: 'www.forbes.com' },
    );
  } else if (lower.includes('job') || lower.includes('hiring') || lower.includes('engineer') || lower.includes('salary') || lower.includes('lpa') || lower.includes('openings') || lower.includes('vacancy') || lower.includes('career') || lower.match(/\b(ml|ai|data scientist|developer)\b/)) {
    // Broad job-related query detection
    const searchTerm = encodeURIComponent(query.replace(/site:\S+/gi, '').trim());
    results.push(
      { title: `${query} - LinkedIn Jobs`, url: `https://in.linkedin.com/jobs/search?keywords=${searchTerm}`, snippet: 'LinkedIn job listings', domain: 'in.linkedin.com' },
      { title: `${query} - Naukri`, url: `https://www.naukri.com/jobs-in-india?k=${searchTerm}`, snippet: 'Naukri job listings', domain: 'www.naukri.com' },
      { title: `${query} - Indeed India`, url: `https://in.indeed.com/jobs?q=${searchTerm}`, snippet: 'Indeed India job listings', domain: 'in.indeed.com' },
      { title: `${query} - Glassdoor`, url: `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${searchTerm}`, snippet: 'Glassdoor job listings', domain: 'www.glassdoor.co.in' },
    );
  } else {
    results.push(
      { title: `${query} - Wikipedia`, url: `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`, snippet: 'Wikipedia search', domain: 'en.wikipedia.org' },
      { title: `${query} - Reddit`, url: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`, snippet: 'Reddit discussions', domain: 'www.reddit.com' },
    );
  }

  return results;
}

/**
 * Fetch and extract text content from a URL
 * Uses plain fetch (fast, works on Vercel) with Browserless as optional enhancement
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

export async function fetchPageContent(url: string): Promise<{ text: string; html: string; title: string } | null> {
  console.log(`[WebSearch] Fetching: ${url}`);

  try {
    let html = '';

    // Try plain fetch first — it's fastest and works on most pages
    try {
      const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      const response = await fetch(url, {
        headers: {
          'User-Agent': randomUA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(10000),
        redirect: 'follow',
      });

      if (response.ok) {
        // Validate content-type — skip binary files
        const contentType = response.headers.get('content-type') || '';
        const isHtmlLike = contentType.includes('text/') || contentType.includes('html') || contentType.includes('xml') || contentType.includes('json') || contentType === '';
        if (!isHtmlLike) {
          console.warn(`[WebSearch] Skipping non-text content (${contentType}) for ${url}`);
          return null;
        }
        html = await response.text();
        console.log(`[WebSearch] Plain fetch succeeded for ${url} (${html.length} bytes)`);
      } else {
        console.warn(`[WebSearch] Plain fetch returned ${response.status} for ${url}`);
      }
    } catch (fetchError) {
      console.warn(`[WebSearch] Plain fetch failed for ${url}:`, fetchError);
    }

      // If plain fetch failed or returned very little content, try Firecrawl / Browserless
      if ((!html || html.length < 500)) {
        if (process.env.FIRECRAWL_API_KEY) {
          console.log(`[WebSearch] Trying Firecrawl scrape for ${url}`);
          try {
            const fcResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url, formats: ['html'] }),
              signal: AbortSignal.timeout(20000),
            });
            if (fcResponse.ok) {
              const fcData = await fcResponse.json();
              if (fcData.success && fcData.data?.html) {
                html = fcData.data.html;
                console.log(`[WebSearch] Firecrawl succeeded for ${url} (${html.length} bytes)`);
              }
            }
          } catch (fcError) {
            console.warn(`[WebSearch] Firecrawl failed for ${url}:`, fcError);
          }
        } else if (process.env.BROWSERLESS_API_KEY) {
          console.log(`[WebSearch] Trying Browserless for ${url}`);
          try {
            // Use Browserless REST API (simpler and more reliable than WebSocket)
            const browserlessUrl = `https://chrome.browserless.io/content?token=${process.env.BROWSERLESS_API_KEY}`;
            const response = await fetch(browserlessUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url,
                waitFor: 2000,
                gotoOptions: { waitUntil: 'domcontentloaded', timeout: 12000 },
                rejectResourceTypes: ['image', 'stylesheet', 'font', 'media'],
              }),
              signal: AbortSignal.timeout(15000),
            });

            if (response.ok) {
              html = await response.text();
              console.log(`[WebSearch] Browserless succeeded for ${url} (${html.length} bytes)`);
            } else {
              console.warn(`[WebSearch] Browserless returned ${response.status} for ${url}`);
            }
          } catch (browserError) {
            console.warn(`[WebSearch] Browserless failed for ${url}:`, browserError);
          }
        }
      }

    if (!html || html.length < 100) {
      console.warn(`[WebSearch] No usable content from ${url}`);
      return null;
    }

    const $ = cheerio.load(html);

    // Remove noise elements
    $('script, style, nav, footer, header, aside, .sidebar, .advertisement, .cookie-banner, iframe, noscript, .nav, .menu, .footer, .header, [role="navigation"], [role="banner"]').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim();

    // Try to extract main content area first
    let text = '';
    const mainSelectors = ['main', 'article', '[role="main"]', '.content', '.post-content', '#content', '.article-body'];
    for (const selector of mainSelectors) {
      const mainEl = $(selector);
      if (mainEl.length > 0) {
        text = mainEl.text().replace(/\s+/g, ' ').trim();
        if (text.length > 200) break;
      }
    }

    // Fallback to body
    if (text.length < 200) {
      text = $('body').text().replace(/\s+/g, ' ').trim();
    }

    // Cap at 20k chars
    text = text.slice(0, 20000);

    console.log(`[WebSearch] Extracted ${text.length} chars from ${url}`);
    return { text, html, title };
  } catch (error) {
    console.error(`[WebSearch] Failed to fetch ${url}:`, error);
    return null;
  }
}

/**
 * Extract internal links from a page's HTML to enable deep crawling
 */
export function extractInternalLinks(html: string, baseUrl: string, maxLinks: number = 10): string[] {
  const scoredLinks: { url: string; score: number }[] = [];
  try {
    const $ = cheerio.load(html);
    const baseDomain = new URL(baseUrl).hostname;
    const seen = new Set<string>();
    
    // High-value keywords for deep research
    const highValueKeywords = ['about', 'team', 'profile', 'people', 'leadership', 'contact', 'staff', 'management', 'founders'];
    // Low-value keywords
    const lowValueKeywords = ['login', 'signup', 'privacy', 'terms', 'legal', 'forgot', 'cart'];
    
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().toLowerCase();
      
      if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        const linkDomain = new URL(absoluteUrl).hostname;
        
        // Only keep links to the same domain (internal crawling)
        if ((linkDomain === baseDomain || linkDomain.endsWith(`.${baseDomain}`)) && absoluteUrl !== baseUrl) {
          if (!seen.has(absoluteUrl)) {
            seen.add(absoluteUrl);
            
            let score = 0;
            const lowerUrl = absoluteUrl.toLowerCase();
            
            // Score based on URL and text
            highValueKeywords.forEach(kw => {
              if (lowerUrl.includes(kw)) score += 2;
              if (text.includes(kw)) score += 2;
            });
            lowValueKeywords.forEach(kw => {
              if (lowerUrl.includes(kw)) score -= 5;
              if (text.includes(kw)) score -= 5;
            });
            
            scoredLinks.push({ url: absoluteUrl, score });
          }
        }
      } catch { /* Ignore invalid URLs */ }
    });
  } catch (error) {
    console.error('[WebSearch] Failed to extract links:', error);
  }
  
  // Sort by score descending and take maxLinks
  return scoredLinks
    .sort((a, b) => b.score - a.score)
    .slice(0, maxLinks)
    .map(link => link.url);
}
