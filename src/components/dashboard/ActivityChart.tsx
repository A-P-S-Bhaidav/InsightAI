'use client'
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../layout/ThemeProvider';

interface ActivityChartProps {
  data: { date: string, tasks: number, datasets: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const { theme } = useTheme();
  
  const textColor = theme === 'dark' ? '#9ca3af' : '#4b5563';
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const taskColor = '#3b82f6';
  const datasetColor = '#10b981';

  return (
    <div className="chart-container card" style={{ height: 350, width: '100%', padding: '1.5rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={taskColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={taskColor} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDatasets" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={datasetColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={datasetColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dx={-10} />
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', border: '1px solid var(--color-surface)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: textColor }}
          />
          <Area type="monotone" dataKey="tasks" stroke={taskColor} strokeWidth={2} fillOpacity={1} fill="url(#colorTasks)" />
          <Area type="monotone" dataKey="datasets" stroke={datasetColor} strokeWidth={2} fillOpacity={1} fill="url(#colorDatasets)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ActivityChart;
