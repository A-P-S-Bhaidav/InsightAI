'use client';

import { useState } from 'react';
import { User, Key, Palette, Bell, Shield, Eye, EyeOff, Save, Upload, Laptop, Smartphone } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';
import { useToast } from '@/components/common/Toast';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // State for forms
  const [geminiKey, setGeminiKey] = useState('sk-gemini-...');
  const [groqKey, setGroqKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (section: string) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast(`${section} settings saved successfully.`, 'success');
    }, 600);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'apikeys', label: 'API Keys', icon: <Key size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  return (
    <div className="animate-fade-in p-6 max-w-6xl mx-auto">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Manage your account and preferences</p>
      </header>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Sidebar Tabs */}
        <div style={{ flex: '1 1 250px', minWidth: '250px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--color-primary-bg, rgba(59, 130, 246, 0.1))' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                className={activeTab !== tab.id ? "hover:bg-[var(--bg-surface-elevated)]" : ""}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div style={{ flex: '3 1 600px', minWidth: '300px' }}>
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="card animate-fade-in" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Profile Information</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>
                  A
                </div>
                <div>
                  <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Upload size={16} /> Change Avatar
                  </button>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Full Name</label>
                  <input type="text" className="input" defaultValue="Admin User" style={{ width: '100%', maxWidth: '400px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Email Address</label>
                  <input type="email" className="input" defaultValue="admin@insightai.dev" readOnly style={{ width: '100%', maxWidth: '400px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Email addresses cannot be changed.</p>
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => handleSave('Profile')} disabled={isSaving}>
                  <Save size={16} style={{ marginRight: '0.5rem' }} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* API KEYS TAB */}
          {activeTab === 'apikeys' && (
            <div className="card animate-fade-in" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>API Configuration</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Google Gemini API Key</label>
                    <span className="badge badge-success">Configured</span>
                  </div>
                  <div style={{ position: 'relative', maxWidth: '500px' }}>
                    <input 
                      type={showGemini ? "text" : "password"} 
                      className="input" 
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} 
                    />
                    <button 
                      onClick={() => setShowGemini(!showGemini)}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showGemini ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Groq SDK Key</label>
                    <span className="badge">Not Configured</span>
                  </div>
                  <div style={{ position: 'relative', maxWidth: '500px' }}>
                    <input 
                      type={showGroq ? "text" : "password"} 
                      className="input" 
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      placeholder="gsk_..."
                      style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)' }} 
                    />
                    <button 
                      onClick={() => setShowGroq(!showGroq)}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showGroq ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => handleSave('API Keys')} disabled={isSaving}>
                  <Save size={16} style={{ marginRight: '0.5rem' }} /> {isSaving ? 'Saving...' : 'Save Keys'}
                </button>
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="card animate-fade-in" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Appearance</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>Theme Preference</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Choose between dark and light mode.</p>
                  </div>
                  <div style={{ display: 'flex', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.25rem' }}>
                    <button 
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: theme === 'dark' ? 'var(--bg-surface-elevated)' : 'transparent', color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      Dark
                    </button>
                    <button 
                      onClick={() => theme !== 'light' && toggleTheme()}
                      style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: theme === 'light' ? 'var(--bg-surface-elevated)' : 'transparent', color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      Light
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>Sidebar Position</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Position the main navigation sidebar.</p>
                  </div>
                  <select className="select" style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
                    <option>Left</option>
                    <option>Right</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="card animate-fade-in" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Notifications</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>Email Notifications</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Receive weekly reports and updates.</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }} />
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>Task Completion Alerts</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Get notified when a long-running task finishes.</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={taskAlerts} onChange={(e) => setTaskAlerts(e.target.checked)} style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }} />
                  </label>
                </div>
              </div>
              
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => handleSave('Notification')} disabled={isSaving}>
                  <Save size={16} style={{ marginRight: '0.5rem' }} /> {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="card animate-fade-in" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>Security Settings</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 1rem 0' }}>Change Password</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
                    <input type="password" placeholder="Current Password" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
                    <input type="password" placeholder="New Password" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
                    <button className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>Update Password</button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>Two-Factor Authentication</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Add an extra layer of security to your account.</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }} />
                  </label>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: '0 0 1rem 0' }}>Active Sessions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Laptop size={24} color="var(--color-primary)" />
                        <div>
                          <p style={{ fontWeight: 500, margin: 0 }}>Mac OS Safari</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Mumbai, India • Current Session</p>
                        </div>
                      </div>
                      <span className="badge badge-success">Active</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Smartphone size={24} color="var(--text-muted)" />
                        <div>
                          <p style={{ fontWeight: 500, margin: 0 }}>iPhone iOS Safari</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Mumbai, India • Last active 2 hours ago</p>
                        </div>
                      </div>
                      <button className="btn btn-ghost" style={{ fontSize: '0.875rem', color: 'var(--color-danger)' }}>Revoke</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
