'use client';
import React, { useState, useEffect, useCallback } from 'react';

// Replaces the old hardcoded "Worker online" label. Actually polls /api/worker/health,
// which itself pings the real Crawl4AI worker server-side. Three real states instead of
// one fake one: checking, online, offline — each with its own honest label and color.

type HealthState = 'checking' | 'online' | 'offline';

const POLL_INTERVAL_MS = 30_000; // recheck every 30s — frequent enough to notice a dead worker, cheap enough not to spam the route

export default function WorkerStatusBadge() {
  const [state, setState] = useState<HealthState>('checking');

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/worker/health', { cache: 'no-store' });
      const data = await res.json();
      setState(data.online ? 'online' : 'offline');
    } catch {
      setState('offline');
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const config = {
    checking: { dot: 'bg-amber-400', label: 'Checking worker…', pulse: true },
    online: { dot: 'bg-emerald-400', label: 'Worker online', pulse: true },
    offline: { dot: 'bg-red-400', label: 'Worker offline', pulse: false },
  }[state];

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
      {config.label}
    </div>
  );
}
