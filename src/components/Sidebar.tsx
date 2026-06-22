'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from './ui/AppLogo';
import {
  LayoutDashboard,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  BarChart2,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const NAV_ITEMS = [
  {
    key: 'nav-dashboard',
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    key: 'nav-jobs',
    label: 'All Jobs',
    href: '/all-jobs',
    icon: Globe,
  },
  {
    key: 'nav-usage',
    label: 'Usage',
    href: '/usage',
    icon: BarChart2,
  },
  {
    key: 'nav-settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`relative flex flex-col bg-card border-r border-border transition-sidebar flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-14 border-b border-border px-3 ${collapsed ? 'justify-center' : 'gap-2'}`}>
        <AppLogo size={28} />
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight text-foreground">
            VeriCrawl
          </span>
        )}
      </div>
      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {NAV_ITEMS?.map((item) => {
          const Icon = item?.icon;
          const isActive =
            item?.href === '/' ? pathname === '/' : pathname?.startsWith(item?.href);
          return (
            <Link
              key={item?.key}
              href={item?.href}
              title={collapsed ? item?.label : undefined}
              className={`flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors duration-150 group relative ${
                isActive
                  ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item?.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-muted border border-border rounded text-foreground opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150">
                  {item?.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      {/* Plan badge */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/5 border border-primary/20">
            <Zap size={13} className="text-primary flex-shrink-0" />
            <span className="text-xs text-primary font-medium">Trial Plan</span>
          </div>
        </div>
      )}
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}