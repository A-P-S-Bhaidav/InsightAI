import React from 'react';
import Link from 'next/link';
import { Badge } from '../common/Badge';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    prompt: string;
    status: string;
    priority: string;
    createdAt: string;
    _count?: { workflows: number };
  };
}

export function TaskCard({ task }: TaskCardProps) {
  const getStatusVariant = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'danger';
      case 'pending': return 'pending';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <Link href={`/tasks/${task.id}`} className="card task-card animate-fade-in" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="task-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 className="task-card-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{task.title}</h3>
        <div className="task-card-badges" style={{ display: 'flex', gap: '0.5rem' }}>
          <Badge label={task.priority} variant={getPriorityVariant(task.priority) as any} size="sm" />
          <Badge label={task.status} variant={getStatusVariant(task.status) as any} size="sm" />
        </div>
      </div>
      <p className="task-card-prompt" style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {task.prompt}
      </p>
      <div className="task-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-surface)' }}>
        <span className="task-card-date" style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{new Date(task.createdAt).toLocaleDateString()}</span>
        {task._count && (
          <span className="task-card-workflows" style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{task._count.workflows} workflows</span>
        )}
      </div>
    </Link>
  );
}

export default TaskCard;
