'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, Globe, Map, Scan, ChevronRight, Info } from 'lucide-react';

type CrawlMode = 'scrape' | 'map' | 'crawl';

interface JobFormValues {
  start_url: string;
  max_pages: number;
}

const MODES: { key: CrawlMode; label: string; icon: React.ElementType; description: string }[] = [
  {
    key: 'scrape',
    label: 'Scrape',
    icon: Scan,
    description: 'Extract content from a single URL — no link following',
  },
  {
    key: 'map',
    label: 'Map',
    icon: Map,
    description: 'Discover all URLs on a site via BFS — no content extraction',
  },
  {
    key: 'crawl',
    label: 'Crawl',
    icon: Globe,
    description: 'Full BFS crawl with markdown content extraction per page',
  },
];

export default function NewJobForm() {
  const router = useRouter();
  const [mode, setMode] = useState<CrawlMode>('crawl');
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<JobFormValues>({
    defaultValues: { start_url: '', max_pages: 2000 },
  });

  const maxPagesValue = watch('max_pages');

  const onSubmit = async (data: JobFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/jobs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, mode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit job');

      toast.success('Job queued successfully', {
        description: `${mode.charAt(0).toUpperCase() + mode.slice(1)} job for ${data.start_url}`,
      });
      reset();
      // Navigate to job detail page
      router.push(`/job-detail?jobId=${json.jobId}`);
    } catch (err) {
      toast.error('Failed to submit job', {
        description: err instanceof Error ? err.message : 'Check the worker connection and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isScrape = mode === 'scrape';

  return (
    <div className="card-base p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-base font-semibold text-foreground">New Crawl Job</h2>
        <span className="text-xs text-muted-foreground">Submit a URL to start crawling</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        {/* Mode selector */}
        <fieldset>
          <legend className="text-xs font-medium text-muted-foreground mb-2 tracking-wide uppercase">
            Mode
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map((m) => {
              const ModeIcon = m.icon;
              const active = mode === m.key;
              return (
                <button
                  key={`mode-${m.key}`}
                  type="button"
                  onClick={() => setMode(m.key)}
                  className={`flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all duration-150 ${
                    active
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-input hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ModeIcon size={16} className={`mt-0.5 flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                  <div>
                    <span className={`text-sm font-medium block ${active ? 'text-foreground' : ''}`}>
                      {m.label}
                    </span>
                    <span className="text-xs text-muted-foreground leading-relaxed mt-0.5 block">
                      {m.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* URL input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="start_url" className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            Start URL
          </label>
          <input
            id="start_url"
            type="url"
            className="input-base font-mono-data text-sm"
            placeholder="https://example.com"
            {...register('start_url', {
              required: 'A start URL is required',
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'URL must start with http:// or https://',
              },
            })}
          />
          {errors.start_url && (
            <p className="text-xs text-red-400 mt-0.5">{errors.start_url.message}</p>
          )}
        </div>

        {/* Max pages — hidden for scrape mode */}
        {!isScrape && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="max_pages" className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                Max Pages
              </label>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Info size={11} />
                Hard cap: 2,000
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="max_pages"
                type="range"
                min={10}
                max={2000}
                step={10}
                className="flex-1 h-1.5 appearance-none rounded-full bg-muted accent-primary cursor-pointer"
                {...register('max_pages', {
                  valueAsNumber: true,
                  min: { value: 1, message: 'Must be at least 1 page' },
                  max: { value: 2000, message: 'Maximum is 2,000 pages' },
                })}
              />
              <input
                type="number"
                min={1}
                max={2000}
                className="input-base w-24 text-sm font-mono-data text-right"
                value={maxPagesValue}
                onChange={(e) => {
                  const v = Math.min(2000, Math.max(1, parseInt(e.target.value) || 1));
                  reset({ start_url: watch('start_url'), max_pages: v });
                }}
              />
            </div>
            {errors.max_pages && (
              <p className="text-xs text-red-400 mt-0.5">{errors.max_pages.message}</p>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {isScrape ? 'Single page extraction' : `Up to ${(maxPagesValue || 2000).toLocaleString()} pages`}
          </span>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary min-w-[140px] justify-center"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                Submit Job
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}