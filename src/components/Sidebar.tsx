'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  Users,
  ChevronLeft,
  ChevronRight,
  Heart,
  Bell,
  Settings,
  LogOut,
  Wifi,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  group: string;
}

const navItems: NavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Emergency Dashboard',
    href: '/',
    icon: Activity,
    badge: 3,
    group: 'Monitoring',
  },
  {
    id: 'nav-history',
    label: 'Alert History',
    href: '/alert-history',
    icon: AlertTriangle,
    group: 'Monitoring',
  },
  {
    id: 'nav-patients',
    label: 'Patient Management',
    href: '/patient-management',
    icon: Users,
    group: 'Management',
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`relative flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border min-h-[68px]">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Heart size={16} className="text-primary-foreground" fill="currentColor" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="font-bold text-sm text-foreground tracking-tight block leading-tight">
              CardiacWatch
            </span>
            <span className="text-xs text-muted-foreground block">
              Emergency Monitor
            </span>
          </div>
        )}
      </div>

      {/* Live Indicator */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-md bg-success/10 border border-success/30 flex items-center gap-2">
          <Wifi size={12} className="text-success" />
          <span className="text-xs text-success font-medium">Live · Polling active</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-success pulse-critical" />
        </div>
      )}

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
        {['Monitoring', 'Management'].map((group) => {
          const groupItems = navItems.filter((i) => i.group === group);
          return (
            <div key={`group-${group}`} className="mb-4">
              {!collapsed && (
                <p className="text-xs font-500 text-muted-foreground uppercase tracking-widest px-2 mb-1">
                  {group}
                </p>
              )}
              {groupItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-primary/15 text-primary border border-primary/30' :'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                    }`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="text-sm font-medium truncate flex-1">
                          {item.label}
                        </span>
                        {item.badge !== undefined && (
                          <span className="text-xs font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border px-2 py-3 space-y-0.5">
        {[
          { id: 'nav-notif', icon: Bell, label: 'Notifications' },
          { id: 'nav-settings', icon: Settings, label: 'Settings' },
          { id: 'nav-logout', icon: LogOut, label: 'Sign Out' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={collapsed ? label : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </button>
        ))}

        {/* User */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1 border-t border-border">
            <div className="w-7 h-7 rounded-full bg-info/20 border border-info/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-info">DR</span>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-foreground truncate">Dr. Aisha Mengesha</p>
              <p className="text-xs text-muted-foreground truncate">On-call Cardiologist</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-all duration-150 z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-muted-foreground" />
        ) : (
          <ChevronLeft size={12} className="text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}