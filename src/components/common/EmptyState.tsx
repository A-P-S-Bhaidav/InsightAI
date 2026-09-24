import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center' }}>
      {icon && <div className="empty-state-icon" style={{ color: 'var(--color-muted)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>}
      <h3 className="empty-state-title" style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
      <p className="empty-state-description" style={{ margin: '0 0 1.5rem 0', color: 'var(--color-muted)', maxWidth: '400px' }}>{description}</p>
      
      {action && (
        <div className="empty-state-action">
          {action.href ? (
            <Link href={action.href} className="btn btn-primary">
              {action.label}
            </Link>
          ) : (
            <button className="btn btn-primary" onClick={action.onClick}>
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
