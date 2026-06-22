import React from 'react';
import { Globe, Map, Scan } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type CrawlMode = 'scrape' | 'map' | 'crawl';

interface ModeBadgeProps {
  mode: CrawlMode;
}

const MODE_CONFIG: Record<CrawlMode, { label: string; icon: React.ElementType; className: string }> = {
  scrape: {
    label: 'Scrape',
    icon: Scan,
    className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  },
  map: {
    label: 'Map',
    icon: Map,
    className: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  },
  crawl: {
    label: 'Crawl',
    icon: Globe,
    className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
};

export default function ModeBadge({ mode }: ModeBadgeProps) {
  const config = MODE_CONFIG[mode];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full text-xs px-2.5 py-1 font-medium ${config.className}`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}