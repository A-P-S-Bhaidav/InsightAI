'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import React from 'react';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isPublicRoute = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup');
  
  if (isPublicRoute) {
    return <main>{children}</main>;
  }
  
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
