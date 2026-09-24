'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PromptEditor from '@/components/prompt/PromptEditor';
import TemplateGallery from '@/components/prompt/TemplateGallery';
import { useToast } from '@/components/common/Toast';
import { Sparkles } from 'lucide-react';

export default function NewTaskPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''), 
          prompt 
        })
      });
      
      if (!res.ok) throw new Error('Failed to create task');
      
      const task = await res.json();
      
      // Execute task
      await fetch(`/api/tasks/${task.id}/execute`, { method: 'POST' });
      
      toast('Your task has been queued for execution.', 'success');
      router.push(`/tasks/${task.id}`);
    } catch (error) {
      console.error(error);
      toast('Failed to create task.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in p-6 max-w-4xl mx-auto space-y-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-[var(--color-primary)]" />
          Create New Task
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg">
          Describe what data you need in plain English
        </p>
      </header>

      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
        <PromptEditor onSubmit={handleSubmit} isLoading={isLoading} />
      </section>

      <div className="flex items-center my-8">
        <div className="flex-1 h-px bg-[var(--color-border)]"></div>
        <span className="px-4 text-[var(--color-text-muted)] text-sm font-medium">Or start from a template</span>
        <div className="flex-1 h-px bg-[var(--color-border)]"></div>
      </div>

      <section>
        <TemplateGallery onSelect={handleSubmit} />
      </section>
    </div>
  );
}
