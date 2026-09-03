'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Order } from '../../../../../shared/types/index';
import LandingNavbar from '@/components/landing/LandingNavbar';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/customer/orders/my-orders');
      setOrders(res.orders || []);
    } catch (e) {
      console.error('Failed to load customer orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      <div style={{ paddingTop: '120px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>
              ACQUISITION HISTORY
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff', marginTop: '4px' }}>
              Your Handloom Orders
            </h1>
          </div>
          <Link href="/account" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '0.85rem' }}>
            ← Back to Account Sanctuary
          </Link>
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>Loading your acquisitions...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-deep)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff' }}>No Acquisitions Found</h2>
            <p style={{ color: 'var(--text-dim)', marginTop: '8px', fontSize: '0.9rem' }}>You have not acquired any authentic handloom sarees yet.</p>
            <Link
              href="/catalog"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '12px 28px',
                background: 'var(--gold)',
                color: '#110c08',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              Explore Master Weaves →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(201, 168, 76, 0.2)',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--gold)', fontSize: '1rem', fontFamily: 'monospace' }}>
                      {ord.orderNumber}
                    </strong>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        background: 'rgba(74, 222, 128, 0.15)',
                        color: '#4ade80',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    Placed on: {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Items: {ord.items?.length || 1} Piece(s) • Total: <strong style={{ color: '#fff' }}>₹{ord.totalAmount?.toLocaleString('en-IN')}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {ord.deliveryOtp && (
                    <div style={{ padding: '6px 12px', background: 'rgba(201, 168, 76, 0.1)', border: '1px dashed var(--gold)', borderRadius: '6px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'block' }}>Drop OTP</span>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--gold)', letterSpacing: '0.15em' }}>{ord.deliveryOtp}</strong>
                    </div>
                  )}
                  <Link
                    href={`/track/${ord.orderNumber}`}
                    style={{
                      padding: '10px 18px',
                      background: 'var(--gold)',
                      color: '#110c08',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                    }}
                  >
                    Track Live Delivery 🚚
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
