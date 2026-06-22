'use client';
import React from 'react';
import { Bell, Search } from 'lucide-react';
import AppLogo from './ui/AppLogo';

export default function Topbar() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card flex-shrink-0">
      {/* Left — breadcrumb or page title rendered by page */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <AppLogo size={24} />
          <span className="text-sm font-semibold text-foreground">VeriCrawl</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-foreground font-medium">VeriCrawl</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          className="btn-ghost p-2 rounded-md"
          aria-label="Search"
        >
          <Search size={16} />
        </button>
        <button
          className="btn-ghost p-2 rounded-md relative"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
        {/* User avatar */}
        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary ml-1">
          V
        </div>
      </div>
    </header>
  );
}