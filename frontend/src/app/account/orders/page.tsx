'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Order } from '../../../../../shared/types/index';

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
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
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              Explore Saree Catalog →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(201, 168, 76, 0.2)',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontFamily: 'monospace' }}>
                      {order.orderNumber}
                    </span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Acquired on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: order.status === 'SHIPPED' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(201, 168, 76, 0.15)',
                        border: `1px solid ${order.status === 'SHIPPED' ? '#4ade80' : 'var(--gold)'}`,
                        color: order.status === 'SHIPPED' ? '#4ade80' : 'var(--gold)',
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img
                        src={item.image || '/frames/ezgif-frame-240.jpg'}
                        alt={item.productName || 'Saree'}
                        style={{ width: '64px', height: '64px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{item.productName}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Qty: {item.quantity} • ₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer with tracking button */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    Total Amount: <strong style={{ color: '#fff', fontSize: '1.1rem' }}>₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                  </div>

                  <Link
                    href={`/track/${order.orderNumber || order.id}`}
                    style={{
                      padding: '8px 18px',
                      background: 'var(--gold)',
                      color: '#110c08',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Track Delivery & OTP →
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
