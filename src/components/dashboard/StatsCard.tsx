import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage, positive = green, negative = red
  icon: React.ReactNode;
  delay?: number;
}

export default function StatsCard({ title, value, change, icon, delay = 0 }: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;
  
  return (
    <div 
      className="card animate-slide-up" 
      style={{ 
        animationDelay: `${delay}ms`, 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '120px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ color: 'var(--color-primary)' }}>
          {icon}
        </div>
        {change !== undefined && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem', 
              fontSize: '0.875rem', 
              fontWeight: 500,
              color: isPositive ? 'var(--color-success)' : isNegative ? 'var(--color-danger)' : 'var(--text-muted)' 
            }}
          >
            {isPositive ? <ArrowUp size={16} /> : isNegative ? <ArrowDown size={16} /> : null}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </h3>
        <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
          {value}
        </div>
      </div>
    </div>
  );
}
