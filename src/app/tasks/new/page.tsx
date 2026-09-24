'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, prompt, tags, priority })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/tasks/${data.id}`);
      } else {
        console.error('Failed to create task');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fff',
    width: '100%',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '8px',
    display: 'block',
    color: '#ccc'
  };

  const fieldStyle = {
    marginBottom: '24px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#fff' }}>Create New Task</h1>
        <p style={{ color: '#888', margin: 0 }}>Describe the data you need in plain English</p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '32px'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Task Title</label>
            <input 
              style={inputStyle} 
              placeholder="e.g., Tech Startups in Bay Area" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>What data do you need?</label>
            <textarea 
              style={{ ...inputStyle, minHeight: '160px', resize: 'vertical' }} 
              placeholder="Describe the data you want to collect..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input 
              style={inputStyle} 
              placeholder="startup, tech, funding"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Priority</label>
            <select 
              style={inputStyle}
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: 'var(--color-primary, #6366f1)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0 16px',
              height: '48px',
              width: '100%',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
