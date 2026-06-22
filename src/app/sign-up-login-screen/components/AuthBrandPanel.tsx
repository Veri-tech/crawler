import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { Globe, Map, Scan, Sparkles } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const FEATURES = [
  {
    key: 'feat-scrape',
    icon: Scan,
    label: 'Scrape',
    description: 'Extract clean markdown from any single URL in seconds.',
  },
  {
    key: 'feat-map',
    icon: Map,
    label: 'Map',
    description: 'Discover every URL on a site with BFS depth crawling.',
  },
  {
    key: 'feat-crawl',
    icon: Globe,
    label: 'Crawl',
    description: 'Full-site crawl with content extraction at scale.',
  },
  {
    key: 'feat-ai',
    icon: Sparkles,
    label: 'AI Analysis',
    description: 'Structured extraction and summarisation per page.',
  },
];

export default function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex w-[480px] xl:w-[540px] flex-col justify-between bg-card border-r border-border p-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="blob-primary absolute -top-20 -left-20 w-80 h-80" />
        <div className="blob-primary absolute bottom-10 right-10 w-60 h-60" />
      </div>
      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5">
        <AppLogo size={32} />
        <span className="text-lg font-semibold tracking-tight text-foreground">VeriCrawl</span>
      </div>
      {/* Feature list */}
      <div className="relative z-10 flex flex-col gap-5">
        <div className="mb-2">
          <h2 className="text-2xl font-semibold text-foreground leading-snug mb-2">
            Web crawling built for developers
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Scrape, map, and crawl any website at scale. Get clean markdown output, site maps, and AI-structured extractions — all from one dashboard.
          </p>
        </div>
        {FEATURES?.map((f) => {
          const Icon = f?.icon;
          return (
            <div key={f?.key} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={15} className="text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">{f?.label}</span>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{f?.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer */}
      <div className="relative z-10 text-xs text-muted-foreground">
        © 2026 VeriTech Digital · crawl.veritechdigital.co.za
      </div>
    </div>
  );
}