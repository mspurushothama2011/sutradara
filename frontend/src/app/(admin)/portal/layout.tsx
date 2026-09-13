'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import { Capability } from '@/shared/types/index';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  capability?: Capability;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/portal/dashboard', icon: '📊' },
  { label: 'Saree Catalog', href: '/portal/catalog', icon: '👗', capability: 'products:view' },
  { label: 'Weave Categories', href: '/portal/categories', icon: '🏷️', capability: 'products:view' },
  { label: 'Quick Stock (Floor)', href: '/portal/quick-stock', icon: '⚡', capability: 'inventory:quick_update' },
  { label: 'Orders & Dispatch', href: '/portal/orders', icon: '📦', capability: 'orders:manage' },
  { label: 'Marketing & Promos', href: '/portal/marketing', icon: '🎟️', capability: 'marketing:manage' },
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
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/portal/login';
  };

  const allowedNavItems = NAV_ITEMS.filter((item) => {
    if (!item.capability) return true;
    return hasCapability(item.capability);
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Dynamic Luxury Sidebar */}
      <aside
        style={{
          width: '260px',
          background: '#1A130D',
          borderRight: '1px solid rgba(179, 137, 56, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Brand Header */}
        <div style={{ marginBottom: '28px', paddingLeft: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.25em', display: 'block', fontWeight: 700 }}>
            SUTRA<span style={{ color: '#fff' }}>ಧಾರ</span>
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#ffffff', marginTop: '4px', fontWeight: 600 }}>
            Unified Portal
          </h2>
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
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : '#D4C4B5',
                  background: isActive ? 'linear-gradient(90deg, rgba(179, 137, 56, 0.35) 0%, rgba(179, 137, 56, 0.15) 100%)' : 'transparent',
                  borderLeft: isActive ? '3.5px solid var(--gold)' : '3.5px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1.05rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ padding: '8px', marginBottom: '10px' }}>
            <p style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>{user?.name || 'Staff User'}</p>
            <span
              style={{
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '3px 8px',
                borderRadius: '4px',
                background: user?.role === 'ADMIN' ? 'rgba(179, 137, 56, 0.3)' : 'rgba(255, 255, 255, 0.12)',
                color: user?.role === 'ADMIN' ? '#F5D77F' : '#D4C4B5',
                display: 'inline-block',
                marginTop: '4px',
                fontWeight: 700,
              }}
            >
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '9px 12px',
              background: 'rgba(239, 68, 68, 0.18)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background 0.2s ease',
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '36px', background: 'var(--bg)' }}>{children}</main>
    </div>
  );
}
