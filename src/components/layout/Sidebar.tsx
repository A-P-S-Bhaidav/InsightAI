'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListTodo, Plus, Database, GitBranch, Settings, Brain, ChevronLeft, ChevronRight } from 'lucide-react';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved) setCollapsed(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    const newVal = !collapsed;
    setCollapsed(newVal);
    localStorage.setItem('sidebar_collapsed', String(newVal));
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: ListTodo },
    { name: 'New Task', href: '/tasks/new', icon: Plus },
    { name: 'Datasets', href: '/datasets', icon: Database },
    { name: 'Workflows', href: '/workflows', icon: GitBranch },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
        <Brain className="sidebar-logo-icon" size={32} />
        {!collapsed && <span className="sidebar-logo-text" style={{ fontSize: '1.25rem', fontWeight: 600 }}>InsightAI</span>}
      </div>
      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.5rem' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <item.icon className="sidebar-icon" size={20} />
              {!collapsed && <span className="sidebar-link-text">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="sidebar-toggle btn btn-ghost btn-icon" onClick={toggleSidebar}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        {!collapsed && <span className="sidebar-version" style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>v1.0.0</span>}
      </div>
    </aside>
  );
}

export default Sidebar;
