'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListTodo, CheckCircle, Database, TrendingUp } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setData({
          totalTasks: 0,
          completedTasks: 0,
          dataPoints: 0,
          avgQuality: 0,
          recentTasks: []
        });
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    let color = '#999';
    let bg = 'rgba(255,255,255,0.1)';
    
    if (status.toLowerCase() === 'completed') {
      color = '#10b981';
      bg = 'rgba(16,185,129,0.1)';
    } else if (status.toLowerCase() === 'failed') {
      color = '#ef4444';
      bg = 'rgba(239,68,68,0.1)';
    } else if (status.toLowerCase() === 'running') {
      color = '#3b82f6';
      bg = 'rgba(59,130,246,0.1)';
    } else if (status.toLowerCase() === 'pending') {
      color = '#f59e0b';
      bg = 'rgba(245,158,11,0.1)';
    }

    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
        color,
        background: bg
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>Welcome back!</h1>
          <p style={{ fontSize: '15px', color: '#999', margin: 0 }}>Here's what's happening with your data.</p>
        </div>
        <Link href="/tasks/new" style={{ textDecoration: 'none' }}>
          <button style={{
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            + New Task
          </button>
        </Link>
      </div>

      {/* Stats Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px' 
      }}>
        <StatsCard 
          icon={<ListTodo size={20} />} 
          title="Total Tasks" 
          value={loading ? '-' : (data?.totalTasks || 0)} 
          color="#3b82f6" 
        />
        <StatsCard 
          icon={<CheckCircle size={20} />} 
          title="Completed" 
          value={loading ? '-' : (data?.completedTasks || 0)} 
          color="#10b981" 
        />
        <StatsCard 
          icon={<Database size={20} />} 
          title="Data Points" 
          value={loading ? '-' : (data?.dataPoints || 0)} 
          color="#8b5cf6" 
        />
        <StatsCard 
          icon={<TrendingUp size={20} />} 
          title="Avg Quality" 
          value={loading ? '-' : (data?.avgQuality || 0)} 
          color="#f59e0b" 
        />
      </div>

      {/* Two Column */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {/* Left: Recent Tasks card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: '0 0 16px 0' }}>Recent Tasks</h2>
          
          {loading ? (
            <div style={{ color: '#888', padding: '24px 0', textAlign: 'center' }}>Loading tasks...</div>
          ) : data?.recentTasks && data.recentTasks.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <th style={{ padding: '0 8px 12px 0', color: '#888', fontWeight: 500, fontSize: '13px' }}>Task Name</th>
                  <th style={{ padding: '0 8px 12px', color: '#888', fontWeight: 500, fontSize: '13px' }}>Status</th>
                  <th style={{ padding: '0 0 12px 8px', color: '#888', fontWeight: 500, fontSize: '13px', textAlign: 'right' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTasks.slice(0, 5).map((task: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', height: '48px' }}>
                    <td style={{ color: '#fff', fontSize: '14px', paddingRight: '8px' }}>{task.name || `Task #${task.id || i}`}</td>
                    <td style={{ padding: '0 8px' }}>{getStatusBadge(task.status || 'pending')}</td>
                    <td style={{ color: '#888', fontSize: '13px', textAlign: 'right', paddingLeft: '8px' }}>
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: '#888', padding: '24px 0', textAlign: 'center' }}>
              No tasks yet. Create your first task to get started.
            </div>
          )}
        </div>

        {/* Right: Quick Actions card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: '0 0 16px 0' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/tasks/new" style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                height: '44px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Create New Task
              </button>
            </Link>
            <Link href="/datasets" style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                height: '44px',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                View All Datasets
              </button>
            </Link>
            <Link href="/workflows" style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                height: '44px',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Browse Workflows
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
