'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import TaskCard from '@/components/tasks/TaskCard';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  prompt: string;
  description?: string;
  progress: number;
  priority: 'low' | 'medium' | 'high';
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'running'|'completed'|'failed'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?page=${page}&limit=10&status=${statusFilter !== 'all' ? statusFilter : ''}&search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-[var(--color-text-muted)]">Manage your data collection tasks</p>
        </div>
        <Link href="/tasks/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Link>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="search-input w-full pl-9 pr-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
          <select 
            className="select flex-1 sm:w-48 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all'|'pending'|'running'|'completed'|'failed')}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton height="12rem" />
          <Skeleton height="12rem" />
          <Skeleton height="12rem" />
          <Skeleton height="12rem" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState 
          title="No tasks found" 
          description={searchQuery ? "Try adjusting your filters" : "Create your first data collection task to get started"}
          action={{ label: "Create Task", href: "/tasks/new" }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 mt-6">
            <div className="text-sm text-[var(--color-text-muted)]">
              Showing {Math.min((page - 1) * 10 + 1, total)} to {Math.min(page * 10, total)} of {total} results
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                disabled={page * 10 >= total}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
