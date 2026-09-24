export interface PipelineConfig {
  removeDuplicates: boolean;
  trimWhitespace: boolean;
  removeEmpty: boolean;
  normalizeCase: boolean;
  validateSchema: boolean;
}

export interface PipelineStats {
  inputCount: number;
  outputCount: number;
  duplicatesRemoved: number;
  invalidRemoved: number;
  fieldsNormalized: number;
}

export interface PipelineResult {
  data: Record<string, unknown>[];
  stats: PipelineStats;
}

export function processPipeline(
  rawData: Record<string, unknown>[],
  config?: PipelineConfig
): PipelineResult {
  const resolvedConfig: PipelineConfig = {
    removeDuplicates: true,
    trimWhitespace: true,
    removeEmpty: true,
    normalizeCase: false,
    validateSchema: false,
    ...config,
  };

  const stats: PipelineStats = {
    inputCount: rawData.length,
    outputCount: 0,
    duplicatesRemoved: 0,
    invalidRemoved: 0,
    fieldsNormalized: 0,
  };

  let processedData = [...rawData];

  // Trim whitespace & normalize
  processedData = processedData.map(record => {
    const newRecord: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'string') {
        let val = value;
        if (resolvedConfig.trimWhitespace) val = val.trim();
        if (resolvedConfig.normalizeCase && key.toLowerCase().includes('email')) {
          val = val.toLowerCase();
          stats.fieldsNormalized++;
        }
        newRecord[key] = val;
      } else {
        newRecord[key] = value;
      }
    }
    return newRecord;
  });

  // Remove empty
  if (resolvedConfig.removeEmpty) {
    const initialLen = processedData.length;
    processedData = processedData.filter(record => Object.values(record).some(val => val !== null && val !== undefined && val !== ''));
    stats.invalidRemoved += (initialLen - processedData.length);
  }

  // Remove duplicates
  if (resolvedConfig.removeDuplicates) {
    const seen = new Set<string>();
    const initialLen = processedData.length;
    processedData = processedData.filter(record => {
      const str = JSON.stringify(record);
      if (seen.has(str)) return false;
      seen.add(str);
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
