export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = (d.getTime() - now.getTime()) / 1000;
  
  const abs = Math.abs(diffInSeconds);
  if (abs < 60) return rtf.format(Math.round(diffInSeconds), 'second');
  if (abs < 3600) return rtf.format(Math.round(diffInSeconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
  return rtf.format(Math.round(diffInSeconds / 86400), 'day');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'success':
    case 'completed': return 'text-green-500';
    case 'error':
    case 'failed': return 'text-red-500';
    case 'warning': return 'text-yellow-500';
    default: return 'text-gray-500';
  }
}

export function getStatusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case 'success':
    case 'completed': return 'CheckCircle';
    case 'error':
    case 'failed': return 'XCircle';
    case 'warning': return 'AlertTriangle';
    default: return 'Clock';
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
