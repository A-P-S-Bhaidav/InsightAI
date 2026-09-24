'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/datasets')
      .then(res => res.json())
      .then(data => {
        setDatasets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#fff' }}>Datasets</h1>
        <p style={{ color: '#888', margin: 0 }}>Browse your collected data</p>
      </div>

      {loading ? (
        <div style={{ color: '#888' }}>Loading datasets...</div>
      ) : datasets.length === 0 ? (
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px dashed rgba(255,255,255,0.1)', 
          borderRadius: '12px', 
          padding: '40px', 
          textAlign: 'center' 
        }}>
          <p style={{ color: '#888', margin: 0 }}>No datasets found. Run tasks to generate datasets.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px' }}>
          {datasets.map(ds => (
            <Link
              key={ds.id}
              href={`/datasets/${ds.id}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '24px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{ds.name || 'Untitled Dataset'}</span>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ccc'
                }}>
                  {ds.format || 'JSON'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px' }}>
                <span style={{ fontSize: '14px', color: '#888' }}>
                  {ds.rowCount || 0} rows • QS: {ds.qualityScore || 'N/A'}
                </span>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {ds.createdAt ? new Date(ds.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
