'use client';
import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface UsageData {
  pages_used: number;
  quota: number;
  jobs_run: number;
  jobs_completed: number;
  jobs_failed: number;
}

export default function UsageStatsRow() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        // Fetch jobs list to compute stats client-side
        const res = await fetch('/api/jobs/list');
        if (!res.ok) return;
        const jobs = await res.json();

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const thisMonthJobs = jobs.filter((j: { created_at: string }) =>
          j.created_at?.startsWith(currentMonth)
        );

        const completed = thisMonthJobs.filter((j: { status: string }) => j.status === 'completed').length;
        const failed = thisMonthJobs.filter((j: { status: string }) => j.status === 'failed').length;
        const pagesUsed = thisMonthJobs.reduce(
          (sum: number, j: { pages_completed: number }) => sum + (j.pages_completed || 0),
          0
        );

        setUsage({
          pages_used: pagesUsed,
          quota: 10000,
          jobs_run: thisMonthJobs.length,
          jobs_completed: completed,
          jobs_failed: failed,
        });
      } catch {
        // silently ignore
      }
    }

    fetchUsage();
  }, []);

  if (!usage) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card-base p-5 flex items-center justify-center h-28">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          </div>
        ))}
      </div>
    );
  }

  const { pages_used, quota, jobs_run, jobs_completed, jobs_failed } = usage;
  const pct = Math.round((pages_used / quota) * 100);
  const successRate = jobs_run > 0 ? Math.round((jobs_completed / jobs_run) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Pages used */}
      <div className="card-base p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            Pages Used — This Month
          </span>
          <Layers size={15} className="text-muted-foreground" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-foreground tabular-nums">
            {pages_used.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground mb-0.5">
            / {quota.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-amber-500' : 'bg-primary'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{pct}% of monthly quota</span>
      </div>
      {/* Jobs run */}
      <div className="card-base p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            Jobs This Month
          </span>
          <CheckCircle2 size={15} className="text-muted-foreground" />
        </div>
        <span className="text-3xl font-bold text-foreground tabular-nums">{jobs_run}</span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="text-emerald-400 font-medium">{jobs_completed} completed</span>
          <span className="w-px h-3 bg-border" />
          <span className="text-red-400 font-medium">{jobs_failed} failed</span>
        </div>
      </div>
      {/* Success rate */}
      <div className={`card-base p-5 flex flex-col gap-3 ${successRate < 80 && jobs_run > 0 ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            Success Rate
          </span>
          {successRate < 80 && jobs_run > 0 ? (
            <AlertTriangle size={15} className="text-amber-400" />
          ) : (
            <CheckCircle2 size={15} className="text-emerald-400" />
          )}
        </div>
        <span className={`text-3xl font-bold tabular-nums ${successRate < 80 && jobs_run > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {successRate}%
        </span>
        <span className="text-xs text-muted-foreground">
          Based on {jobs_run} jobs submitted
        </span>
      </div>
    </div>
  );
}