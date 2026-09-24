import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}

export default function StatsCard({ icon, title, value, color }: StatsCardProps) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: `${color}1A`, // 10% opacity hex
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        }}>
          {icon}
        </div>
        <div style={{ fontSize: '14px', color: '#888' }}>
          {title}
        </div>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>
        {value}
      </div>
    </div>
  );
}
