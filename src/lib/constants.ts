export const APP_NAME = 'InsightAI';
export const APP_DESCRIPTION = 'AI-Powered Data Intelligence Platform';
export const APP_VERSION = '1.0.0';

export const TASK_STATUSES = [
  { label: 'Pending', value: 'pending', color: 'var(--color-warning)', icon: 'Clock' },
  { label: 'In Progress', value: 'in_progress', color: 'var(--color-info)', icon: 'Loader2' },
  { label: 'Completed', value: 'completed', color: 'var(--color-success)', icon: 'CheckCircle' },
  { label: 'Failed', value: 'failed', color: 'var(--color-error)', icon: 'XCircle' },
];

export const WORKFLOW_STEP_TYPES = [
  { label: 'Scrape', value: 'scrape', icon: 'Globe' },
  { label: 'Transform', value: 'transform', icon: 'Wand2' },
  { label: 'Validate', value: 'validate', icon: 'ShieldCheck' },
  { label: 'Deduplicate', value: 'deduplicate', icon: 'CopyMinus' },
  { label: 'Export', value: 'export', icon: 'Download' },
];

export const EXPORT_FORMATS = ['csv', 'json', 'pdf'];

export const PRIORITY_LEVELS = [
  { label: 'Low', value: 'low', color: 'var(--color-success)' },
  { label: 'Medium', value: 'medium', color: 'var(--color-warning)' },
  { label: 'High', value: 'high', color: 'var(--color-error)' },
];

export const TEMPLATE_PROMPTS = [
  {
    title: 'Find tech job openings',
    prompt: 'Collect remote tech jobs for frontend developers from the last 7 days.',
    category: 'Jobs',
    icon: 'Briefcase'
  },
  {
    title: 'Research competitor pricing',
    prompt: 'Extract pricing plans for top 5 AI writing tools.',
    category: 'Market Research',
    icon: 'TrendingUp'
  },
  {
    title: 'Collect sales leads',
    prompt: 'Find contact info for marketing agencies in New York.',
    category: 'Sales',
    icon: 'Users'
  },
  {
    title: 'Monitor market trends',
    prompt: 'Track latest news articles about renewable energy startups.',
    category: 'News',
    icon: 'Activity'
  },
  {
    title: 'Gather product reviews',
    prompt: 'Scrape top-rated user reviews for the latest smartphone models.',
    category: 'E-commerce',
    icon: 'Star'
  },
  {
    title: 'Track industry news',
    prompt: 'Get headlines about AI regulations from tech news sites.',
    category: 'News',
    icon: 'Newspaper'
  }
];

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Workflows', href: '/workflows', icon: 'GitMerge' },
  { label: 'Data Hub', href: '/data', icon: 'Database' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
];

export const CHART_COLORS = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-accent)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
];

export const MAX_RETRIES = 3;
export const DEFAULT_PAGE_SIZE = 20;
