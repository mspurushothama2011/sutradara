'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import { Capability } from '../../../../shared/types/index';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  capability?: Capability;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/portal/dashboard', icon: '📊' },
  { label: 'Saree Catalog', href: '/portal/catalog', icon: '👗', capability: 'products:view' },
  { label: 'Quick Stock (Floor)', href: '/portal/quick-stock', icon: '⚡', capability: 'inventory:quick_update' },
  { label: 'Orders & Dispatch', href: '/portal/orders', icon: '📦', capability: 'orders:manage' },
  { label: 'Marketing & Promos', href: '/portal/marketing', icon: '🏷️', capability: 'marketing:manage' },
  { label: 'Staff HR & Payroll', href: '/portal/staff-hr', icon: '⏱️', capability: 'staff:attendance_view' },
  { label: 'Daily Work Logs', href: '/portal/work-logs', icon: '📝', capability: 'staff:attendance_view' },
  { label: 'Team Noticeboard', href: '/portal/noticeboard', icon: '💬' },
  { label: 'Audit & Security', href: '/portal/audit-logs', icon: '📜', capability: 'audit:view' },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, hasCapability } = usePermissions();
  const isLoginPage = pathname === '/portal/login';

  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.push('/portal/login');
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
        <p style={{ letterSpacing: '0.2em' }}>AUTHENTICATING PORTAL...</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('sutradara_token');
    localStorage.removeItem('sutradara_user');
    router.push('/portal/login');
  };

  const allowedNavItems = NAV_ITEMS.filter((item) => {
    if (!item.capability) return true;
    return hasCapability(item.capability);
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Dynamic Sidebar */}
      <aside
        style={{
          width: '260px',
          background: 'var(--bg-deep)',
          borderRight: '1px solid rgba(201, 168, 76, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
        }}
      >
        {/* Brand Header */}
        <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.25em', display: 'block' }}>SUTRAಧಾರ</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', marginTop: '4px' }}>Unified Portal</h2>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {allowedNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  color: isActive ? '#fff' : 'var(--text-dim)',
                  background: isActive ? 'rgba(201, 168, 76, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '8px', marginBottom: '10px' }}>
            <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{user?.name || 'Staff User'}</p>
            <span
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '2px 6px',
                borderRadius: '4px',
                background: user?.role === 'ADMIN' ? 'rgba(201, 168, 76, 0.25)' : 'rgba(255,255,255,0.08)',
                color: user?.role === 'ADMIN' ? 'var(--gold)' : 'var(--text-dim)',
                display: 'inline-block',
                marginTop: '4px',
              }}
            >
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(220, 38, 38, 0.12)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#f87171',
              borderRadius: '6px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>{children}</main>
    </div>
  );
}
