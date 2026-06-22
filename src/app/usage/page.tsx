import React from 'react';
import AppLayout from '@/components/AppLayout';
import UsageStatsRow from './components/UsageStatsRow';
import NewJobForm from './components/NewJobForm';
import JobsTable from './components/JobsTable';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Submit crawl jobs and monitor progress across your workspace.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Worker online
          </div>
        </div>

        {/* Usage stats */}
        <UsageStatsRow />

        {/* New job form */}
        <NewJobForm />

        {/* Jobs table */}
        <JobsTable />
      </div>
    </AppLayout>
  );
}