'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Globe,
  ExternalLink,
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import ModeBadge from '@/components/ui/ModeBadge';
import EmptyState from '@/components/ui/EmptyState';
import type { CrawlJob } from '@/lib/mockData';

const PAGE_SIZE = 10;

function truncateUrl(url: string, max = 52) {
  try {
    const u = new URL(url);
    const full = u.hostname + u.pathname;
    return full.length > max ? full.slice(0, max) + '…' : full;
  } catch {
    return url.length > max ? url.slice(0, max) + '…' : url;
  }
}

function formatRelative(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

function formatAbsolute(iso: string | null) {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'MMM d, yyyy HH:mm');
  } catch {
    return iso;
  }
}

function calcDuration(started: string | null, completed: string | null): string {
  if (!started) return '—';
  const end = completed ? new Date(completed) : new Date();
  const diff = Math.floor((end.getTime() - new Date(started).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
}

type SortKey = 'created_at' | 'pages_completed' | 'status' | 'mode';
type SortDir = 'asc' | 'desc';

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'queued', label: 'Queued' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const MODE_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Modes' },
  { value: 'scrape', label: 'Scrape' },
  { value: 'map', label: 'Map' },
  { value: 'crawl', label: 'Crawl' },
];

export default function AllJobsPage() {
  const [jobs, setJobs] = useState<CrawlJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/jobs/list');
      if (!res.ok) {
        throw new Error(`Failed to load jobs (${res.status})`);
      }
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : data.jobs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const filtered = jobs.filter((j) => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false;
    if (modeFilter !== 'all' && j.mode !== modeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!j.start_url.toLowerCase().includes(q) && !j.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av: string | number, bv: string | number;
    if (sortKey === 'created_at') { av = a.created_at; bv = b.created_at; }
    else if (sortKey === 'pages_completed') { av = a.pages_completed; bv = b.pages_completed; }
    else if (sortKey === 'mode') { av = a.mode; bv = b.mode; }
    else { av = a.status; bv = b.status; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ k }: { k: SortKey }) => (
    <ArrowUpDown
      size={12}
      className={`ml-1 inline ${sortKey === k ? 'text-primary' : 'text-muted-foreground/50'}`}
    />
  );

  const totalPages_completed = jobs.reduce((s, j) => s + j.pages_completed, 0);
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const failedCount = jobs.filter((j) => j.status === 'failed').length;

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-foreground">All Jobs</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Full history of every crawl job submitted to your account.
            </p>
          </div>
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="btn-ghost text-xs px-3 py-1.5 gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Jobs', value: jobs.length.toString() },
            { label: 'Completed', value: completedCount.toString(), color: 'text-emerald-400' },
            { label: 'Failed', value: failedCount.toString(), color: 'text-red-400' },
            { label: 'Pages Crawled', value: totalPages_completed.toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="card-base px-4 py-3 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span className={`text-2xl font-bold tabular-nums ${stat.color ?? 'text-foreground'}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Filters + table */}
        <div className="card-base flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status pills */}
              <div className="flex items-center gap-1 flex-wrap">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={`status-${f.value}`}
                    onClick={() => { setStatusFilter(f.value); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors duration-150 ${
                      statusFilter === f.value
                        ? 'border-primary bg-primary/10 text-primary' :'border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="w-px h-4 bg-border" />
              {/* Mode pills */}
              <div className="flex items-center gap-1 flex-wrap">
                {MODE_FILTERS.map((f) => (
                  <button
                    key={`mode-${f.value}`}
                    onClick={() => { setModeFilter(f.value); setPage(1); }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors duration-150 ${
                      modeFilter === f.value
                        ? 'border-accent bg-accent/10 text-accent' :'border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search URL or job ID…"
                className="input-base pl-8 pr-8 py-1.5 text-xs w-56"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setPage(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="px-5 py-12 flex items-center justify-center text-sm text-muted-foreground gap-2">
              <RefreshCw size={14} className="animate-spin" />
              Loading jobs…
            </div>
          ) : error ? (
            <div className="px-5 py-12 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={fetchJobs} className="btn-ghost text-xs px-3 py-1.5">
                Try again
              </button>
            </div>
          ) : paged.length === 0 ? (
            <EmptyState
              title="No jobs match your filters"
              description="Try adjusting the status or mode filters, or clear your search."
              icon={Globe}
            />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      { label: 'Status', key: 'status' as SortKey },
                      { label: 'Mode', key: 'mode' as SortKey },
                      { label: 'URL', key: null },
                      { label: 'Pages', key: 'pages_completed' as SortKey },
                      { label: 'Duration', key: null },
                      { label: 'Created', key: 'created_at' as SortKey },
                      { label: 'Completed', key: null },
                      { label: '', key: null },
                    ].map((col, i) => (
                      <th
                        key={i}
                        className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap"
                      >
                        {col.key ? (
                          <button
                            onClick={() => handleSort(col.key!)}
                            className="flex items-center hover:text-foreground transition-colors"
                          >
                            {col.label}
                            <SortIcon k={col.key} />
                          </button>
                        ) : (
                          col.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((job: CrawlJob, i) => (
                    <tr
                      key={job.id}
                      className={`border-b border-border/60 hover:bg-muted/30 transition-colors duration-100 ${
                        i % 2 === 0 ? '' : 'bg-secondary/20'
                      }`}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={job.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <ModeBadge mode={job.mode} />
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <span
                          className="font-mono-data text-xs text-foreground/80 block truncate"
                          title={job.start_url}
                        >
                          {truncateUrl(job.start_url)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="tabular-nums text-foreground font-medium">
                          {job.pages_completed.toLocaleString()}
                        </span>
                        {job.pages_failed > 0 && (
                          <span className="text-xs text-red-400 ml-1.5 tabular-nums">
                            +{job.pages_failed} err
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {calcDuration(job.started_at, job.completed_at)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground">
                          {formatRelative(job.created_at)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground">
                          {formatAbsolute(job.completed_at)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Link
                          href={`/job-detail?jobId=${job.id}`}
                          className="btn-ghost text-xs px-2.5 py-1.5 gap-1.5 inline-flex items-center"
                        >
                          View
                          <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of{' '}
                {sorted.length} jobs
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost p-1.5 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs text-muted-foreground px-2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-ghost p-1.5 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
