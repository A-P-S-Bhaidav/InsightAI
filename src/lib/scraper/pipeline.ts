export interface PipelineConfig {
  removeDuplicates: boolean;
  trimWhitespace: boolean;
  removeEmpty: boolean;
  normalizeCase: boolean;
  validateSchema: boolean;
  decodeEntities: boolean;
  normalizeUrls: boolean;
  normalizeDates: boolean;
}

export interface PipelineStats {
  inputCount: number;
  outputCount: number;
  duplicatesRemoved: number;
  invalidRemoved: number;
  fieldsNormalized: number;
  entitiesDecoded: number;
}

export interface PipelineResult {
  data: Record<string, unknown>[];
  stats: PipelineStats;
}

/**
 * Decode common HTML entities to their plain text equivalents.
 */
function decodeHtmlEntities(str: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>',
    '&quot;': '"', '&#39;': "'", '&apos;': "'",
    '&#x27;': "'", '&#x2F;': '/', '&nbsp;': ' ',
    '&#160;': ' ', '&ndash;': '–', '&mdash;': '—',
    '&laquo;': '«', '&raquo;': '»', '&copy;': '©',
    '&reg;': '®', '&trade;': '™', '&hellip;': '…',
    '&#8211;': '–', '&#8212;': '—', '&#8217;': "'",
    '&#8220;': '"', '&#8221;': '"', '&#8230;': '…',
  };
  let result = str;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.split(entity).join(char);
  }
  // Handle numeric entities (decimal and hex)
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
  return result;
}

/**
 * Normalize a URL by removing trailing slashes, query fragments, and lowercasing the domain.
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase();
    // Remove common tracking parameters
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'fbclid', 'gclid']
      .forEach(p => parsed.searchParams.delete(p));
    let normalized = parsed.toString();
    // Remove trailing slash
    if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
    return normalized;
  } catch {
    return url.trim();
  }
}

/**
 * Create a fuzzy dedup key that's more resilient than exact JSON.stringify matching.
 * Normalizes whitespace, case, and strips common prefixes/suffixes.
 */
function createDeduplicationKey(record: Record<string, unknown>): string {
  const keyParts: string[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith('_')) continue; // Skip internal fields
    const str = String(value || '').toLowerCase().trim()
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .replace(/[^\w\s]/g, '') // Remove punctuation for comparison
      .slice(0, 100);          // Cap length for efficiency
    if (str.length > 0) keyParts.push(str);
  }
  return keyParts.sort().join('|'); // Sort for key-order independence
}

export function processPipeline(
  rawData: Record<string, unknown>[],
  config?: Partial<PipelineConfig>
): PipelineResult {
  const resolvedConfig: PipelineConfig = {
    removeDuplicates: true,
    trimWhitespace: true,
    removeEmpty: true,
    normalizeCase: false,
    validateSchema: false,
    decodeEntities: true,
    normalizeUrls: true,
    normalizeDates: true,
    ...config,
  };

  const stats: PipelineStats = {
    inputCount: rawData.length,
    outputCount: 0,
    duplicatesRemoved: 0,
    invalidRemoved: 0,
    fieldsNormalized: 0,
    entitiesDecoded: 0,
  };

  let processedData = [...rawData];

  // Step 1: Decode HTML entities, trim whitespace, normalize
  processedData = processedData.map(record => {
    const newRecord: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'string') {
        let val = value;
        
        // Decode HTML entities
        if (resolvedConfig.decodeEntities) {
          const decoded = decodeHtmlEntities(val);
          if (decoded !== val) {
            stats.entitiesDecoded++;
            val = decoded;
          }
        }
        
        // Trim whitespace and normalize multi-spaces
        if (resolvedConfig.trimWhitespace) {
          val = val.trim().replace(/\s+/g, ' ');
        }
        
        // Normalize emails to lowercase
        if (resolvedConfig.normalizeCase && key.toLowerCase().includes('email')) {
          val = val.toLowerCase();
          stats.fieldsNormalized++;
        }
        
        // Normalize URLs
        if (resolvedConfig.normalizeUrls && (key.toLowerCase().includes('url') || key.toLowerCase().includes('link') || key.toLowerCase().includes('website'))) {
          if (val.startsWith('http')) {
            val = normalizeUrl(val);
            stats.fieldsNormalized++;
          }
        }
        
        // Strip markdown artifacts from LLM output
        val = val.replace(/^\*\*|\*\*$/g, '').replace(/^\*|\*$/g, '').replace(/^`|`$/g, '');
        
        newRecord[key] = val;
      } else {
        newRecord[key] = value;
      }
    }
    return newRecord;
  });

  // Step 2: Remove empty/null records (must have at least one non-internal field with data)
  if (resolvedConfig.removeEmpty) {
    const initialLen = processedData.length;
    processedData = processedData.filter(record => {
      return Object.entries(record).some(([key, val]) => 
        !key.startsWith('_') && val !== null && val !== undefined && val !== ''
      );
    });
    stats.invalidRemoved += (initialLen - processedData.length);
  }

  // Step 3: Fuzzy deduplication (handles reordered keys, whitespace differences, punctuation)
  if (resolvedConfig.removeDuplicates) {
    const seen = new Set<string>();
    const initialLen = processedData.length;
    processedData = processedData.filter(record => {
      const key = createDeduplicationKey(record);
      if (key.length === 0) return true; // Keep records where we can't compute a key
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    stats.duplicatesRemoved += (initialLen - processedData.length);
  }

  stats.outputCount = processedData.length;

  return {
    data: processedData,
    stats,
  };
}
