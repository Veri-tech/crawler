'use client';
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Link2,
  Globe,
  Search,
} from 'lucide-react';
import type { CrawlPage, JobStatus } from '@/lib/mockData';
import EmptyState from '@/components/ui/EmptyState';

const PAGE_SIZE = 8;

function truncateUrl(url: string, max = 60) {
  try {
    const u = new URL(url);
    const full = u.hostname + u.pathname;
    return full.length > max ? full.slice(0, max) + '…' : full;
  } catch {
    return url.length > max ? url.slice(0, max) + '…' : url;
  }
}

function statusCodeColor(code: number | null) {
  if (!code) return 'text-muted-foreground';
  if (code >= 200 && code < 300) return 'text-emerald-400';
  if (code >= 300 && code < 400) return 'text-blue-400';
  if (code >= 400) return 'text-red-400';
  return 'text-muted-foreground';
}

interface PagesTableProps {
  pages: CrawlPage[];
  jobStatus: JobStatus;
  onViewContent: (page: CrawlPage) => void;
}

type SortKey = 'crawled_at' | 'status_code' | 'title';
type SortDir = 'asc' | 'desc';

export default function PagesTable({ pages, jobStatus, onViewContent }: PagesTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('crawled_at');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const filtered = pages.filter(
    (p) =>
      !search ||
      p.url.toLowerCase().includes(search.toLowerCase()) ||
      (p.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let av: string | number, bv: string | number;
    if (sortKey === 'crawled_at') { av = a.crawled_at; bv = b.crawled_at; }
    else if (sortKey === 'status_code') { av = a.status_code ?? 0; bv = b.status_code ?? 0; }
    else { av = a.title ?? ''; bv = b.title ?? ''; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ k }: { k: SortKey }) => (
    <ArrowUpDown
      size={11}
      className={`ml-1 inline ${sortKey === k ? 'text-primary' : 'text-muted-foreground/40'}`}
    />
  );

  const isRunningEmpty = jobStatus === 'running' && pages.length === 0;

  return (
    <div className="card-base flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Crawled Pages</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums">
            {pages.length} pages
          </span>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by URL or title…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-8 w-64 text-xs h-8"
          />
        </div>
      </div>

      {isRunningEmpty ? (
        <EmptyState
          title="Waiting for pages"
          description="The crawl worker is processing your job. Pages will appear here as they are completed."
          icon={Globe}
        />
      ) : paged.length === 0 && search ? (
        <EmptyState
          title="No pages match your filter"
          description={`No crawled pages contain "${search}". Try a different search term.`}
          icon={Search}
          action={
            <button onClick={() => setSearch('')} className="btn-secondary text-xs px-3 py-1.5">
              Clear filter
            </button>
          }
        />
      ) : paged.length === 0 ? (
        <EmptyState
          title="No pages crawled yet"
          description="This job has not produced any page results. Check the job status above."
          icon={Globe}
        />
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">
                  <button onClick={() => handleSort('title')} className="flex items-center hover:text-foreground transition-colors">
                    Title <SortIcon k="title" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">
                  URL
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">
                  <button onClick={() => handleSort('status_code')} className="flex items-center hover:text-foreground transition-colors">
                    HTTP <SortIcon k="status_code" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">
                  Links
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">
                  <button onClick={() => handleSort('crawled_at')} className="flex items-center hover:text-foreground transition-colors">
                    Crawled <SortIcon k="crawled_at" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">
                  Content
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p: CrawlPage, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-border/60 hover:bg-muted/30 transition-colors duration-100 ${
                    i % 2 === 0 ? '' : 'bg-secondary/20'
                  }`}
                >
                  <td className="px-5 py-3.5 max-w-[180px]">
                    <span className="text-xs text-foreground/90 block truncate" title={p.title ?? undefined}>
                      {p.title ?? <span className="text-muted-foreground italic">No title</span>}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 max-w-xs">
                    <span className="font-mono-data text-xs text-foreground/70 block truncate" title={p.url}>
                      {truncateUrl(p.url)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`font-mono-data text-xs font-semibold tabular-nums ${statusCodeColor(p.status_code)}`}>
                      {p.status_code ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                      <Link2 size={11} />
                      {p.links.length}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          return formatDistanceToNow(new Date(p.crawled_at), { addSuffix: true });
                        } catch {
                          return p.crawled_at;
                        }
                      })()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {p.markdown ? (
                      <button
                        onClick={() => onViewContent(p)}
                        className="btn-ghost text-xs px-2.5 py-1.5 gap-1.5 inline-flex items-center"
                        title="View extracted markdown content"
                      >
                        <FileText size={12} />
                        View
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground/50 italic">None</span>
                    )}
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
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} pages
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost p-1.5 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={`pages-pg-${p}`}
                onClick={() => setPage(p)}
                className={`w-7 h-7 text-xs rounded-md transition-colors ${
                  page === p
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-ghost p-1.5 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}