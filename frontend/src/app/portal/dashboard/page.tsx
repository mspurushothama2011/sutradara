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
          background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.15) 0%, rgba(26, 20, 14, 0.6) 100%)',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          borderRadius: '12px',
          padding: '28px 32px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            {user?.role} WORKSPACE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>
            Welcome back, {user?.name || 'Team Member'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Sutradara Handloom Operations & Commerce Hub
          </p>
        </div>

        {/* Quick Clock-In Status */}
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              color: '#4ade80',
              fontSize: '0.8rem',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
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
            background: 'var(--bg-deep)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '20px 24px',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Pending Dispatch
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff', margin: '8px 0 4px' }}>
            12
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>3 ready for video inspection</span>
        </div>

        {/* Metric 2: Live Stock Count */}
        <div
          style={{
            background: 'var(--bg-deep)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '20px 24px',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Active Sarees in Stock
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff', margin: '8px 0 4px' }}>
            48
          </p>
          <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>14 tagged as 1-of-1 Heirloom</span>
        </div>

        {/* Metric 3: Revenue (Only visible if finance:view capability) */}
        {hasCapability('finance:view') ? (
          <div
            style={{
              background: 'var(--bg-deep)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '10px',
              padding: '20px 24px',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Today's Net Revenue 👑
            </span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff', margin: '8px 0 4px' }}>
              ₹1,42,800
            </p>
            <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>+18.4% vs yesterday</span>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-deep)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '10px',
              padding: '20px 24px',
              opacity: 0.6,
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
            background: 'var(--bg-deep)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '24px',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>
            Your Active Portal Capabilities
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
            Your access permissions are configured dynamically by the platform administrator:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {user?.role === 'ADMIN' ? (
              <span
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(201, 168, 76, 0.2)',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                👑 Full System Super-Admin (All Capabilities Active)
              </span>
            ) : (
              (user?.customPermissions || []).map((cap) => (
                <span
                  key={cap}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#e0d8cc',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
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
            background: 'var(--bg-deep)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', marginBottom: '4px' }}>
            Floor Shortcuts
          </h3>

          {hasCapability('inventory:quick_update') && (
            <Link
              href="/portal/quick-stock"
              style={{
                padding: '12px',
                borderRadius: '6px',
                background: 'rgba(201, 168, 76, 0.12)',
                border: '1px solid rgba(201, 168, 76, 0.25)',
                color: 'var(--gold)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 500,
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
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '0.82rem',
                display: 'block',
                textAlign: 'center',
              }}
            >
              📦 View Packing & QC Queue
            </Link>
          )}

          <Link
            href="/"
            target="_blank"
            style={{
              padding: '12px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-dim)',
              textDecoration: 'none',
              fontSize: '0.82rem',
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
