'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredTasks = statusFilter === 'All' 
    ? tasks 
    : tasks.filter(t => t.status === statusFilter.toLowerCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#fff' }}>Tasks</h1>
        <Link 
          href="/tasks/new"
          style={{
            background: 'var(--color-primary, #6366f1)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          + New Task
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
        {['All', 'Pending', 'Running', 'Completed', 'Failed'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              background: statusFilter === status ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: statusFilter === status ? 'var(--color-primary, #6366f1)' : '#888',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#888' }}>Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px dashed rgba(255,255,255,0.1)', 
          borderRadius: '12px', 
          padding: '40px', 
          textAlign: 'center' 
        }}>
          <p style={{ color: '#888', marginBottom: '16px' }}>No tasks found. Create your first task to get started.</p>
          <Link 
            href="/tasks/new"
            style={{
              background: 'var(--color-primary, #6366f1)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              display: 'inline-block'
            }}
          >
            Create Task
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTasks.map(task => (
            <Link 
              key={task.id} 
              href={`/tasks/${task.id}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '20px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{task.title || 'Untitled Task'}</span>
                <span style={{ fontSize: '14px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                  {task.prompt}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
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
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Just now'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
