'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
  borderRadius: 10, padding: 20,
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/workflows')
      .then(r => r.json())
      .then(d => { setWorkflows(Array.isArray(d) ? d : d.workflows || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          No workflows yet. Workflows are generated when you execute tasks.
        </div>
        <Link href="/tasks/new" style={{ display: 'inline-block', marginTop: 16, color: 'var(--color-primary)', fontSize: 13, textDecoration: 'none' }}>
          Create a Task →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {workflows.map((wf: any) => (
        <div key={wf.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{wf.name}</div>
            {badge(wf.status || 'pending')}
          </div>
          {/* Progress bar */}
          <div style={{ height: 4, borderRadius: 2, background: 'var(--border-color)', marginBottom: 8 }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${wf.totalSteps ? (wf.progress / wf.totalSteps) * 100 : 0}%`,
              background: 'var(--color-primary)', transition: 'width 300ms',
            }} />
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>{wf.progress || 0} of {wf.totalSteps || 0} steps</span>
            <span>{wf.createdAt ? new Date(wf.createdAt).toLocaleDateString() : '—'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
