'use client';

import { useState, useEffect } from 'react';
import { GitBranch, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Skeleton from '@/components/common/Skeleton';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';

interface WorkflowStep {
  id: string;
  name: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  createdAt: string;
  taskId: string;
  taskName: string;
  steps: WorkflowStep[];
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        const res = await fetch('/api/workflows');
        if (res.ok) {
          const data = await res.json();
          setWorkflows(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkflows();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="animate-fade-in p-6 max-w-5xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workflows</h1>
        <p className="text-[var(--color-text-muted)]">Track your data collection workflow history</p>
      </header>

      {loading ? (
        <div className="space-y-4">
          <Skeleton height="6rem" width="100%" />
          <Skeleton height="6rem" width="100%" />
          <Skeleton height="6rem" width="100%" />
        </div>
      ) : workflows.length === 0 ? (
        <EmptyState 
          title="No workflows found" 
          description="Workflows will appear here once tasks start executing."
          icon={<GitBranch className="w-10 h-10 text-[var(--color-text-muted)]" />}
        />
      ) : (
        <div className="space-y-4">
          {workflows.map(workflow => (
            <div key={workflow.id} className="card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
              <div 
                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--color-background)] transition-colors"
                onClick={() => toggleExpand(workflow.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{workflow.name}</h3>
                    <Badge 
                      variant={workflow.status === 'completed' ? 'success' : workflow.status === 'failed' ? 'error' : workflow.status === 'running' ? 'primary' : 'default'}
                      label={workflow.status}
                    />
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-3">{workflow.description}</p>
                  
                  <div className="flex items-center gap-6 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" /> {workflow.taskName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(workflow.createdAt).toLocaleString()}
                    </span>
                    <span>{workflow.steps?.length || 0} steps</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-32 hidden sm:block">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{workflow.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${workflow.status === 'failed' ? 'bg-[var(--color-error)]' : 'bg-[var(--color-primary)]'}`} 
                        style={{ width: `${workflow.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                    {expandedId === workflow.id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
              </div>

              {expandedId === workflow.id && (
                <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-background)]">
                  <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[var(--color-text-muted)]">Execution Steps</h4>
                  <div className="space-y-4">
                    {workflow.steps?.map((step, idx) => (
                      <div key={step.id || idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-1.5 ${
                            step.status === 'completed' ? 'bg-[var(--color-success)]' :
                            step.status === 'running' ? 'bg-[var(--color-primary)] animate-pulse' :
                            step.status === 'failed' ? 'bg-[var(--color-error)]' : 'bg-[var(--color-border)]'
                          }`} />
                          {idx !== workflow.steps.length - 1 && <div className="w-px h-full bg-[var(--color-border)] my-1" />}
                        </div>
                        <div className="pb-4 flex-1">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-sm">{step.name}</span>
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {step.status}
                            </span>
                          </div>
                          {step.error && (
                            <p className="text-xs text-[var(--color-error)] mt-1 mt-2 p-2 bg-[var(--color-error)]/10 rounded border border-[var(--color-error)]/20">
                              {step.error}
                            </p>
                          )}
                          {step.completedAt && (
                            <span className="text-xs text-[var(--color-text-muted)] block mt-1">
                              Completed: {new Date(step.completedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
