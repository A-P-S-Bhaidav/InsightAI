'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)',
  borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6,
};

export default function NewTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, prompt, tags: tags.split(',').map(t => t.trim()).filter(Boolean), priority }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create task');
      router.push(`/tasks/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
        Describe the data you need in plain English.
      </p>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div>
          <label style={labelStyle}>Task Title</label>
          <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Tech Startups in Bay Area" required />
        </div>
        <div>
          <label style={labelStyle}>What data do you need?</label>
          <textarea
            style={{ ...inputStyle, minHeight: 140, resize: 'vertical', fontFamily: 'inherit' }}
            value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the data you want to collect, the format, sources, and any specific filters..."
            required
          />
        </div>
        <div>
          <label style={labelStyle}>Tags (comma separated)</label>
          <input style={inputStyle} value={tags} onChange={e => setTags(e.target.value)} placeholder="startup, tech, funding" />
        </div>
        <div>
          <label style={labelStyle}>Priority</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={priority} onChange={e => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', height: 44, borderRadius: 8, border: 'none',
            background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}
