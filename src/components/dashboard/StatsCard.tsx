import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  delay?: number;
}

export function StatsCard({ title, value, change, changeType = 'neutral', icon, delay = 0 }: StatsCardProps) {
  return (
    <div className="stat-card animate-slide-up card" style={{ animationDelay: `${delay}ms`, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="stat-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="stat-card-title" style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)', fontWeight: 500 }}>{title}</h3>
        <div className="stat-card-icon" style={{ color: 'var(--color-primary)' }}>{icon}</div>
      </div>
      <div className="stat-card-body" style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
        <div className="stat-card-value" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
        {change && (
          <div className={`stat-card-change change-${changeType}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: changeType === 'positive' ? 'var(--color-success)' : changeType === 'negative' ? 'var(--color-danger)' : 'var(--color-muted)' }}>
            {changeType === 'positive' && <ArrowUp size={16} />}
            {changeType === 'negative' && <ArrowDown size={16} />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
