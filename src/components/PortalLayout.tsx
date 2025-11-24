'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

interface PortalLayoutProps {
  children: ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: '📊',
      href: '/app/dashboard',
      active: router.pathname === '/app/dashboard',
    },
    {
      label: 'CRM',
      icon: '👥',
      children: [
        {
          label: 'Contacts',
          href: '/app/crm/contacts',
          active: router.pathname.startsWith('/app/crm/contacts'),
        },
        {
          label: 'Deals',
          href: '/app/crm/deals',
          active: router.pathname.startsWith('/app/crm/deals'),
        },
        {
          label: 'Tasks',
          href: '/app/crm/tasks',
          active: router.pathname.startsWith('/app/crm/tasks'),
          disabled: false,
        },
        {
          label: 'Notes',
          href: '/app/crm/notes',
          active: router.pathname.startsWith('/app/crm/notes'),
          disabled: false,
        },
      ],
    },
    {
      label: 'Shadow Board',
      icon: '🧠',
      href: '/app/shadowboard',
      active: router.pathname.startsWith('/app/shadowboard'),
      disabled: false,
      tooltip: undefined,
    },
    {
      label: 'Governance',
      icon: '⚖️',
      href: '/app/governance',
      active: router.pathname.startsWith('/app/governance'),
      disabled: false,
      tooltip: undefined,
    },
    {
      label: 'Analytics',
      icon: '📊',
      href: '/app/analytics',
      active: router.pathname.startsWith('/app/analytics'),
      disabled: false,
      tooltip: undefined,
    },
    {
      label: 'Engines',
      icon: '⚙️',
      href: '/app/engines',
      active: router.pathname.startsWith('/app/engines'),
      disabled: false,
      tooltip: undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 transition-all duration-300 z-50',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {!sidebarCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Sovren AI
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item, idx) => (
            <div key={idx}>
              {item.children ? (
                // Section with children
                <div className="mb-2">
                  <div className="flex items-center px-3 py-2 text-sm text-gray-400 font-medium">
                    <span className="mr-2">{item.icon}</span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <div className="space-y-1 ml-4">
                      {item.children.map((child, childIdx) => (
                        <Link
                          key={childIdx}
                          href={child.disabled ? '#' : child.href}
                          className={cn(
                            'flex items-center px-3 py-2 text-sm rounded-lg transition-colors',
                            child.active
                              ? 'bg-indigo-600 text-white'
                              : child.disabled
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          )}
                          onClick={(e) => child.disabled && e.preventDefault()}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Single nav item
                <Link
                  href={item.disabled ? '#' : item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm rounded-lg transition-colors relative group',
                    item.active
                      ? 'bg-indigo-600 text-white'
                      : item.disabled
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                  onClick={(e) => item.disabled && e.preventDefault()}
                >
                  <span className="mr-3">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {item.disabled && item.tooltip && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.tooltip}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-800">
          {!sidebarCollapsed && user && (
            <div className="mb-2">
              <div className="text-xs text-gray-500">Signed in as</div>
              <div className="text-sm text-gray-300 truncate">{user.email}</div>
              <div className="text-xs text-indigo-400">{user.tier} Tier</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <span className="mr-2">🚪</span>
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Top bar */}
        <header className="h-16 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-white">
              {router.pathname === '/app/dashboard' && 'Command Center'}
              {router.pathname.startsWith('/app/shadowboard') && 'Shadow Board'}
              {router.pathname.startsWith('/app/crm/contacts') && 'Contacts'}
              {router.pathname.startsWith('/app/crm/deals') && 'Deals'}
              {router.pathname.startsWith('/app/crm/tasks') && 'Tasks'}
              {router.pathname.startsWith('/app/crm/notes') && 'Notes'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
