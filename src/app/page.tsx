'use client';

import { useState, useEffect } from 'react';
import { ListTodo, CheckCircle, Database, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import RecentTasks from '@/components/dashboard/RecentTasks';
import Skeleton from '@/components/common/Skeleton';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  prompt: string;
}

interface Stats {
  totalTasks: number;
  completedTasks: number;
  runningTasks: number;
  totalDatasets: number;
  totalDataPoints: number;
  averageQualityScore: number;
  recentTasks: Task[];
  tasksByStatus: Record<string, number>;
  tasksOverTime: Array<{ date: string; count: number }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const chartData = stats?.tasksOverTime?.length 
    ? stats.tasksOverTime.map(t => ({ date: t.date, tasks: t.count, datasets: Math.floor(t.count * 0.8) }))
    : Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); 
        d.setDate(d.getDate() - (6 - i));
        return { 
          date: d.toLocaleDateString('en-US', { weekday: 'short' }), 
          tasks: (i * 2) % 8 + 1, 
          datasets: (i * 3) % 5 + 1 
        };
      });

  if (loading) {
    return (
      <div className="animate-fade-in p-6 max-w-7xl mx-auto space-y-8">
        <div>
          <Skeleton width="16rem" height="2.5rem" className="mb-2" />
          <Skeleton width="24rem" height="1.25rem" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
          <Skeleton height="8rem" />
        </div>
        <Skeleton height="16rem" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] mb-2">
          Welcome to InsightAI
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg">
          Your AI-Powered Data Intelligence Platform
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-fade-in delay-1">
          <StatsCard 
            title="Total Tasks" 
            value={stats?.totalTasks ?? 0} 
            icon={<ListTodo className="w-5 h-5" />} 
          />
        </div>
        <div className="animate-fade-in delay-2">
          <StatsCard 
            title="Completed" 
            value={stats?.completedTasks ?? 0} 
            icon={<CheckCircle className="w-5 h-5 text-[var(--color-success)]" />} 
          />
        </div>
        <div className="animate-fade-in delay-3">
          <StatsCard 
            title="Data Points" 
            value={stats?.totalDataPoints ?? 0} 
            icon={<Database className="w-5 h-5 text-[var(--color-primary)]" />} 
          />
        </div>
        <div className="animate-fade-in delay-4">
          <StatsCard 
            title="Avg Quality" 
            value={`${(stats?.averageQualityScore ?? 0).toFixed(1)}%`} 
            icon={<TrendingUp className="w-5 h-5 text-[var(--color-secondary)]" />} 
          />
        </div>
      </div>

      <div className="card bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Start a New Collection</h2>
            <p className="text-[var(--color-text-muted)]">Describe the data you want to collect and let AI handle the rest.</p>
          </div>
          <Link href="/tasks/new" className="btn btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            New Task
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Activity Overview</h2>
          <ActivityChart data={chartData} />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Tasks</h2>
          <RecentTasks tasks={stats?.recentTasks ?? []} />
        </div>
      </div>
    </div>
  );
}
