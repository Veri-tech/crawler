import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import JobDetailClient from './components/JobDetailClient';

function JobDetailFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading job…</p>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <AppLayout>
      <Suspense fallback={<JobDetailFallback />}>
        <JobDetailClient />
      </Suspense>
    </AppLayout>
  );
}