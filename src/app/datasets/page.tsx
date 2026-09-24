'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
  borderRadius: 10, padding: 20,
};

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/datasets')
      .then(r => r.json())
      .then(d => { setDatasets(Array.isArray(d) ? d : d.datasets || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          No datasets yet. Datasets are created when tasks complete successfully.
        </div>
        <Link href="/tasks/new" style={{ display: 'inline-block', marginTop: 16, color: 'var(--color-primary)', fontSize: 13, textDecoration: 'none' }}>
          Create a Task →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {datasets.map((ds: any) => (
        <Link key={ds.id} href={`/datasets/${ds.id}`} style={{ textDecoration: 'none' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>{ds.name}</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
              <span>{ds.rowCount || 0} rows</span>
              <span>Quality: {ds.qualityScore || 0}%</span>
              <span style={{ padding: '2px 8px', borderRadius: 12, background: 'var(--bg-surface-elevated)', fontSize: 11 }}>
                {ds.format || 'json'}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
