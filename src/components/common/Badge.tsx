import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'error' | 'primary' | 'outline';
  size?: 'sm' | 'md';
}

const variantMap: Record<string, string> = {
  error: 'danger',
  primary: 'info',
  outline: 'default',
};

export function Badge({ label, variant = 'default', size = 'md' }: BadgeProps) {
  const resolvedVariant = variantMap[variant] || variant;
  return (
    <span
      className={`badge badge-${resolvedVariant}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        fontWeight: 500,
        textTransform: 'capitalize',
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
        padding: size === 'sm' ? '0.125rem 0.5rem' : '0.25rem 0.625rem',
      }}
    >
      {label}
    </span>
  );
}

export default Badge;
