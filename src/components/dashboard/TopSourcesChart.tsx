'use client'
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../layout/ThemeProvider';

export default function TopSourcesChart() {
  const { theme } = useTheme();
  
  const data = [
    { name: 'Web Scraping', value: 45 },
    { name: 'API Integration', value: 30 },
    { name: 'Document Parsing', value: 15 },
    { name: 'Manual Entry', value: 10 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#1a1a2e' : '#ffffff', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px' 
            }}
            itemStyle={{ color: 'var(--text-primary)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
