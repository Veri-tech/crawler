'use client';
import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { CrawlPage } from '@/lib/mockData';

interface MarkdownViewerModalProps {
  page: CrawlPage | null;
  onClose: () => void;
}

export default function MarkdownViewerModal({ page, onClose }: MarkdownViewerModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!page?.markdown) return;
    await navigator.clipboard.writeText(page.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={!!page}
      onClose={onClose}
      title={page?.title ?? 'Page Content'}
      size="xl"
    >
      {page && (
        <div className="flex flex-col">
          {/* Meta bar */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-secondary/30 flex-wrap">
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono-data text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 max-w-lg truncate"
            >
              {page.url}
              <ExternalLink size={11} className="flex-shrink-0" />
            </a>
            <div className="flex items-center gap-3">
              <span className={`font-mono-data text-xs font-semibold ${
                (page.status_code ?? 0) >= 200 && (page.status_code ?? 0) < 300
                  ? 'text-emerald-400' :'text-red-400'
              }`}>
                HTTP {page.status_code ?? '—'}
              </span>
              <span className="text-xs text-muted-foreground">
                {page.links.length} links
              </span>
              <button
                onClick={handleCopy}
                className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    Copy Markdown
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Markdown content */}
          <div className="p-5 overflow-y-auto max-h-[60vh] scrollbar-thin">
            {page.markdown ? (
              <pre className="markdown-content">{page.markdown}</pre>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-8">
                No markdown content was extracted for this page.
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}