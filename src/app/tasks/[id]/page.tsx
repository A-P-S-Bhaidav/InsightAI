'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Play, Trash2, Download } from 'lucide-react';
import Link from 'next/link';

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
  borderRadius: 10, padding: 20,
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTask = () => {
    fetch(`/api/tasks/${params.id}`)
      .then(r => r.json())
      .then(d => { setTask(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTask(); }, [params.id]);

  const handleExecute = async () => {
    setExecuting(true);
    try {
      await fetch(`/api/tasks/${params.id}/execute`, { method: 'POST' });
      // Poll for updates
      const poll = setInterval(async () => {
        const r = await fetch(`/api/tasks/${params.id}`);
        const d = await r.json();
        setTask(d);
        if (d.status === 'completed' || d.status === 'failed') {
          clearInterval(poll);
          setExecuting(false);
        }
      }, 2000);
    } catch {
      setExecuting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    setDeleting(true);
    await fetch(`/api/tasks/${params.id}`, { method: 'DELETE' });
    router.push('/tasks');
  };

  const badge = (status: string) => {
    const map: Record<string, { c: string; bg: string }> = {
      completed: { c: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      failed: { c: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      running: { c: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      pending: { c: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    };
    const s = map[status?.toLowerCase()] || { c: 'var(--text-muted)', bg: 'var(--bg-surface-elevated)' };
    return <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, color: s.c, background: s.bg }}>{status}</span>;
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
    </div>;
  }

  if (!task) {
    return <div style={{ ...cardStyle, textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Task not found.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title + Status + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{task.title}</h2>
            {badge(task.status)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Created {new Date(task.createdAt).toLocaleString()} • Priority: {task.priority}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {task.status === 'pending' && (
            <button onClick={handleExecute} disabled={executing} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
              background: 'var(--color-primary)', color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              {executing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
              Execute
            </button>
          )}
          {task.status === 'running' && (
            <button disabled style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
              background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-color)',
              fontSize: 13, cursor: 'not-allowed',
            }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Running...
            </button>
          )}
          <button onClick={handleDelete} disabled={deleting} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
            background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
            fontSize: 13, cursor: 'pointer',
          }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Prompt */}
      <div style={{
        background: 'var(--bg-surface-elevated)', borderLeft: '3px solid var(--color-primary)',
        padding: 16, borderRadius: '0 8px 8px 0', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6,
      }}>
        {task.prompt}
      </div>

      {/* Error */}
      {task.status === 'failed' && task.errorMessage && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 13 }}>
          <strong>Error:</strong> {task.errorMessage}
        </div>
      )}

      {/* Workflows */}
      {task.workflows && task.workflows.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Workflow Steps</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {task.workflows.map((wf: any) => (
              <div key={wf.id}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>{wf.name}</div>
                {wf.steps && wf.steps.map((step: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                    borderBottom: '1px solid var(--border-light)',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: step.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'var(--bg-surface-elevated)',
                      color: step.status === 'completed' ? '#10b981' : 'var(--text-muted)',
                    }}>
                      {step.status === 'completed' ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{step.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{step.type}</span>
                  </div>
                ))}

                {/* Datasets from this workflow */}
                {wf.datasets && wf.datasets.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Datasets</h4>
                    {wf.datasets.map((ds: any) => (
                      <Link key={ds.id} href={`/datasets/${ds.id}`} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: 12, borderRadius: 8, background: 'var(--bg-surface-elevated)',
                        textDecoration: 'none', marginBottom: 8,
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{ds.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ds.rowCount} rows • Quality: {ds.qualityScore}%</div>
                        </div>
                        <Download size={14} color="var(--color-primary)" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
