import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'circle' | 'rect';
  count?: number;
  className?: string;
}

export function Skeleton({ width, height, variant = 'text', count = 1, className = '' }: SkeletonProps) {
  const getStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = { width: width || '100%' };

    if (variant === 'circle') {
      baseStyles.height = height || width || '40px';
      baseStyles.borderRadius = '50%';
    } else if (variant === 'rect') {
      baseStyles.height = height || '100px';
      baseStyles.borderRadius = '8px';
    } else {
      baseStyles.height = height || '1rem';
      baseStyles.borderRadius = '4px';
      baseStyles.marginBottom = '0.5rem';
    }

    return baseStyles;
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton skeleton-${variant} ${className}`}
      style={getStyles()}
    />
  ));

  return <>{skeletons}</>;
}

export default Skeleton;
