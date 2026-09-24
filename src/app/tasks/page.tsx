'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';

const FILTERS = ['All', 'Pending', 'Running', 'Completed', 'Failed'];

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 10,
  padding: '16px 20px',
  textDecoration: 'none',
  display: 'block',
  transition: 'border-color 150ms',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(d => { setTasks(Array.isArray(d) ? d : d.tasks || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status?.toLowerCase() === filter.toLowerCase());

  const badge = (status: string) => {
    const map: Record<string, { c: string; bg: string }> = {
      completed: { c: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      failed: { c: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      running: { c: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      pending: { c: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    };
    const s = map[status?.toLowerCase()] || { c: 'var(--text-muted)', bg: 'var(--bg-surface-elevated)' };
    return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: s.c, background: s.bg }}>{status}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top row: New Task button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link href="/tasks/new" style={{ textDecoration: 'none' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--color-primary)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <Plus size={15} /> New Task
          </button>
        </Link>
      </div>

      {/* Filter tabs — full width, evenly distributed */}
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${FILTERS.length}, 1fr)`, gap: 0,
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden',
      }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '10px 0', fontSize: 13, fontWeight: filter === f ? 600 : 400, cursor: 'pointer',
              background: filter === f ? 'var(--color-primary)' : 'transparent',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              border: 'none', borderRight: '1px solid var(--border-color)',
              transition: 'all 150ms',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>
          No tasks found. {filter !== 'All' ? 'Try a different filter or ' : ''}
          <Link href="/tasks/new" style={{ color: 'var(--color-primary)' }}>Create your first task</Link>.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((task: any) => (
            <Link key={task.id} href={`/tasks/${task.id}`} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {task.title || `Task #${task.id}`}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.prompt || 'No description'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 16, flexShrink: 0 }}>
                  {badge(task.status || 'pending')}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 70, textAlign: 'right' }}>
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
