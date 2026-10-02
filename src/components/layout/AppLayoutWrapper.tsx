'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import OnboardingTutorial from '@/components/common/OnboardingTutorial';
import React from 'react';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/')
  ) && pathname !== '/dashboard';

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-main)' }}>
        {isMobileMenuOpen && (
          <div 
            className="mobile-only-flex"
            role="presentation"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 }}
          />
        )}
        <Sidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
          <main id="main-content" role="main" aria-label="Page content" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
        </div>
      </div>
      <OnboardingTutorial onComplete={() => {}} />
    </>
  );
}
