'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import { apiRequest } from '@/lib/api';
import {
  Package,
  Layers,
  IndianRupee,
  Users,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface DashboardStats {
  timestamp: string;
  orders: {
    total: number;
    pendingDispatch: number;
    readyForInspection: number;
    processing: number;
    inTransit: number;
    delivered: number;
    cancelled: number;
    recent: Array<{
      id: string;
      orderNumber: string;
      totalAmount: number;
      status: string;
      createdAt: string;
      customerName: string | null;
      customerEmail: string | null;
      customerPhone: string | null;
      customer: { name: string | null; email: string | null; phone: string | null } | null;
      items: Array<{
        id: string;
        quantity: number;
        price: number;
        product: { name: string; sku: string; images: string[] } | null;
      }>;
    }>;
  };
  inventory: {
    totalProducts: number;
    activeInStock: number;
    totalStockUnits: number;
    heirloomCount: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  finance: {
    todayRevenue: number;
    yesterdayRevenue: number;
    revenueGrowth: number;
    totalLifetimeRevenue: number;
    paidOrdersCount: number;
  };
  operations: {
    totalStaff: number;
    todayAttendanceCount: number;
    isShiftActive: boolean;
    userAttendanceToday: any;
    recentAuditLogs: Array<{
      id: string;
      action: string;
      entityType: string;
      createdAt: string;
      user: { name: string; email: string; role: string } | null;
    }>;
    announcements: Array<{
      id: string;
      title: string;
      content: string;
      isUrgent: boolean;
      createdAt: string;
    }>;
  };
}

export default function PortalDashboardPage() {
  const { user, hasCapability, isAdmin } = usePermissions();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const data = await apiRequest<DashboardStats>('/admin/dashboard/stats');
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Failed to load dashboard telemetry:', err);
      setError(err.message || 'Failed to fetch real-time operational data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto-poll real-time telemetry every 15 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return { bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.4)', text: '#15803d', label: 'Paid / Queued' };
      case 'QC_INSPECTED':
        return { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', text: '#854d0e', label: 'QC Inspected' };
      case 'PROCESSING':
        return { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.4)', text: '#1d4ed8', label: 'Processing / Packed' };
      case 'SHIPPED':
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.4)', text: '#7e22ce', label: 'In Transit' };
      case 'DELIVERED':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#065f46', label: 'Delivered' };
      case 'CANCELLED':
        return { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.4)', text: '#b91c1c', label: 'Cancelled' };
      default:
        return { bg: '#FAF8F5', border: 'rgba(179, 137, 56, 0.3)', text: 'var(--text)', label: status };
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Welcome & Real-Time Telemetry Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid rgba(179, 137, 56, 0.25)',
          borderRadius: '12px',
          padding: '24px 32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                color: 'var(--gold-dark)',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              {user?.role} WORKSPACE
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#15803d',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  boxShadow: '0 0 6px #16a34a',
                }}
              />
              Live Telemetry
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: 'var(--text)', marginTop: '4px' }}>
            Welcome back, {user?.name || 'Team Member'}
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Sutradara Handloom Operations & Live Commerce Telemetry
          </p>
        </div>

        {/* Real-Time Live Sync & Refresh Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastUpdated && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#FAF8F5',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              color: 'var(--gold-dark)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Syncing...' : 'Live Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '24px',
            padding: '12px 18px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#b91c1c',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Real-Time Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {/* Metric 1: Pending Dispatch & Orders */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(179, 137, 56, 0.25)',
            borderRadius: '10px',
            padding: '22px 24px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Orders Pending Dispatch
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(179, 137, 56, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold)',
              }}
            >
              <Package size={18} />
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--text)', margin: '10px 0 6px', fontWeight: 700, lineHeight: 1 }}>
            {isLoading ? '...' : stats?.orders.pendingDispatch ?? 0}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.75rem', marginTop: '8px' }}>
            <span style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>
              • {stats?.orders.readyForInspection ?? 0} awaiting vault QC inspection
            </span>
            <span style={{ color: 'var(--text-dim)' }}>
              • {stats?.orders.inTransit ?? 0} currently in courier transit ({stats?.orders.total ?? 0} lifetime orders)
            </span>
          </div>
        </div>

        {/* Metric 2: Live Stock & Inventory */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(179, 137, 56, 0.25)',
            borderRadius: '10px',
            padding: '22px 24px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Active Sarees in Stock
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(37, 99, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <Layers size={18} />
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--text)', margin: '10px 0 6px', fontWeight: 700, lineHeight: 1 }}>
            {isLoading ? '...' : stats?.inventory.activeInStock ?? 0}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.75rem', marginTop: '8px' }}>
            <span style={{ color: '#2563eb', fontWeight: 600 }}>
              • {stats?.inventory.heirloomCount ?? 0} tagged as 1-of-1 Heirloom
            </span>
            <span style={{ color: 'var(--text-dim)' }}>
              • {stats?.inventory.totalStockUnits ?? 0} total physical units across {stats?.inventory.totalProducts ?? 0} SKUs
            </span>
          </div>
        </div>

        {/* Metric 3: Today's Net Revenue */}
        {hasCapability('finance:view') || isAdmin ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              borderRadius: '10px',
              padding: '22px 24px',
              boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Today's Net Revenue 👑
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(21, 128, 61, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#15803d',
                }}
              >
                <IndianRupee size={18} />
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', color: 'var(--text)', margin: '10px 0 6px', fontWeight: 700, lineHeight: 1 }}>
              {isLoading ? '...' : formatCurrency(stats?.finance.todayRevenue ?? 0)}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.75rem', marginTop: '8px' }}>
              <span style={{ color: (stats?.finance.revenueGrowth ?? 0) >= 0 ? '#15803d' : '#b91c1c', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} />
                {(stats?.finance.revenueGrowth ?? 0) >= 0 ? '+' : ''}{stats?.finance.revenueGrowth ?? 0}% vs yesterday
              </span>
              <span style={{ color: 'var(--text-dim)' }}>
                • Lifetime: {formatCurrency(stats?.finance.totalLifetimeRevenue ?? 0)} ({stats?.finance.paidOrdersCount ?? 0} paid orders)
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(179, 137, 56, 0.15)',
              borderRadius: '10px',
              padding: '22px 24px',
              opacity: 0.75,
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

        {/* Metric 4: Floor & Staff Telemetry */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(179, 137, 56, 0.25)',
            borderRadius: '10px',
            padding: '22px 24px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Team & Operations
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(168, 85, 247, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7e22ce',
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--text)', margin: '10px 0 6px', fontWeight: 700, lineHeight: 1 }}>
            {isLoading ? '...' : stats?.operations.totalStaff ?? 0}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.75rem', marginTop: '8px' }}>
            <span style={{ color: '#15803d', fontWeight: 600 }}>
              • {stats?.operations.todayAttendanceCount ?? 0} staff clocked in today
            </span>
            <span style={{ color: 'var(--text-dim)' }}>
              • Floor Status: {stats?.operations.isShiftActive ? '🟢 You are on active shift' : '⚪ Shift not clocked in'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Real-Time Feed Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Left: Recent Customer Orders Feed */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(179, 137, 56, 0.25)',
            borderRadius: '10px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text)', fontWeight: 600 }}>
                Live Fulfillment & Dispatch Queue
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Latest orders requiring vault packaging, video QC, or courier transit
              </p>
            </div>
            <Link
              href="/portal/orders"
              style={{
                fontSize: '0.82rem',
                color: 'var(--gold-dark)',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View All Orders <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
              Fetching real-time orders from PostgreSQL...
            </div>
          ) : !stats?.orders.recent || stats.orders.recent.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.88rem', background: '#FAF8F5', borderRadius: '6px' }}>
              No orders placed yet. New customer checkouts will appear here immediately in real-time.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(179, 137, 56, 0.2)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '10px 12px' }}>Order #</th>
                    <th style={{ padding: '10px 12px' }}>Customer</th>
                    <th style={{ padding: '10px 12px' }}>Total Amount</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.orders.recent.map((ord) => {
                    const badge = getStatusBadge(ord.status);
                    const customerName = ord.customer?.name || ord.customerName || ord.customer?.email || 'Valued Patron';
                    return (
                      <tr key={ord.id} style={{ borderBottom: '1px solid rgba(179, 137, 56, 0.1)', transition: 'background 0.2s ease' }}>
                        <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold-dark)' }}>
                          {ord.orderNumber}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {ord.items?.length || 1} item(s) • {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text)' }}>
                          {formatCurrency(ord.totalAmount)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '4px',
                              background: badge.bg,
                              border: `1px solid ${badge.border}`,
                              color: badge.text,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'inline-block',
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <Link
                            href={`/portal/orders/${ord.id}/track`}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              background: 'var(--gold)',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            Manage <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Quick Floor Actions & Recent Operational Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Floor Shortcuts */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(179, 137, 56, 0.25)',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--text)', marginBottom: '12px', fontWeight: 600 }}>
              Operational Shortcuts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hasCapability('inventory:quick_update') && (
                <Link
                  href="/portal/quick-stock"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '6px',
                    background: 'rgba(179, 137, 56, 0.12)',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    color: 'var(--gold-dark)',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>⚡ Floor Stock Adjuster</span>
                  <ArrowRight size={14} />
                </Link>
              )}

              {hasCapability('orders:manage') && (
                <Link
                  href="/portal/orders"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '6px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.25)',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>📦 Full Dispatch & QC Vault</span>
                  <ArrowRight size={14} />
                </Link>
              )}

              <Link
                href="/portal/catalog"
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  background: '#FAF8F5',
                  border: '1px solid rgba(179, 137, 56, 0.25)',
                  color: 'var(--text)',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>👗 Saree Catalog Management</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/"
                target="_blank"
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px dashed rgba(179, 137, 56, 0.3)',
                  color: 'var(--text-dim)',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Storefront Preview</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>

          {/* Recent Audit Activities */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(179, 137, 56, 0.25)',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--text)', fontWeight: 600 }}>
                Operations Audit Feed
              </h3>
              <Link
                href="/portal/audit-logs"
                style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', fontWeight: 700, textDecoration: 'none' }}
              >
                All Logs →
              </Link>
            </div>

            {isLoading ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '16px' }}>
                Loading activity events...
              </div>
            ) : !stats?.operations.recentAuditLogs || stats.operations.recentAuditLogs.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '16px' }}>
                No recent audit entries logged.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.operations.recentAuditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '8px 10px',
                      background: '#FAF8F5',
                      border: '1px solid rgba(179, 137, 56, 0.15)',
                      borderRadius: '4px',
                      fontSize: '0.76rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--gold-dark)', fontFamily: 'monospace' }}>
                        {log.action}
                      </span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                        {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-dim)', marginTop: '2px' }}>
                      By {log.user?.name || 'System Administrator'} • {log.entityType}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
