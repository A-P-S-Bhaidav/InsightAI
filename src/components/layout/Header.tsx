'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/tasks/new': 'New Task',
  '/datasets': 'Datasets',
  '/workflows': 'Workflows',
  '/settings': 'Settings',
};

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const title =
    ROUTE_TITLES[pathname] ||
    (pathname.startsWith('/tasks/') ? 'Task Details' :
    pathname.startsWith('/datasets/') ? 'Dataset Details' :
    pathname.startsWith('/workflows/') ? 'Workflow Details' : 'InsightAI');

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header
      style={{
        height: 56, minHeight: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'transparent',
      }}
    >
      <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 8,
            border: '1px solid var(--border-color)', background: 'var(--bg-surface)',
            color: 'var(--text-secondary)', cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Profile dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}
          >
            <User size={15} />
          </button>

          {profileOpen && (
            <div
              style={{
                position: 'absolute', top: 42, right: 0, width: 200,
                background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                borderRadius: 10, padding: 6, zIndex: 100,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 6, fontSize: 13,
                  color: 'var(--text-primary)', textDecoration: 'none',
                }}
              >
                <Settings size={15} /> Settings
              </Link>
              <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '10px 12px', borderRadius: 6, fontSize: 13,
                  color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer',
                }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
