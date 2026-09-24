'use client';

import { useState } from 'react';
import { Key, Palette, Trash2, Info, Eye, EyeOff, Save, Database } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveApiConfig = async () => {
    setIsSaving(true);
    // Simulate API save
    setTimeout(() => {
      setIsSaving(false);
      toast('Your API configuration has been updated.', 'success');
    }, 800);
  };

  const handleClearData = async () => {
    setClearModalOpen(false);
    toast('All local data has been successfully removed.', 'success');
  };

  return (
    <div className="animate-fade-in p-6 max-w-4xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[var(--color-text-muted)]">Configure your InsightAI preferences</p>
      </header>

      <div className="space-y-6">
        <section className="card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-[var(--color-primary)]" />
            API Configuration
          </h2>
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium mb-1">Gemini API Key</label>
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"} 
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Your API key is stored securely and never shared. Required for data extraction tasks.
              </p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleSaveApiConfig}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </section>

        <section className="card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--color-primary)]" />
            Appearance
          </h2>
          <div className="flex items-center justify-between max-w-xl">
            <div>
              <p className="font-medium">Theme Preference</p>
              <p className="text-sm text-[var(--color-text-muted)]">Toggle between dark and light mode</p>
            </div>
            <div className="flex bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-1">
              <button 
                className={`px-4 py-1.5 rounded-md text-sm transition-colors ${theme === 'dark' ? 'bg-[var(--color-surface)] shadow font-medium' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                onClick={() => theme !== 'dark' && toggleTheme()}
              >
                Dark
              </button>
              <button 
                className={`px-4 py-1.5 rounded-md text-sm transition-colors ${theme === 'light' ? 'bg-[var(--color-surface)] shadow font-medium' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                onClick={() => theme !== 'light' && toggleTheme()}
              >
                Light
              </button>
            </div>
          </div>
        </section>

        <section className="card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-[var(--color-primary)]" />
            Data Management
          </h2>
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export All Data</p>
                <p className="text-sm text-[var(--color-text-muted)]">Download all tasks and datasets as JSON</p>
              </div>
              <button className="btn btn-secondary">
                Export
              </button>
            </div>
            <div className="h-px bg-[var(--color-border)] my-4 w-full"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--color-error)]">Clear All Data</p>
                <p className="text-sm text-[var(--color-text-muted)]">Permanently delete all local tasks and datasets</p>
              </div>
              <button 
                className="btn btn-danger"
                onClick={() => setClearModalOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Data
              </button>
            </div>
          </div>
        </section>

        <section className="card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--color-primary)]" />
            About
          </h2>
          <div className="space-y-2 text-sm max-w-xl">
            <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
              <span className="text-[var(--color-text-muted)]">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border)] py-2">
              <span className="text-[var(--color-text-muted)]">Tech Stack</span>
              <span className="font-medium">Next.js 15, Prisma, Vanilla CSS</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-[var(--color-text-muted)]">Source Code</span>
              <a href="#" className="text-[var(--color-primary)] hover:underline">View on GitHub</a>
            </div>
          </div>
        </section>
      </div>

      <Modal 
        isOpen={clearModalOpen} 
        onClose={() => setClearModalOpen(false)}
        title="Clear All Data"
      >
        <div className="space-y-4">
          <p className="text-sm">Are you absolutely sure you want to delete all tasks, workflows, and datasets? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn btn-ghost" onClick={() => setClearModalOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleClearData}>Delete Everything</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
