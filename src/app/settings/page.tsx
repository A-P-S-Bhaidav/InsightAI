'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/components/layout/ThemeProvider';
import { Key, Plus, Trash2, Copy, Check, Loader2 } from 'lucide-react';

const TABS = ['Profile', 'Appearance', 'API Keys', 'Usage'];

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 10,
  padding: 24,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)',
  borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6,
};

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('Profile');
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const r = await fetch('/api/keys');
      if (r.ok) {
        const d = await r.json();
        setApiKeys(d.keys || []);
      }
    } catch { /* */ }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch('/api/stats');
      if (r.ok) setStats(await r.json());
    } catch { /* */ }
  }, []);

  useEffect(() => {
    if (tab === 'API Keys') fetchKeys();
    if (tab === 'Usage') fetchStats();
  }, [tab, fetchKeys, fetchStats]);

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const r = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName, expiresInDays: 90 }),
      });
      const d = await r.json();
      if (r.ok) {
        setCreatedKey(d.key);
        setNewKeyName('');
        fetchKeys();
      }
    } catch { /* */ }
    setLoading(false);
  };

  const revokeKey = async (id: string) => {
    await fetch(`/api/keys?id=${id}`, { method: 'DELETE' });
    fetchKeys();
  };

  const copyKey = () => {
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tabs */}
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

      {/* Profile */}
      {tab === 'Profile' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>Profile Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} defaultValue="Demo User" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} defaultValue="demo@insightai.com" disabled />
            </div>
          </div>
          <button style={{
            marginTop: 20, padding: '10px 20px', borderRadius: 8, border: 'none',
            background: 'var(--color-primary)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>Save Changes</button>
        </div>
      )}

      {/* Appearance */}
      {tab === 'Appearance' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>Theme</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Switch between dark and light appearance
              </div>
            </div>
            <button onClick={toggleTheme} style={{
              width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
              background: theme === 'dark' ? 'var(--color-primary)' : 'var(--border-color)',
              position: 'relative', transition: 'background 200ms',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: theme === 'dark' ? 25 : 3,
                transition: 'left 200ms',
              }} />
            </button>
          </div>
        </div>
      )}

      {/* API Keys */}
      {tab === 'API Keys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Create new key */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key size={16} /> Create API Key
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                placeholder="Key name (e.g., Production, Development)" onKeyDown={e => e.key === 'Enter' && createKey()} />
              <button onClick={createKey} disabled={loading} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8,
                background: 'var(--color-primary)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>
                {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                Create
              </button>
            </div>

            {/* Show newly created key */}
            {createdKey && (
              <div style={{
                marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}>
                <div style={{ fontSize: 12, color: '#10b981', fontWeight: 500, marginBottom: 6 }}>
                  ⚠️ Save this key — it will not be shown again
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <code style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {createdKey}
                  </code>
                  <button onClick={copyKey} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 6,
                    background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)',
                    color: copied ? '#10b981' : 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
                  }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Provider Keys */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>AI Providers</h3>
            {[
              { name: 'Gemini API Key', env: 'GEMINI_API_KEY' },
              { name: 'Groq API Key', env: 'GROQ_API_KEY' },
            ].map(k => (
              <div key={k.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{k.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>env: {k.env}</div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, color: '#10b981', background: 'rgba(16,185,129,0.12)' }}>
                  Configured ✓
                </span>
              </div>
            ))}
          </div>

          {/* Existing keys */}
          {apiKeys.length > 0 && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Your API Keys</h3>
              {apiKeys.map(k => (
                <div key={k.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid var(--border-light)',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{k.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {k.keyPrefix}••••••••  •  {k.usageCount} uses
                      {k.lastUsedAt && ` • Last used: ${new Date(k.lastUsedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 12, fontSize: 11,
                      color: k.isActive ? '#10b981' : '#ef4444',
                      background: k.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    }}>
                      {k.isActive ? 'Active' : 'Revoked'}
                    </span>
                    {k.isActive && (
                      <button onClick={() => revokeKey(k.id)} style={{
                        display: 'flex', alignItems: 'center', padding: 6, borderRadius: 6,
                        background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444', cursor: 'pointer',
                      }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Usage */}
      {tab === 'Usage' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>Usage & Quotas</h3>
          {stats ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Total Tasks', value: stats.totalTasks, max: 50, color: '#3b82f6' },
                { label: 'Completed Tasks', value: stats.completedTasks, max: stats.totalTasks || 1, color: '#10b981' },
                { label: 'Data Points', value: stats.totalDataPoints, max: 10000, color: '#8b5cf6' },
                { label: 'Datasets', value: stats.totalDatasets, max: 100, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg-surface-elevated)', borderRadius: 8, padding: 16, border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{s.value}</div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--border-color)' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: s.color, width: `${Math.min(100, (s.value / s.max) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading usage data...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
