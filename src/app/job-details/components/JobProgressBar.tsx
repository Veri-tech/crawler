'use client';
import React from 'react';
import { Loader2 } from 'lucide-react';
import type { CrawlJob } from '@/lib/mockData';

interface JobProgressBarProps {
  job: CrawlJob;
}

export default function JobProgressBar({ job }: JobProgressBarProps) {
  const pct =
    job.pages_discovered > 0
      ? Math.round((job.pages_completed / job.pages_discovered) * 100)
      : 0;

  return (
    <div className="card-base p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
          <Loader2 size={14} className="animate-spin" />
          Crawl in progress — polling every 4 seconds
        </div>
        <span className="text-sm tabular-nums font-semibold text-foreground">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {job.pages_completed.toLocaleString()} / {job.pages_discovered.toLocaleString()} pages processed
        </span>
        <span className="text-xs text-amber-400/70">Auto-refreshing</span>
      </div>
    </div>
  );
}