'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    fetch(`/api/tasks/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        setTask(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  const handleExecute = async () => {
    setExecuting(true);
    try {
      await fetch(`/api/tasks/${resolvedParams.id}/execute`, { method: 'POST' });
      setTask({ ...task, status: 'running' });
    } catch (err) {
      console.error(err);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <div style={{ color: '#888' }}>Loading task...</div>;
  if (!task) return <div style={{ color: '#f87171' }}>Task not found</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#fff' }}>{task.title || 'Untitled Task'}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: task.status === 'completed' ? 'rgba(34,197,94,0.1)' : 
                            task.status === 'running' ? 'rgba(59,130,246,0.1)' : 
                            task.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.1)',
                color: task.status === 'completed' ? '#4ade80' : 
                       task.status === 'running' ? '#60a5fa' : 
                       task.status === 'failed' ? '#f87171' : '#ccc'
              }}>
                {task.status || 'unknown'}
              </span>
              <span style={{ color: '#666', fontSize: '14px' }}>
                Created {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'recently'}
              </span>
            </div>
          </div>
        </div>

        <blockquote style={{
          background: 'rgba(255,255,255,0.03)',
          borderLeft: '3px solid var(--color-primary, #6366f1)',
          padding: '16px',
          borderRadius: '0 8px 8px 0',
          margin: 0,
          color: '#e2e8f0',
          fontSize: '15px',
          lineHeight: 1.6
        }}>
          {task.prompt || 'No prompt provided'}
        </blockquote>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          {task.status === 'pending' && (
            <button 
              onClick={handleExecute}
              disabled={executing}
              style={{
                background: 'var(--color-primary, #6366f1)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 500,
                cursor: executing ? 'not-allowed' : 'pointer',
                opacity: executing ? 0.7 : 1
              }}
            >
              {executing ? 'Executing...' : 'Execute Task'}
            </button>
          )}
          {task.status === 'running' && (
            <button disabled style={{
              background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 500, cursor: 'not-allowed'
            }}>
              Running...
            </button>
          )}
          {task.status === 'completed' && task.datasetId && (
            <Link href={`/datasets/${task.datasetId}`} style={{
              background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 500
            }}>
              View Dataset
            </Link>
          )}
          <button style={{
            background: 'transparent', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 16px', borderRadius: '8px', fontWeight: 500, cursor: 'pointer'
          }}>
            Delete
          </button>
        </div>

        {task.status === 'failed' && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '16px', borderRadius: '8px' }}>
            <strong>Error:</strong> {task.errorMessage || 'An unknown error occurred during execution.'}
          </div>
        )}
      </div>

      {(task.workflows || task.datasetId) && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#fff' }}>Results & Pipeline</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#ccc' }}>Workflow Steps</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#888', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ color: '#fff' }}>Initializing agents</li>
                <li style={{ color: '#fff' }}>Fetching data sources</li>
                <li style={{ color: task.status === 'running' ? '#60a5fa' : '#fff' }}>Processing context {task.status === 'running' && '...'}</li>
                {task.status === 'completed' && <li style={{ color: '#4ade80' }}>Finalizing dataset</li>}
              </ul>
            </div>
            
            {task.datasetId && (
               <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                 <h3 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#ccc' }}>Dataset Preview</h3>
                 <p style={{ color: '#888', fontSize: '14px' }}>Data preview is available in the datasets view.</p>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
