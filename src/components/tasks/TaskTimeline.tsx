'use client'
import React from 'react';
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface TimelineStep {
  id: string;
  name: string;
  type: string;
  status: string;
  order: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

interface TaskTimelineProps {
  steps: TimelineStep[];
}

export function TaskTimeline({ steps }: TaskTimelineProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="timeline-icon text-success" size={24} />;
      case 'running': return <Loader2 className="timeline-icon text-info animate-spin" size={24} />;
      case 'failed': return <XCircle className="timeline-icon text-danger" size={24} />;
      default: return <Clock className="timeline-icon text-muted" size={24} />;
    }
  };

  return (
    <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {sortedSteps.map((step, index) => (
        <div key={step.id} className={`timeline-item ${step.status.toLowerCase()}`} style={{ display: 'flex', gap: '1rem', position: 'relative', paddingBottom: index < sortedSteps.length - 1 ? '2rem' : '0' }}>
          <div className="timeline-marker" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ zIndex: 2, background: 'var(--color-background)', borderRadius: '50%' }}>
              {getStatusIcon(step.status)}
            </div>
            {index < sortedSteps.length - 1 && (
              <div className="timeline-connector" style={{ position: 'absolute', top: '24px', bottom: 0, left: '11px', width: '2px', background: 'var(--color-surface)', zIndex: 1 }}></div>
            )}
          </div>
          <div className="timeline-content" style={{ flex: 1, paddingBottom: '1rem' }}>
            <div className="timeline-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className="timeline-order" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-muted)' }}>{step.order}.</span>
              <h4 className="timeline-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>{step.name}</h4>
              <Badge label={step.type} size="sm" />
            </div>
            {step.error && <p className="timeline-error text-danger" style={{ fontSize: '0.875rem', margin: '0.5rem 0' }}>{step.error}</p>}
            <div className="timeline-times" style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
              {step.startedAt && <span>Started: {new Date(step.startedAt).toLocaleTimeString()}</span>}
              {step.completedAt && <span>Completed: {new Date(step.completedAt).toLocaleTimeString()}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskTimeline;
