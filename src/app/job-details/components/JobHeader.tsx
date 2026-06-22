import React from 'react';
import { format } from 'date-fns';
import { ExternalLink, Clock, Calendar, AlertCircle } from 'lucide-react';
import type { CrawlJob } from '@/lib/mockData';
import StatusBadge from '@/components/ui/StatusBadge';
import ModeBadge from '@/components/ui/ModeBadge';

function formatTs(iso: string | null) {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'MMM d, yyyy HH:mm');
  } catch {
    return iso;
  }
}

function duration(start: string | null, end: string | null) {
  if (!start) return '—';
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const seconds = Math.floor((e - s) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${minutes}m ${rem}s`;
}

interface JobHeaderProps {
  job: CrawlJob;
}

export default function JobHeader({ job }: JobHeaderProps) {
  return (
    <div className="card-base p-6 flex flex-col gap-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={job.status} />
            <ModeBadge mode={job.mode} />
            <span className="text-xs font-mono-data text-muted-foreground">
              {job.id}
            </span>
          </div>
          <a
            href={job.start_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors group"
          >
            <span className="font-mono-data break-all">{job.start_url}</span>
            <ExternalLink size={13} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Discovered</span>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {job.pages_discovered.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Completed</span>
          <span className="text-xl font-bold tabular-nums text-emerald-400">
            {job.pages_completed.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Failed</span>
          <span className={`text-xl font-bold tabular-nums ${job.pages_failed > 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
            {job.pages_failed.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Duration</span>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {duration(job.started_at, job.completed_at)}
          </span>
        </div>
      </div>

      {/* Timing row */}
      <div className="flex items-center gap-6 flex-wrap text-xs text-muted-foreground border-t border-border pt-4">
        <span className="flex items-center gap-1.5">
          <Calendar size={12} />
          Created {formatTs(job.created_at)}
        </span>
        {job.started_at && (
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            Started {formatTs(job.started_at)}
          </span>
        )}
        {job.completed_at && (
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            Completed {formatTs(job.completed_at)}
          </span>
        )}
        <span className="text-muted-foreground/60">
          Max pages: {job.max_pages.toLocaleString()}
        </span>
      </div>

      {/* Error message */}
      {job.error_message && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span className="font-mono-data">{job.error_message}</span>
        </div>
      )}
    </div>
  );
}