'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X, Lightbulb } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)',
  borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, outline: 'none',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 };
const cardStyle: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 24 };

const EXAMPLE_PROMPTS = [
  { title: 'Deep Tech Founders', prompt: 'Get me the data for founders of Deep Tech startups with their email IDs and LinkedIn account', columns: ['Founder Name', 'Company Name', 'Email', 'LinkedIn URL', 'Industry', 'Location'] },
  { title: 'SaaS Pricing', prompt: 'Collect pricing data for top SaaS project management tools including features and plans', columns: ['Product Name', 'Company', 'Price', 'Plan Tier', 'Key Features', 'Website'] },
  { title: 'AI Job Listings', prompt: 'Find remote AI/ML engineering jobs with salaries above $150k', columns: ['Job Title', 'Company', 'Salary', 'Location', 'Experience Required', 'Posted Date'] },
  { title: 'VC Funding Rounds', prompt: 'Get recent Series A and Series B funding rounds in the climate tech space', columns: ['Startup Name', 'Funding Amount', 'Round', 'Lead Investor', 'Industry', 'Date'] },
];

export default function NewTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState('medium');
  const [columns, setColumns] = useState<string[]>([]);
  const [newCol, setNewCol] = useState('');
  const [rowCount, setRowCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addColumn = () => {
    if (newCol.trim() && !columns.includes(newCol.trim())) {
      setColumns([...columns, newCol.trim()]);
      setNewCol('');
    }
  };

  const removeColumn = (col: string) => setColumns(columns.filter(c => c !== col));

  const useExample = (ex: typeof EXAMPLE_PROMPTS[0]) => {
    setTitle(ex.title);
    setPrompt(ex.prompt);
    setColumns(ex.columns);
    setRowCount(20);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Build enhanced prompt with column + row context
    let enhancedPrompt = prompt;
    if (columns.length > 0) {
      enhancedPrompt += `\n\nRequired columns: ${columns.join(', ')}`;
    }
    if (rowCount) {
      enhancedPrompt += `\nTarget row count: ${rowCount}`;
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          prompt: enhancedPrompt,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          priority,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create task');
      router.push(`/tasks/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Left — Form */}
        <form onSubmit={handleSubmit} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Task Title *</label>
            <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Deep Tech Founder Contacts" required />
          </div>

          <div>
            <label style={labelStyle}>What data do you need? *</label>
            <textarea
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the data you want to collect in detail. Be specific about what fields you need, which sources to look at, and any filters..."
              required
            />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Tip: The more specific you are, the better the results. Mention exact columns, sources, and filters.
            </div>
          </div>

          {/* Columns Section */}
          <div>
            <label style={labelStyle}>Data Columns (What fields do you want?)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={newCol}
                onChange={e => setNewCol(e.target.value)}
                placeholder="e.g., Founder Name, Email, LinkedIn URL..."
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addColumn(); } }}
              />
              <button
                type="button" onClick={addColumn}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 40, borderRadius: 8,
                  background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0,
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            {columns.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {columns.map((col, i) => (
                  <span key={col} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                    background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>#{i + 1}</span>
                    {col}
                    <button type="button" onClick={() => removeColumn(col)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Row count + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Target Rows</label>
              <input
                type="number" style={inputStyle} value={rowCount}
                onChange={e => setRowCount(Math.min(500, Math.max(5, parseInt(e.target.value) || 20)))}
                min={5} max={500}
              />
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tags</label>
              <input style={inputStyle} value={tags} onChange={e => setTags(e.target.value)} placeholder="startup, tech" />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', height: 46, borderRadius: 8, border: 'none',
              background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Creating Task...' : 'Create & Execute Task'}
          </button>
        </form>

        {/* Right — Examples */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
            <Lightbulb size={14} /> Quick Templates
          </div>
          {EXAMPLE_PROMPTS.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => useExample(ex)}
              style={{
                ...cardStyle, padding: 16, textAlign: 'left', cursor: 'pointer',
                border: '1px solid var(--border-color)', transition: 'border-color 150ms',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{ex.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                {ex.prompt.slice(0, 80)}...
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ex.columns.slice(0, 4).map(col => (
                  <span key={col} style={{
                    padding: '2px 6px', borderRadius: 4, fontSize: 10,
                    background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)',
                  }}>{col}</span>
                ))}
                {ex.columns.length > 4 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{ex.columns.length - 4}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
