export interface DataIssue {
  field: string;
  type: 'missing' | 'invalid' | 'duplicate' | 'outlier';
  severity: 'low' | 'medium' | 'high';
  message: string;
  count: number;
}

export interface FieldQuality {
  field: string;
  completeness: number; // 0-100
  type: 'text' | 'number' | 'url' | 'email' | 'date' | 'mixed';
  uniqueRatio: number; // 0-1
  avgLength: number;
  issues: DataIssue[];
}

export interface DataQualityReport {
  overallScore: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  fieldQualities: FieldQuality[];
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
      fieldQualities: [],
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
    const strRecord = JSON.stringify(record);
    if (seen.has(strRecord)) {
      duplicateCount++;
    } else {
      seen.add(strRecord);
    }
  }

  const fields = Object.keys(data[0] || {});
  const fieldQualities: FieldQuality[] = [];

  for (const field of fields) {
    const values = data.map(r => r[field]);
    let fieldMissing = 0;
    let sumLength = 0;
    const uniqueValues = new Set<unknown>();
    const types: Record<string, number> = { text: 0, number: 0, url: 0, email: 0, date: 0 };
    const numericValues: number[] = [];

    for (const val of values) {
      if (val === null || val === undefined || val === '') {
        fieldMissing++;
        missingCount++;
        continue;
      }
      
      uniqueValues.add(val);
      const strVal = String(val);
      sumLength += strVal.length;

      // Type detection — order matters: check number before date since Date.parse('15000') is valid
      if (/^https?:\/\//.test(strVal)) {
        types.url++;
      } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
        types.email++;
      } else if (!isNaN(Number(strVal)) && strVal.trim() !== '') {
        types.number++;
        numericValues.push(Number(strVal));
      } else if (/^\d{4}-\d{2}-\d{2}/.test(strVal) || (/[a-zA-Z]/.test(strVal) && !isNaN(Date.parse(strVal)))) {
        types.date++;
      } else {
        types.text++;
      }
    }

    const presentCount = totalRecords - fieldMissing;
    const completeness = totalRecords > 0 ? ((presentCount) / totalRecords) * 100 : 0;
    const uniqueRatio = presentCount > 0 ? uniqueValues.size / presentCount : 0;
    const avgLength = presentCount > 0 ? sumLength / presentCount : 0;

    let primaryType: 'text' | 'number' | 'url' | 'email' | 'date' | 'mixed' = 'mixed';
    let maxTypeCount = 0;
    for (const [t, count] of Object.entries(types)) {
      if (count > maxTypeCount) {
        maxTypeCount = count;
        primaryType = t as FieldQuality['type'];
      }
    }
    if (maxTypeCount < presentCount * 0.8 && presentCount > 0) {
      primaryType = 'mixed';
    }

    const fieldIssues: DataIssue[] = [];
    
    if (primaryType === 'mixed' && presentCount > 0) {
      fieldIssues.push({
        field,
        type: 'invalid',
        severity: 'medium',
        message: 'Inconsistent formatting detected',
        count: presentCount - maxTypeCount
      });
      invalidCount += (presentCount - maxTypeCount);
    }

    if (primaryType === 'number' && numericValues.length > 1) {
      const mean = numericValues.reduce((a,b) => a+b, 0) / numericValues.length;
      const stdDev = Math.sqrt(numericValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / numericValues.length);
      let outliers = 0;
      for (const n of numericValues) {
        if (Math.abs(n - mean) > 2 * stdDev) outliers++;
      }
      if (outliers > 0) {
        fieldIssues.push({
          field,
          type: 'outlier',
          severity: 'medium',
          message: `Found ${outliers} outliers`,
          count: outliers
        });
      }
    }
    
    if (avgLength > 0 && (avgLength < 2 || avgLength > 1000) && presentCount > 0) {
       fieldIssues.push({
          field,
          type: 'invalid',
          severity: 'low',
          message: `Suspiciously short or long values`,
          count: presentCount
       });
    }

    fieldQualities.push({
      field,
      completeness,
      type: primaryType,
      uniqueRatio,
      avgLength,
      issues: fieldIssues
    });
    
    issues.push(...fieldIssues);
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

  const overallCompleteness = Math.max(0, 100 - (missingCount / (totalRecords * Math.max(fields.length, 1))) * 100);
  const consistency = Math.max(0, 100 - (invalidCount / (totalRecords * Math.max(fields.length, 1))) * 100);
  const accuracy = Math.max(0, 100 - (duplicateCount / totalRecords) * 100);
  const overallScore = (overallCompleteness + consistency + accuracy) / 3;

  return {
    overallScore,
    completeness: overallCompleteness,
    consistency,
    accuracy,
    fieldQualities,
    issues,
    suggestions
  };
}
