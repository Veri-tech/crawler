import React from 'react';
import { Loader2 } from 'lucide-react';

type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md';
}

const STATUS_LABELS: Record<JobStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} status-badge-${status}`}
    >
      {status === 'running' && (
        <Loader2 size={10} className="animate-spin" />
      )}
      {status === 'queued' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      )}
      {status === 'completed' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {status === 'failed' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {status === 'cancelled' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}