'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Globe,
  Loader2,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import ModeBadge from '@/components/ui/ModeBadge';
import EmptyState from '@/components/ui/EmptyState';
import type { CrawlJob } from '@/lib/mockData';

const PAGE_SIZE = 6;

function truncateUrl(url: string, max = 48) {
  try {
    const u = new URL(url);
    const full = u.hostname + u.pathname;
    return full.length > max ? full.slice(0, max) + '…' : full;
  } catch {
    return url.length > max ? url.slice(0, max) + '…' : url;
  }
}

function formatDate(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

type SortKey = 'created_at' | 'pages_completed' | 'status';
type SortDir = 'asc' | 'desc';

export default function JobsTable() {
  const [jobs, setJobs] = useState<CrawlJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filter, setFilter] = useState<string>('all');

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs/list');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch {
      // silently ignore
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

  const filtered = jobs.filter((j) => filter === 'all' || j.status === filter);

  const sorted = [...filtered].sort((a, b) => {
    let av: string | number, bv: string | number;
    if (sortKey === 'created_at') {
      av = a.created_at;
      bv = b.created_at;
    } else if (sortKey === 'pages_completed') {
      av = a.pages_completed;
      bv = b.pages_completed;
    } else {
      av = a.status;
      bv = b.status;
    }
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

  const STATUS_FILTERS = ['all', 'queued', 'running', 'completed', 'failed', 'cancelled'];

  return (
    <div className="card-base flex flex-col">
      {/* Table header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Recent Jobs</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {jobs.length} total
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={`filter-${f}`}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors duration-150 ${
                  filter === f
                    ? 'border-primary bg-primary/10 text-primary' :'border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setLoading(true); fetchJobs(); }}
            className="btn-ghost text-xs px-2 py-1.5 gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : paged.length === 0 ? (
        <EmptyState
          title="No crawl jobs yet"
          description="Submit a URL above to start your first crawl job. Results will appear here."
          icon={Globe}
          action={
            <span className="text-xs text-muted-foreground">
              Use the New Crawl Job form above to get started.
            </span>
          }
        />
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">
                  <button onClick={() => handleSort('status')} className="flex items-center hover:text-foreground transition-colors">
                    Status <SortIcon k="status" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">Mode</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">URL</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">
                  <button onClick={() => handleSort('pages_completed')} className="flex items-center hover:text-foreground transition-colors">
                    Pages <SortIcon k="pages_completed" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">Max</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">
                  <button onClick={() => handleSort('created_at')} className="flex items-center hover:text-foreground transition-colors">
                    Created <SortIcon k="created_at" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">Actions</th>
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
                    <span className="font-mono-data text-xs text-foreground/80 block truncate" title={job.start_url}>
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
                    <span className="tabular-nums text-muted-foreground text-xs">
                      {job.max_pages.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">{formatDate(job.created_at)}</span>
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
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} jobs
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost p-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs text-muted-foreground px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost p-1.5 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}