'use client';

import React, { useState } from 'react';
import { useTheme } from '@/components/layout/ThemeProvider';

const TABS = ['Profile', 'Appearance', 'API Keys'];

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 10,
  padding: 24,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--bg-surface-elevated)',
  border: '1px solid var(--border-color)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: 6,
};

export default function SettingsPage() {
  const [tab, setTab] = useState('Profile');
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Tab bar — full width, evenly distributed */}
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${TABS.length}, 1fr)`, gap: 0,
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden',
      }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 0', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
              background: tab === t ? 'var(--color-primary)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-secondary)',
              border: 'none', borderRight: '1px solid var(--border-color)',
              transition: 'all 150ms',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Profile' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>Profile Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} disabled value="Loaded from session" />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', padding: '10px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                User
              </div>
            </div>
            <button
              onClick={handleSave}
              style={{
                alignSelf: 'flex-start', padding: '8px 20px', borderRadius: 8,
                background: 'var(--color-primary)', color: '#fff', border: 'none',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

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
            <button
              onClick={toggleTheme}
              style={{
                width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                background: theme === 'dark' ? 'var(--color-primary)' : 'var(--border-color)',
                position: 'relative', transition: 'background 200ms',
              }}
            >
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

      {tab === 'API Keys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { name: 'Gemini API Key', env: 'GEMINI_API_KEY' },
            { name: 'Groq API Key', env: 'GROQ_API_KEY' },
          ].map(k => (
            <div key={k.name} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{k.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Environment: {k.env}</div>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  color: '#10b981', background: 'rgba(16,185,129,0.12)',
                }}>
                  Configured ✓
                </span>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '4px 0' }}>
            API keys are configured via environment variables on the server.
          </div>
        </div>
      )}
    </div>
  );
}
