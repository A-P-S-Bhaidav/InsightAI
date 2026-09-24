'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Database, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
  borderRadius: 10, padding: 20,
};

const TABS = ['Data Table', 'Visualization', 'Sources'];

export default function DatasetDetailPage() {
  const { id } = useParams() as { id: string };
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Data Table');

  useEffect(() => {
    fetch(`/api/datasets/${id}`)
      .then(r => r.json())
      .then(d => { setResponse(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
    </div>;
  }

  if (!response?.dataset) {
    return <div style={{ ...cardStyle, textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
      Dataset not found. <Link href="/datasets" style={{ color: 'var(--color-primary)' }}>Back to datasets</Link>
    </div>;
  }

  const dataset = response.dataset;
  const dataPoints = (response.dataPoints || []).map((dp: any) => dp.data || {});
  const stats = response.stats || {};
  const columns = dataPoints.length > 0 ? Object.keys(dataPoints[0]).filter(k => !k.startsWith('_')) : [];

  // Sources
  const sources = (response.dataPoints || [])
    .filter((dp: any) => dp.source)
    .map((dp: any) => dp.source)
    .filter((s: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.domain === s.domain) === i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Back + Header */}
      <Link href="/datasets" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Datasets
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={20} color="var(--color-primary)" /> {dataset.name}
          </h2>
          {dataset.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{dataset.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: '#3b82f6', background: 'rgba(59,130,246,0.12)' }}>
            {dataset.rowCount} rows
          </span>
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: dataset.qualityScore > 70 ? '#10b981' : '#f59e0b', background: dataset.qualityScore > 70 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)' }}>
            {dataset.qualityScore}% Quality
          </span>
          <a href={`/api/datasets/${id}/export?format=csv`} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, fontSize: 12, color: 'var(--color-primary)', background: 'var(--bg-surface-elevated)', textDecoration: 'none', border: '1px solid var(--border-color)' }}>
            <Download size={12} /> CSV
          </a>
          <a href={`/api/datasets/${id}/export?format=json`} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, fontSize: 12, color: 'var(--color-primary)', background: 'var(--bg-surface-elevated)', textDecoration: 'none', border: '1px solid var(--border-color)' }}>
            <Download size={12} /> JSON
          </a>
        </div>
      </div>

      {/* Full-width tabs */}
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden',
      }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 0', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
            background: tab === t ? 'var(--color-primary)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-secondary)',
            border: 'none', borderRight: '1px solid var(--border-color)',
          }}>{t}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={cardStyle}>
        {tab === 'Data Table' && (
          dataPoints.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>#</th>
                    {columns.map(col => (
                      <th key={col} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataPoints.map((row: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{i + 1}</td>
                      {columns.map(col => {
                        const val = String(row[col] ?? '');
                        const isUrl = val.startsWith('http');
                        return (
                          <td key={col} style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-primary)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {isUrl ? <a href={val} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{val}</a> : val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>No data points found.</div>
          )
        )}

        {tab === 'Visualization' && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Field Statistics</h3>
            {Object.keys(stats).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {Object.entries(stats).filter(([k]) => !k.startsWith('_')).map(([field, info]: [string, any]) => (
                  <div key={field} style={{ background: 'var(--bg-surface-elevated)', borderRadius: 8, padding: 16, border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{field}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span>Type: <strong>{info.type}</strong></span>
                      <span>Unique values: <strong>{info.uniqueValues}</strong></span>
                      {info.min !== undefined && <span>Range: {info.min} — {info.max}</span>}
                    </div>
                    {/* Visual bar */}
                    <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: 'var(--border-color)' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, background: 'var(--color-primary)',
                        width: `${Math.min(100, (info.uniqueValues / Math.max(dataPoints.length, 1)) * 100)}%`,
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {Math.round((info.uniqueValues / Math.max(dataPoints.length, 1)) * 100)}% unique
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                No statistics available. Try adding more data points.
              </div>
            )}

            {/* Column distribution */}
            {columns.length > 0 && dataPoints.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Column Coverage</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {columns.map(col => {
                    const filled = dataPoints.filter((r: any) => r[col] && String(r[col]).length > 0).length;
                    const pct = Math.round((filled / dataPoints.length) * 100);
                    return (
                      <div key={col} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)', minWidth: 140 }}>{col}</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--border-color)' }}>
                          <div style={{ height: '100%', borderRadius: 4, background: pct > 80 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444', width: `${pct}%`, transition: 'width 500ms' }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 45, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'Sources' && (
          sources.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {sources.map((s: any, i: number) => (
                <div key={i} style={{ background: 'var(--bg-surface-elevated)', borderRadius: 8, padding: 16, border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{s.domain}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12, fontSize: 11,
                      color: s.statusCode === 200 ? '#10b981' : '#ef4444',
                      background: s.statusCode === 200 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    }}>{s.statusCode}</span>
                  </div>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--color-primary)', wordBreak: 'break-all' }}>
                    {s.url}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>No source information available.</div>
          )
        )}
      </div>
    </div>
  );
}
