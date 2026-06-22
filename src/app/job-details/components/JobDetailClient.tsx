'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { CrawlJob, CrawlPage } from '@/lib/mockData';
import JobHeader from './JobHeader';
import JobProgressBar from './JobProgressBar';
import PagesTable from './PagesTable';
import MarkdownViewerModal from './MarkdownViewerModal';

export default function JobDetailClient() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [job, setJob] = useState<CrawlJob | null>(null);
  const [pages, setPages] = useState<CrawlPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<CrawlPage | null>(null);

  // Fetch initial job + pages
  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/status?jobId=${jobId}`);
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJob(data);

        if (data.status === 'completed') {
          const pagesRes = await fetch(`/api/jobs/pages?jobId=${jobId}`);
          if (pagesRes.ok) {
            setPages(await pagesRes.json());
          }
        }
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  // Poll every 4s while job is running
  const poll = useCallback(async () => {
    if (!jobId || !job || job.status !== 'running') return;
    try {
      const res = await fetch(`/api/jobs/status?jobId=${jobId}`);
      if (!res.ok) return;
      const updated: CrawlJob = await res.json();
      setJob(updated);

      if (updated.status === 'completed') {
        const pagesRes = await fetch(`/api/jobs/pages?jobId=${jobId}`);
        if (pagesRes.ok) {
          setPages(await pagesRes.json());
        }
      }
    } catch {
      // silently ignore poll errors
    }
  }, [jobId, job]);

  useEffect(() => {
    if (!job || job.status !== 'running') return;
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [job, poll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading job…</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-sm text-muted-foreground">
          Job not found. It may have been deleted or the ID is invalid.
        </p>
        <Link href="/" className="btn-primary mt-4 text-sm">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <JobHeader job={job} />

      {/* Progress bar — running only */}
      {job.status === 'running' && <JobProgressBar job={job} />}

      {/* Pages table */}
      <PagesTable
        pages={pages}
        jobStatus={job.status}
        onViewContent={(page) => setSelectedPage(page)}
      />

      {/* Markdown viewer modal */}
      <MarkdownViewerModal
        page={selectedPage}
        onClose={() => setSelectedPage(null)}
      />
    </div>
  );
}