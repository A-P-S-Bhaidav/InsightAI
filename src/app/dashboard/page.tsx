'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListTodo, CheckCircle, Database, TrendingUp, Plus, ArrowRight } from 'lucide-react';

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 10,
  padding: 20,
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => {
        setData({ totalTasks: 0, completedTasks: 0, dataPoints: 0, avgQuality: 0, recentTasks: [] });
        setLoading(false);
      });
  }, []);

  const badge = (status: string) => {
    const map: Record<string, { c: string; bg: string }> = {
      completed: { c: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      failed: { c: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
      running: { c: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      pending: { c: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    };
    const s = map[status.toLowerCase()] || { c: 'var(--text-muted)', bg: 'var(--bg-surface-elevated)' };
    return (
      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: s.c, background: s.bg }}>
        {status}
      </span>
    );
  };

  const stats = [
    { icon: <ListTodo size={18} />, title: 'Total Tasks', value: data?.totalTasks || 0, color: '#3b82f6' },
    { icon: <CheckCircle size={18} />, title: 'Completed', value: data?.completedTasks || 0, color: '#10b981' },
    { icon: <Database size={18} />, title: 'Data Points', value: data?.totalDataPoints || 0, color: '#8b5cf6' },
    { icon: <TrendingUp size={18} />, title: 'Avg Quality', value: data?.averageQualityScore ? `${Math.round(data.averageQualityScore)}%` : '0%', color: '#f59e0b' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Welcome row — no duplicate title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Here&apos;s what&apos;s happening with your data.</p>
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

      {/* Stats grid — full width, 4 equal columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: `${s.color}18`, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.icon}</div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.title}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
              {loading ? '—' : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two columns — Recent Tasks + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Tasks */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recent Tasks</h2>
            <Link href="/tasks" style={{ fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center', fontSize: 13 }}>Loading...</div>
          ) : data?.recentTasks?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.recentTasks.slice(0, 5).map((task: any, i: number) => (
                <Link key={i} href={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid var(--border-light)',
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{task.title || task.name || `Task #${i + 1}`}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {badge(task.status || 'pending')}
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center', fontSize: 13 }}>
              No tasks yet. Create your first task to get started.
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Create New Task', href: '/tasks/new', primary: true },
              { label: 'View Datasets', href: '/datasets', primary: false },
              { label: 'Browse Workflows', href: '/workflows', primary: false },
            ].map((a, i) => (
              <Link key={i} href={a.href} style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%', height: 40, borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: a.primary ? 'var(--color-primary)' : 'var(--bg-surface-elevated)',
                  color: a.primary ? '#fff' : 'var(--text-primary)',
                  border: a.primary ? 'none' : '1px solid var(--border-color)',
                }}>
                  {a.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
