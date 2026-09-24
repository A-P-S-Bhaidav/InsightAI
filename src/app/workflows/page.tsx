'use client';
import { useState, useEffect } from 'react';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/workflows')
      .then(res => res.json())
      .then(data => {
        setWorkflows(Array.isArray(data) ? data : []);
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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#fff' }}>Workflows</h1>
        <p style={{ color: '#888', margin: 0 }}>Monitor your data pipelines</p>
      </div>

      {loading ? (
        <div style={{ color: '#888' }}>Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px dashed rgba(255,255,255,0.1)', 
          borderRadius: '12px', 
          padding: '40px', 
          textAlign: 'center' 
        }}>
          <p style={{ color: '#888', margin: 0 }}>No workflows found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {workflows.map(wf => (
            <div
              key={wf.id}
              onClick={() => setExpandedId(expandedId === wf.id ? null : wf.id)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{wf.name || 'Unnamed Pipeline'}</span>
                  <span style={{ fontSize: '14px', color: '#888' }}>
                    {wf.completedSteps || 0} of {wf.totalSteps || 3} steps completed
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: wf.status === 'completed' ? 'rgba(34,197,94,0.1)' : 
                                wf.status === 'running' ? 'rgba(59,130,246,0.1)' : 
                                wf.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.1)',
                    color: wf.status === 'completed' ? '#4ade80' : 
                           wf.status === 'running' ? '#60a5fa' : 
                           wf.status === 'failed' ? '#f87171' : '#ccc'
                  }}>
                    {wf.status || 'Unknown'}
                  </span>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    {wf.createdAt ? new Date(wf.createdAt).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
              </div>
              
              {wf.status === 'running' && (
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '16px', overflow: 'hidden' }}>
                   <div style={{ 
                     height: '100%', 
                     width: `${((wf.completedSteps || 0) / (wf.totalSteps || 1)) * 100}%`, 
                     background: 'var(--color-primary, #6366f1)',
                     transition: 'width 0.3s ease'
                   }} />
                </div>
              )}

              {expandedId === wf.id && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#888', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                    <li style={{ color: '#fff' }}>Data Collection</li>
                    <li style={{ color: wf.status === 'running' ? '#60a5fa' : '#fff' }}>Transformation & Cleaning {wf.status === 'running' && '...'}</li>
                    <li style={{ color: wf.status === 'completed' ? '#4ade80' : '#888' }}>Load to Dataset</li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
