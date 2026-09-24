'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import OnboardingTutorial from '@/components/common/OnboardingTutorial';
import React from 'react';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/')
  ) && pathname !== '/dashboard';

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-main)' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Header />
          <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {children}
          </main>
        </div>
      </div>
      <OnboardingTutorial onComplete={() => {}} />
    </>
  );
}
