// Shared TypeScript types for InsightAI

export interface TaskSummary {
  id: string;
  title: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  tags: string;
  errorMessage: string | null;
  logs: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  workflows?: WorkflowSummary[];
}

export interface WorkflowSummary {
  id: string;
  taskId: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  totalSteps: number;
  config: Record<string, unknown>;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  steps?: WorkflowStepSummary[];
  datasets?: DatasetSummary[];
  task?: TaskSummary;
}

export interface WorkflowStepSummary {
  id: string;
  workflowId: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  status: string;
  output: Record<string, unknown> | string;
  error: string | null;
  order: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetSummary {
  id: string;
  workflowId: string;
  name: string;
  description: string | null;
  schema: unknown[];
  rowCount: number;
  qualityScore: number;
  format: string;
  createdAt: string;
  updatedAt: string;
  workflow?: WorkflowSummary;
}

export interface DataPointRecord {
  id: string;
  datasetId: string;
  data: Record<string, unknown>;
  sourceId: string | null;
  evidenceSnippet: string | null;
  isValid: boolean;
  confidence: number;
  createdAt: string;
  source?: SourceRecord | null;
}

export interface SourceRecord {
  id: string;
  url: string;
  domain: string;
  title: string | null;
  statusCode: number | null;
  responseTime: number | null;
  contentType: string | null;
  fetchedAt: string;
}

export interface FieldStats {
  type: string;
  uniqueValues: number;
  min?: number;
  max?: number;
}

export interface QualityBreakdown {
  overallScore: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  fieldQualities: Array<{
    field: string;
    completeness: number;
    type: string;
    uniqueRatio: number;
    avgLength: number;
  }>;
  issues: Array<{
    field: string;
    type: string;
    severity: string;
    message: string;
    count: number;
  }>;
  suggestions: string[];
}

export interface DatasetDetailResponse {
  dataset: DatasetSummary;
  dataPoints: DataPointRecord[];
  pagination: { total: number; page: number; limit: number };
  stats: Record<string, FieldStats>;
  qualityBreakdown: QualityBreakdown;
  sourceDistribution: Record<string, number>;
}

export interface StatsResponse {
  totalTasks: number;
  completedTasks: number;
  runningTasks: number;
  totalDatasets: number;
  totalDataPoints: number;
  averageQualityScore: number;
  recentTasks: TaskSummary[];
  tasksByStatus: Record<string, number>;
  tasksOverTime: Array<{ date: string; count: number }>;
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
}

export interface LogEntry {
  time: string;
  msg: string;
}
