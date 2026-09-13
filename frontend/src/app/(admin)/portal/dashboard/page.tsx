'use client';

import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';

export default function PortalDashboardPage() {
  const { user, hasCapability, isAdmin } = usePermissions();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(179, 137, 56, 0.25)',
          borderRadius: '12px',
          padding: '28px 32px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold-dark)', textTransform: 'uppercase', fontWeight: 700 }}>
            {user?.role} WORKSPACE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginTop: '4px' }}>
            Welcome back, {user?.name || 'Team Member'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Sutradara Handloom Operations &amp; Commerce Hub
          </p>
        </div>

        {/* Quick Clock-In Status */}
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              color: '#15803d',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
            Shift Active
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {/* Metric 1: Orders Pending */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(179, 137, 56, 0.22)',
            borderRadius: '10px',
            padding: '20px 24px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Pending Dispatch
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--text)', margin: '8px 0 4px', fontWeight: 700 }}>
            12
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', fontWeight: 600 }}>3 ready for video inspection</span>
        </div>

        {/* Metric 2: Live Stock Count */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(179, 137, 56, 0.22)',
            borderRadius: '10px',
            padding: '20px 24px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Active Sarees in Stock
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--text)', margin: '8px 0 4px', fontWeight: 700 }}>
            48
          </p>
          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>14 tagged as 1-of-1 Heirloom</span>
        </div>

        {/* Metric 3: Revenue (Only visible if finance:view capability) */}
        {hasCapability('finance:view') ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              borderRadius: '10px',
              padding: '20px 24px',
              boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Today's Net Revenue 👑
            </span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--text)', margin: '8px 0 4px', fontWeight: 700 }}>
              ₹1,42,800
            </p>
            <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>+18.4% vs yesterday</span>
          </div>
        ) : (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(179, 137, 56, 0.15)',
              borderRadius: '10px',
              padding: '20px 24px',
              opacity: 0.75,
              boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Financial Revenue
            </span>
            <p style={{ fontSize: '1rem', color: 'var(--text-dim)', margin: '14px 0 4px' }}>
              🔒 Restricted to Admin
            </p>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Requires finance:view capability</span>
          </div>
        )}
      </div>

      {/* Active Capabilities & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Granted Capabilities */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(179, 137, 56, 0.22)',
            borderRadius: '10px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '16px', fontWeight: 600 }}>
            Your Active Portal Capabilities
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
            Your access permissions are configured dynamically by the platform administrator:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {user?.role === 'ADMIN' ? (
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: 'rgba(179, 137, 56, 0.15)',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold-dark)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                👑 Full System Super-Admin (All Capabilities Active)
              </span>
            ) : (
              (user?.customPermissions || []).map((cap) => (
                <span
                  key={cap}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.25)',
                    color: 'var(--text)',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  ✓ {cap}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Shortcuts */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(179, 137, 56, 0.22)',
            borderRadius: '10px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '4px', fontWeight: 600 }}>
            Floor Shortcuts
          </h3>

          {hasCapability('inventory:quick_update') && (
            <Link
              href="/portal/quick-stock"
              style={{
                padding: '12px',
                borderRadius: '6px',
                background: 'rgba(179, 137, 56, 0.12)',
                border: '1px solid rgba(179, 137, 56, 0.3)',
                color: 'var(--gold-dark)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'block',
                textAlign: 'center',
              }}
            >
              ⚡ Open Floor Quick-Stock Adjuster
            </Link>
          )}

          {hasCapability('orders:manage') && (
            <Link
              href="/portal/orders"
              style={{
                padding: '12px',
                borderRadius: '6px',
                background: '#FAF8F5',
                border: '1px solid rgba(179, 137, 56, 0.25)',
                color: 'var(--text)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'block',
                textAlign: 'center',
              }}
            >
              📦 View Packing &amp; QC Queue
            </Link>
          )}

          <Link
            href="/"
            target="_blank"
            style={{
              padding: '12px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid rgba(179, 137, 56, 0.25)',
              color: 'var(--text-dim)',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'block',
              textAlign: 'center',
            }}
          >
            🌐 Open Customer Storefront ↗
          </Link>
        </div>
      </div>
    </div>
  );
}

