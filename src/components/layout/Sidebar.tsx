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

export default function Sidebar() {
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

  const w = collapsed ? 68 : 240;

  return (
    <aside
      style={{
        width: w,
        minWidth: w,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        transition: 'width 200ms ease, min-width 200ms ease',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '16px 0' : '16px 16px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Brain size={26} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        {!collapsed && <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>InsightAI</span>}
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: collapsed ? '0 8px' : '0 10px', marginTop: 4 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/tasks/new' && pathname.startsWith(item.href + '/'));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                height: 40, padding: collapsed ? '0' : '0 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8, textDecoration: 'none', fontSize: 13.5, fontWeight: active ? 500 : 400,
                color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--color-primary-900)' : 'transparent',
                borderLeft: active ? '3px solid var(--color-primary)' : '3px solid transparent',
                transition: 'background 150ms ease, color 150ms ease',
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: collapsed ? '12px 8px' : '12px 10px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, height: 36,
            padding: collapsed ? '0' : '0 12px', justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8, border: 'none', background: 'transparent',
            color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', width: '100%',
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          <button
            onClick={toggle}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 6,
              border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          {!collapsed && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>v2.0</span>}
        </div>
      </div>
    </aside>
  );
}
