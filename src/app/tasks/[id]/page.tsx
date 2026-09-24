'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Play, Trash2, Download, CheckCircle, XCircle, Clock, Zap, Filter, Shield, Copy, FileOutput, Database, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
  borderRadius: 10, padding: 20,
};

const STEP_ICONS: Record<string, React.ReactNode> = {
  scrape: <Zap size={14} />,
  transform: <Filter size={14} />,
  validate: <Shield size={14} />,
  deduplicate: <Copy size={14} />,
  export: <FileOutput size={14} />,
};

const STEP_COLORS: Record<string, string> = {
  scrape: '#3b82f6',
  transform: '#8b5cf6',
  validate: '#f59e0b',
  deduplicate: '#06b6d4',
  export: '#10b981',
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
    const map: Record<string, { c: string; bg: string; icon: React.ReactNode }> = {
      completed: { c: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle size={13} /> },
      failed: { c: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: <XCircle size={13} /> },
      running: { c: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> },
      pending: { c: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={13} /> },
    };
    const s = map[status?.toLowerCase()] || { c: 'var(--text-muted)', bg: 'var(--bg-surface-elevated)', icon: null };
    return <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: s.c, background: s.bg, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{s.icon}{status}</span>;
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
    </div>;
  }

  if (!task) {
    return <div style={{ ...cardStyle, textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Task not found.</div>;
  }

  const allSteps = task.workflows?.flatMap((wf: any) => wf.steps || []) || [];
  const allDatasets = task.workflows?.flatMap((wf: any) => wf.datasets || []) || [];

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
          {(task.status === 'pending' || task.status === 'failed') && (
            <button onClick={handleExecute} disabled={executing} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
              background: 'var(--color-primary)', color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              {executing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
              {task.status === 'failed' ? 'Retry' : 'Execute'}
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

      {/* Workflow Pipeline */}
      {allSteps.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>Execution Pipeline</h3>

          {/* Horizontal pipeline */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
            {allSteps.sort((a: any, b: any) => a.order - b.order).map((step: any, i: number) => {
              const color = STEP_COLORS[step.type] || '#6b7280';
              const isCompleted = step.status === 'completed';
              const isFailed = step.status === 'failed';
              const isRunning = step.status === 'running';
              let output: Record<string, unknown> = {};
              try { output = JSON.parse(step.output || '{}'); } catch { /* */ }

              return (
                <React.Fragment key={step.id || i}>
                  {/* Step card */}
                  <div style={{
                    flex: 1, minWidth: 140, position: 'relative',
                    background: isCompleted ? `${color}08` : isFailed ? 'rgba(239,68,68,0.05)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isCompleted ? color + '40' : isFailed ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`,
                    borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    {/* Icon + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: isCompleted ? color : 'var(--bg-surface)',
                        border: `1px solid ${isCompleted ? 'transparent' : 'var(--border-color)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isCompleted ? '#fff' : color,
                      }}>
                        {isCompleted ? <CheckCircle size={14} /> : isRunning ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : isFailed ? <XCircle size={14} color="#ef4444" /> : STEP_ICONS[step.type] || <Zap size={14} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{step.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{step.type}</div>
                      </div>
                    </div>

                    {/* Step output summary */}
                    {Object.keys(output).length > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, borderTop: '1px solid var(--border-light)', paddingTop: 6 }}>
                        {Object.entries(output).slice(0, 3).map(([k, v]) => (
                          <div key={k}><span style={{ color: 'var(--text-secondary)' }}>{k}:</span> {String(v)}</div>
                        ))}
                      </div>
                    )}

                    {/* Timing */}
                    {step.completedAt && step.startedAt && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {((new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime()) / 1000).toFixed(1)}s
                      </div>
                    )}

                    {/* Error */}
                    {isFailed && step.error && (
                      <div style={{ fontSize: 11, color: '#ef4444', borderTop: '1px solid rgba(239,68,68,0.2)', paddingTop: 4 }}>
                        {step.error.slice(0, 60)}
                      </div>
                    )}
                  </div>

                  {/* Connector arrow */}
                  {i < allSteps.length - 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: isCompleted ? color : 'var(--border-color)' }}>
                      <ArrowRight size={16} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Progress bar */}
          {task.workflows?.[0] && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                <span>Progress</span>
                <span>{task.workflows[0].progress}/{task.workflows[0].totalSteps} steps</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--border-color)' }}>
                <div style={{
                  height: '100%', borderRadius: 3, transition: 'width 500ms',
                  background: task.status === 'completed' ? '#10b981' : task.status === 'failed' ? '#ef4444' : 'var(--color-primary)',
                  width: `${(task.workflows[0].progress / Math.max(1, task.workflows[0].totalSteps)) * 100}%`,
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Datasets */}
      {allDatasets.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={16} color="var(--color-primary)" /> Generated Datasets
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {allDatasets.map((ds: any) => (
              <Link key={ds.id} href={`/datasets/${ds.id}`} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 16, borderRadius: 8, background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-light)', textDecoration: 'none',
                transition: 'border-color 150ms',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>{ds.name}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{ds.rowCount} rows</span>
                    <span>•</span>
                    <span style={{ color: ds.qualityScore > 70 ? '#10b981' : '#f59e0b' }}>{ds.qualityScore}% quality</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Download size={14} color="var(--color-primary)" />
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No workflows yet */}
      {allSteps.length === 0 && task.status === 'pending' && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>Ready to Execute</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Click &quot;Execute&quot; to start the AI-powered data collection pipeline.</div>
        </div>
      )}
    </div>
  );
}
