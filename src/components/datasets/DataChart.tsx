'use client'
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { useTheme } from '../layout/ThemeProvider';

interface DataChartProps {
  data: Record<string, unknown>[];
  chartType?: 'bar' | 'pie' | 'line';
}

export function DataChart({ data, chartType }: DataChartProps) {
  const { theme } = useTheme();
  
  if (data.length === 0) return null;

  const textColor = theme === 'dark' ? '#9ca3af' : '#4b5563';
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const keys = Object.keys(data[0]);
  let numericKey = '';
  let labelKey = keys[0];

  for (const key of keys) {
    if (typeof data[0][key] === 'number') {
      numericKey = key;
      break;
    }
  }

  const determinedType = chartType || (numericKey ? 'bar' : 'pie');

  if (!numericKey && determinedType !== 'pie') {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>No numeric data available for charting.</div>;
  }

  const chartData = data.slice(0, 20);

  return (
    <div className="chart-container card" style={{ height: 400, width: '100%', padding: '1.5rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        {determinedType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey={labelKey} stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip 
              contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', border: '1px solid var(--color-surface)', borderRadius: '8px' }}
              itemStyle={{ color: textColor }}
              cursor={{ fill: theme === 'dark' ? '#374151' : '#f3f4f6' }}
            />
            <Bar dataKey={numericKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : determinedType === 'line' ? (
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey={labelKey} stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip 
              contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', border: '1px solid var(--color-surface)', borderRadius: '8px' }}
            />
            <Line type="monotone" dataKey={numericKey} stroke={colors[0]} strokeWidth={3} dot={{ r: 4, fill: colors[0] }} activeDot={{ r: 6 }} />
          </LineChart>
        ) : (
          <PieChart>
            <Pie
              data={chartData}
              dataKey={numericKey || 'value'}
              nameKey={labelKey}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              fill="#8884d8"
              paddingAngle={2}
              label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', border: '1px solid var(--color-surface)', borderRadius: '8px' }}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default DataChart;
