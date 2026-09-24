'use client';

import { usePathname } from 'next/navigation';
import { Sun, Moon, User } from 'lucide-react';
import { useTheme } from './ThemeProvider';

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

  const title =
    ROUTE_TITLES[pathname] ||
    (pathname.startsWith('/tasks/') ? 'Task Details' :
    pathname.startsWith('/datasets/') ? 'Dataset Details' :
    pathname.startsWith('/workflows/') ? 'Workflow Details' : 'InsightAI');

  return (
    <header
      style={{
        height: 64,
        minHeight: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'transparent',
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: '#fff' }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            color: '#999',
            cursor: 'pointer',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <User size={16} />
        </div>
      </div>
    </header>
  );
}
