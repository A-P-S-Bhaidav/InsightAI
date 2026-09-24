'use client'
import React from 'react';
import Link from 'next/link';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { ListTodo } from 'lucide-react';

interface RecentTasksProps {
  tasks: Array<{ id: string, title: string, status: string, createdAt: string, prompt: string }>;
}

export function RecentTasks({ tasks }: RecentTasksProps) {
  if (tasks.length === 0) {
    return (
      <div className="card">
        <EmptyState 
          icon={<ListTodo size={48} />}
          title="No tasks yet"
          description="Create your first task to see it here."
          action={{ label: 'New Task', href: '/tasks/new' }}
        />
      </div>
    );
  }

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

  return (
    <div className="recent-tasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {tasks.map(task => (
        <Link href={`/tasks/${task.id}`} key={task.id} className="card task-list-item" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'border-color 0.2s' }}>
          <div className="task-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 className="task-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{task.title}</h4>
            <Badge label={task.status} variant={getStatusVariant(task.status) as any} size="sm" />
          </div>
          <p className="task-prompt truncate" style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.prompt}</p>
          <span className="task-time" style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{new Date(task.createdAt).toLocaleDateString()}</span>
        </Link>
      ))}
    </div>
  );
}

export default RecentTasks;
