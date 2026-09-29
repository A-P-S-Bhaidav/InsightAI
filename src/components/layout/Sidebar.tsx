'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, ListTodo, Plus, Database, GitBranch,
  Settings, Brain, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'New Task', href: '/tasks/new', icon: Plus },
  { name: 'Datasets', href: '/datasets', icon: Database },
  { name: 'Workflows', href: '/workflows', icon: GitBranch },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isMobileOpen, onClose }: { isMobileOpen?: boolean; onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
  };

  // On mobile, if the sidebar is open, we don't want it collapsed.
  const isCurrentlyCollapsed = collapsed && !isMobileOpen;
  const w = isCurrentlyCollapsed ? 68 : 240;

  return (
    <aside
      className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
      style={{
        width: w,
        minWidth: w,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        transition: 'all 200ms ease',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: isCurrentlyCollapsed ? '16px 0' : '16px 16px', justifyContent: isCurrentlyCollapsed ? 'center' : 'flex-start' }}>
        <Brain size={26} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        {!isCurrentlyCollapsed && <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>InsightAI</span>}
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: isCurrentlyCollapsed ? '0 8px' : '0 10px', marginTop: 4 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/tasks/new' && pathname.startsWith(item.href + '/'));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onClose?.()}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                height: 40, padding: isCurrentlyCollapsed ? '0' : '0 12px',
                justifyContent: isCurrentlyCollapsed ? 'center' : 'flex-start',
                borderRadius: 8, textDecoration: 'none', fontSize: 13.5, fontWeight: active ? 500 : 400,
                color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--color-primary-900)' : 'transparent',
                borderLeft: active ? '3px solid var(--color-primary)' : '3px solid transparent',
                transition: 'background 150ms ease, color 150ms ease',
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!isCurrentlyCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: isCurrentlyCollapsed ? '12px 8px' : '12px 10px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, height: 36,
            padding: isCurrentlyCollapsed ? '0' : '0 12px', justifyContent: isCurrentlyCollapsed ? 'center' : 'flex-start',
            borderRadius: 8, border: 'none', background: 'transparent',
            color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', width: '100%',
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!isCurrentlyCollapsed && <span>Logout</span>}
        </button>
        <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: isCurrentlyCollapsed ? 'center' : 'space-between' }}>
          <button
            onClick={toggle}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 6,
              border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            {isCurrentlyCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          {!isCurrentlyCollapsed && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>v2.0</span>}
        </div>
      </div>
    </aside>
  );
}
