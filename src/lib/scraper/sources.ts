export interface SourceConfig {
  domain: string;
  name: string;
  category: string;
  rateLimit: number; // requests per second
  defaultSelectors: Record<string, string>;
  searchUrlPattern: string;
  enabled: boolean;
}

export const PERMITTED_SOURCES: SourceConfig[] = [
  {
    domain: 'wikipedia.org',
    name: 'Wikipedia',
    category: 'Knowledge',
    rateLimit: 10,
    defaultSelectors: { title: 'h1', content: '#mw-content-text p' },
    searchUrlPattern: 'https://en.wikipedia.org/wiki/Special:Search?search={query}',
    enabled: true,
  },
  {
    domain: 'github.com',
    name: 'GitHub Jobs',
    category: 'Jobs',
    rateLimit: 5,
    defaultSelectors: { title: 'h1', description: '.markdown-body' },
    searchUrlPattern: 'https://github.com/search?q={query}&type=issues',
    enabled: true,
  },
  {
    domain: 'news.ycombinator.com',
    name: 'HackerNews',
    category: 'News',
    rateLimit: 2,
    defaultSelectors: { title: '.titleline > a', points: '.score' },
    searchUrlPattern: 'https://hn.algolia.com/?q={query}',
    enabled: true,
  },
  {
    domain: 'reddit.com',
    name: 'Reddit',
    category: 'Social',
    rateLimit: 1,
    defaultSelectors: { title: 'h1', content: '.md' },
    searchUrlPattern: 'https://www.reddit.com/search/?q={query}',
    enabled: true,
  },
  {
    domain: 'producthunt.com',
    name: 'ProductHunt',
    category: 'Products',
    rateLimit: 3,
    defaultSelectors: { title: 'h1', description: '.styles_description__3d_Y4' },
    searchUrlPattern: 'https://www.producthunt.com/search?q={query}',
    enabled: true,
  },
  {
    domain: 'crunchbase.com',
    name: 'Crunchbase',
    category: 'Business',
    rateLimit: 1,
    defaultSelectors: { name: 'h1', description: '.description' },
    searchUrlPattern: 'https://www.crunchbase.com/search/organizations/field/organizations/query/{query}',
    enabled: true,
  },
  {
    domain: 'techcrunch.com',
    name: 'TechCrunch',
    category: 'News',
    rateLimit: 5,
    defaultSelectors: { title: 'h1', content: '.article-content' },
    searchUrlPattern: 'https://techcrunch.com/search/{query}',
    enabled: true,
  },
  {
    domain: 'dev.to',
    name: 'DEV.to',
    category: 'Tech',
    rateLimit: 5,
    defaultSelectors: { title: 'h1', content: '.crayons-article__body' },
    searchUrlPattern: 'https://dev.to/search?q={query}',
    enabled: true,
  },
  {
    domain: 'arxiv.org',
    name: 'ArXiv',
    category: 'Research',
    rateLimit: 3,
    defaultSelectors: { title: 'h1.title', abstract: 'blockquote.abstract' },
    searchUrlPattern: 'https://arxiv.org/search/?query={query}&searchtype=all',
    enabled: true,
  },
  {
    domain: 'stackoverflow.com',
    name: 'StackOverflow',
    category: 'Tech',
    rateLimit: 5,
    defaultSelectors: { title: '#question-header h1', answer: '.answercell .s-prose' },
    searchUrlPattern: 'https://stackoverflow.com/search?q={query}',
    enabled: true,
  },
];

export function getSourceByDomain(domain: string): SourceConfig | undefined {
  return PERMITTED_SOURCES.find(source => source.domain === domain);
}

export function getSourcesByCategory(category: string): SourceConfig[] {
  return PERMITTED_SOURCES.filter(source => source.category === category);
}

export function getAllSources(): SourceConfig[] {
  return PERMITTED_SOURCES;
}
