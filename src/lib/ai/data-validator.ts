export interface DataIssue {
  field: string;
  type: 'missing' | 'invalid' | 'duplicate' | 'outlier';
  severity: 'low' | 'medium' | 'high';
  message: string;
  count: number;
}

export interface DataQualityReport {
  overallScore: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  issues: DataIssue[];
  suggestions: string[];
}

export async function validateData(
  data: Record<string, unknown>[],
  schema?: Record<string, string>
): Promise<DataQualityReport> {
  const issues: DataIssue[] = [];
  const suggestions: string[] = [];
  const totalRecords = data.length;

  if (totalRecords === 0) {
    return {
      overallScore: 0,
      completeness: 0,
      consistency: 0,
      accuracy: 0,
      issues: [{
        field: 'all',
        type: 'missing',
        severity: 'high',
        message: 'No data provided for validation.',
        count: 0
      }],
      suggestions: ['Provide a non-empty dataset.']
    };
  }

  let missingCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;

  const seen = new Set<string>();

  for (const record of data) {
    // Check missing values
    for (const key of Object.keys(record)) {
      if (record[key] === null || record[key] === undefined || record[key] === '') {
        missingCount++;
      }
    }

    // Check duplicates
    const strRecord = JSON.stringify(record);
    if (seen.has(strRecord)) {
      duplicateCount++;
    } else {
      seen.add(strRecord);
    }
  }

  if (duplicateCount > 0) {
    issues.push({
      field: 'row',
      type: 'duplicate',
      severity: 'medium',
      message: 'Duplicate records found',
      count: duplicateCount
    });
    suggestions.push('Run deduplication to remove duplicate rows.');
  }

  if (missingCount > 0) {
    issues.push({
      field: 'various',
      type: 'missing',
      severity: 'low',
      message: 'Missing or null values found',
      count: missingCount
    });
    suggestions.push('Fill in missing values or drop sparse columns.');
  }

  const completeness = Math.max(0, 100 - (missingCount / (totalRecords * Object.keys(data[0] || {}).length)) * 100);
  const consistency = Math.max(0, 100 - (invalidCount / totalRecords) * 100);
  const accuracy = Math.max(0, 100 - (duplicateCount / totalRecords) * 100);
  const overallScore = (completeness + consistency + accuracy) / 3;

  return {
    overallScore,
    completeness,
    consistency,
    accuracy,
    issues,
    suggestions
  };
}
