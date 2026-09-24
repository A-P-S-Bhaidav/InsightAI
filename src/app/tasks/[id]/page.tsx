'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Trash2, Clock, Calendar, Tag, Database, BarChart3 } from 'lucide-react';
import Badge from '@/components/common/Badge';
import Skeleton from '@/components/common/Skeleton';
import TaskTimeline from '@/components/tasks/TaskTimeline';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import Link from 'next/link';

interface WorkflowStep {
  id: string;
  name: string;
  status: string;
  type: string;
  order: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

interface Workflow {
  id: string;
  status: string;
  progress: number;
  steps: WorkflowStep[];
}

interface Dataset {
  id: string;
  name: string;
  rowCount: number;
  qualityScore: number;
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  prompt: string;
  workflows: Workflow[];
  datasets: Dataset[];
}

export default function TaskDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { toast } = useToast();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function fetchTask() {
      try {
        const res = await fetch(`/api/tasks/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTask(data);
        } else {
          toast('Failed to load task.', 'error');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchTask();
  }, [id, toast]);

  const handleReRun = async () => {
    try {
      const res = await fetch(`/api/tasks/${id}/execute`, { method: 'POST' });
      if (res.ok) {
        toast('Task execution started.', 'success');
        // Optionally refresh task data
      } else {
        throw new Error('Failed to execute');
      }
    } catch {
      toast('Could not re-run task.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Task was removed.', 'success');
        router.push('/tasks');
      } else {
        throw new Error('Failed to delete');
      }
    } catch {
      toast('Could not delete task.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton height="2rem" width="8rem" />
        <Skeleton height="6rem" />
        <Skeleton height="12rem" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl">Task not found</h2>
        <Link href="/tasks" className="text-[var(--color-primary)] hover:underline mt-4 inline-block">Back to Tasks</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-6 max-w-5xl mx-auto space-y-8">
      <Link href="/tasks" className="inline-flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tasks
      </Link>

      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-3">{task.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={task.status === 'completed' ? 'success' : task.status === 'failed' ? 'error' : task.status === 'running' ? 'primary' : 'default'}
              label={task.status}
            />
            <Badge variant="outline" label={`${task.priority} priority`} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReRun} className="btn btn-secondary">
            <Play className="w-4 h-4 mr-2" />
            Re-run
          </button>
          <button onClick={() => setDeleteModalOpen(true)} className="btn btn-danger">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[var(--color-primary)]" />
              Original Prompt
            </h3>
            <p className="text-[var(--color-text)] bg-[var(--color-background)] p-4 rounded-lg border border-[var(--color-border)] whitespace-pre-wrap">
              {task.prompt}
            </p>
          </div>

          {task.workflows && task.workflows.length > 0 && (
            <div className="card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Execution Timeline</h3>
              <TaskTimeline steps={task.workflows[0].steps.map((step, index) => ({...step, type: step.type || 'unknown', order: step.order ?? index}))} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Task Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)] flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Created
                </span>
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)] flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Updated
                </span>
                <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {task.datasets && task.datasets.length > 0 && (
            <div className="card bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-[var(--color-secondary)]" />
                Generated Datasets
              </h3>
              <div className="space-y-3">
                {task.datasets.map(dataset => (
                  <Link 
                    key={dataset.id} 
                    href={`/datasets/${dataset.id}`}
                    className="block p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] transition-colors"
                  >
                    <h4 className="font-medium mb-2">{dataset.name}</h4>
                    <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                      <span>{dataset.rowCount} rows</span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" /> {dataset.qualityScore}% quality
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete Task</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
