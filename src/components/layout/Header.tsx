'use client'
import React, { useState } from 'react';
import { Search, Sun, Moon, Bell, User } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');

  return (
    <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid var(--color-surface)' }}>
      <div className="header-search">
        <div className="search-input-wrapper search-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit' }}
          />
        </div>
      </div>
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-ghost btn-icon" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="notification-wrapper" style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-icon" aria-label="Notifications">
            <Bell size={20} />
            <span className="badge badge-danger notification-badge" style={{ position: 'absolute', top: -5, right: -5 }}>3</span>
          </button>
        </div>
        <div className="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={20} />
        </div>
      </div>
    </header>
  );
}

export default Header;
