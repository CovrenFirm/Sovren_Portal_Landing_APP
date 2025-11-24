'use client';

import { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/cn';

interface PortalLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PortalLayout({ children, className }: PortalLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-black text-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden',
            'bg-gradient-to-br from-black via-gray-950 to-black',
            'scrollbar-thin scrollbar-track-gray-950 scrollbar-thumb-gray-800',
            className
          )}
        >
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
