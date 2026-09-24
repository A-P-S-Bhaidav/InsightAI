'use client';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const tabs = ['Profile', 'Appearance', 'API Keys'];

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '32px'
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 24px 0', color: '#fff' }}>Settings</h1>

      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '32px', 
        paddingBottom: '16px', 
        borderBottom: '1px solid rgba(255,255,255,0.06)' 
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: activeTab === tab ? 'var(--color-primary, #6366f1)' : '#888',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
        {activeTab === 'Profile' && (
          <div style={cardStyle}>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} defaultValue="Admin User" />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Email</label>
              <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} defaultValue="admin@insightai.com" disabled />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Role</label>
              <div style={{ color: '#888', fontSize: '14px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                Administrator
              </div>
            </div>
            <button style={{
              background: 'var(--color-primary, #6366f1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer'
            }}>
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'Appearance' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#fff', margin: '0 0 4px 0' }}>Theme</div>
                <div style={{ fontSize: '14px', color: '#888' }}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</div>
              </div>
              <div 
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{
                  width: '44px',
                  height: '24px',
                  background: isDarkMode ? 'var(--color-primary, #6366f1)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: '#fff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: isDarkMode ? '22px' : '2px',
                  transition: 'left 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'API Keys' && (
          <>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#fff', margin: '0 0 4px 0' }}>Gemini API Key</div>
                  <div style={{ fontSize: '14px', color: '#888' }}>Used for multimodal AI and reasoning tasks</div>
                </div>
                <div style={{ fontSize: '14px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ✓ Configured
                </div>
              </div>
            </div>
            
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#fff', margin: '0 0 4px 0' }}>Groq API Key</div>
                  <div style={{ fontSize: '14px', color: '#888' }}>Used for low-latency text generation</div>
                </div>
                <div style={{ fontSize: '14px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Not configured
                </div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
              Note: API keys are configured via environment variables on the server for security.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
