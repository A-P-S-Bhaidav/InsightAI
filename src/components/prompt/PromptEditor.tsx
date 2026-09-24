'use client'
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PromptEditorProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

export function PromptEditor({ onSubmit, isLoading = false }: PromptEditorProps) {
  const [prompt, setPrompt] = useState('');

  const examples = [
    'Find remote software engineering jobs in the US',
    'Collect competitor pricing data for SaaS tools',
    'Gather customer reviews for iPhone 16',
    'Research venture capital firms investing in AI startups',
    'Find trending tech news from the last week',
    'Collect email addresses of marketing agencies in New York'
  ];

  const handleSubmit = () => {
    if (prompt.length >= 20 && !isLoading) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="prompt-editor" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <textarea
        className="textarea"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What would you like InsightAI to research for you?"
        rows={6}
        style={{ width: '100%', resize: 'vertical' }}
      />
      <div className="prompt-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="character-count" style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          {prompt.length} characters {prompt.length < 20 && '(min 20)'}
        </span>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={prompt.length < 20 || isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {isLoading && <Loader2 className="animate-spin" size={16} />}
          Generate Workflow
        </button>
      </div>
      <div className="example-prompts" style={{ marginTop: '1rem' }}>
        <p className="example-prompts-title" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-muted)' }}>Example prompts:</p>
        <div className="chips-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {examples.map((example, idx) => (
            <button 
              key={idx} 
              className="chip" 
              onClick={() => setPrompt(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PromptEditor;
