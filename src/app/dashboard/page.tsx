'use client';

import { useState, useEffect } from 'react';
import { ListTodo, CheckCircle, Database, TrendingUp, Plus, LayoutGrid, Download } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import TopSourcesChart from '@/components/dashboard/TopSourcesChart';
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
      <div className="animate-fade-in p-6 max-w-7xl mx-auto space-y-6" style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Skeleton width="16rem" height="2.5rem" className="mb-2" />
            <Skeleton width="24rem" height="1.25rem" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <Skeleton height="140px" />
          <Skeleton height="140px" />
          <Skeleton height="140px" />
          <Skeleton height="140px" />
        </div>
        <Skeleton height="350px" />
      </div>
    );
  }

  // Handle empty state if no stats (assuming totalTasks === 0 means no data)
  if (!loading && stats && stats.totalTasks === 0) {
    return (
      <div className="animate-fade-in p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)', maxWidth: '500px' }}>
          <Database size={48} className="mx-auto mb-4 text-[var(--color-primary)]" />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Welcome to InsightAI</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Get started by creating your first task. Let AI handle the data collection and processing for you.
          </p>
          <Link href="/tasks/new" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            <Plus size={20} className="mr-2" />
            Create First Task
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'badge-success';
      case 'running': return 'badge-info';
      case 'failed': return 'badge-danger';
      case 'pending': return 'badge-warning';
      default: return 'badge';
    }
  };

  return (
    <div className="animate-fade-in p-6 max-w-7xl mx-auto" style={{ display: 'grid', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
            Overview of your data intelligence operations
          </p>
        </div>
        <div>
          <select className="select" style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
        </div>
      </header>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <StatsCard 
          title="Total Tasks" 
          value={stats?.totalTasks ?? 0} 
          icon={<ListTodo size={24} />} 
          change={12}
          delay={100}
        />
        <StatsCard 
          title="Completed" 
          value={stats?.completedTasks ?? 0} 
          icon={<CheckCircle size={24} />} 
          change={5}
          delay={200}
        />
        <StatsCard 
          title="Data Points" 
          value={stats?.totalDataPoints ?? 0} 
          icon={<Database size={24} />} 
          change={-2}
          delay={300}
        />
        <StatsCard 
          title="Avg Quality" 
          value={`${(stats?.averageQualityScore ?? 0).toFixed(1)}%`} 
          icon={<TrendingUp size={24} />} 
          change={1.5}
          delay={400}
        />
      </div>

      {/* Row 2: Activity Chart & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '1.5rem' }}>
        
        {/* Activity Chart */}
        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Task Activity (Last 7 Days)</h2>
          <ActivityChart data={chartData} />
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'center' }}>
            <Link href="/tasks/new" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '0.75rem' }}>
              <Plus size={18} className="mr-2" /> New Task
            </Link>
            <Link href="/datasets" className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)' }}>
              <LayoutGrid size={18} className="mr-2" /> View Datasets
            </Link>
            <button className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '0.75rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)' }}>
              <Download size={18} className="mr-2" /> Export All
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Tasks & Top Sources */}
      <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '1.5rem' }}>
        
        {/* Recent Tasks */}
        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recent Tasks</h2>
            <Link href="/tasks" style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>View all</Link>
          </div>
          
          <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 0', fontWeight: 500 }}>Task Name</th>
                <th style={{ padding: '0.75rem 0', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '0.75rem 0', fontWeight: 500 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTasks?.slice(0, 5).map((task) => (
                <tr key={task.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem 0' }}>
                    <Link href={`/tasks/${task.id}`} style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {task.title}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats?.recentTasks || stats.recentTasks.length === 0) && (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recent tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top Sources */}
        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Top Sources</h2>
          <TopSourcesChart />
        </div>

      </div>
    </div>
  );
}
