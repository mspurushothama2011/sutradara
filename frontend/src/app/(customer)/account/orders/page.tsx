'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Order } from '@/shared/types/index';
import LandingNavbar from '@/components/customer/landing/LandingNavbar';
import Footer from '@/components/shared/ui/Footer';
import { Truck, ArrowLeft, ArrowRight, Package } from 'lucide-react';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/customer/orders/my-orders');
      setOrders(res.orders || []);
    } catch (e: any) {
      if (e?.status !== 401) {
        console.warn('Customer orders notice:', e?.message || e);
      }
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      <div style={{ paddingTop: '120px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(179, 137, 56, 0.2)', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
              ACQUISITION HISTORY
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--text)', marginTop: '4px' }}>
              Your Handloom Orders
            </h1>
          </div>
          <Link href="/account" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={14} strokeWidth={1.5} /> Back to Account Sanctuary
          </Link>
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>Loading your acquisitions...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', background: '#ffffff', borderRadius: '3px', border: '1px solid rgba(179, 137, 56, 0.25)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--gold)' }}>
              <Package size={36} strokeWidth={1.25} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)' }}>No Acquisitions Found</h2>
            <p style={{ color: 'var(--text-dim)', marginTop: '8px', fontSize: '0.9rem' }}>You have not acquired any authentic handloom sarees yet.</p>
            <Link
              href="/catalog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '20px',
                padding: '12px 28px',
                background: 'var(--gold)',
                color: '#ffffff',
                borderRadius: '3px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                boxShadow: '0 4px 14px rgba(179, 137, 56, 0.25)',
              }}
            >
              Explore Master Weaves <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(179, 137, 56, 0.22)',
                  borderRadius: '3px',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: '0 4px 16px rgba(26, 19, 13, 0.05)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--gold)', fontSize: '1rem', fontFamily: 'monospace', fontWeight: 700 }}>
                      {ord.orderNumber}
                    </strong>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        background: 'rgba(20, 90, 82, 0.12)',
                        color: '#145a52',
                        borderRadius: '3px',
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
                    Items: {ord.items?.length || 1} Piece(s) • Total: <strong style={{ color: 'var(--text)' }}>₹{ord.totalAmount?.toLocaleString('en-IN')}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Link
                    href={`/track/${ord.orderNumber}`}
                    style={{
                      padding: '10px 18px',
                      background: 'var(--gold)',
                      color: '#ffffff',
                      borderRadius: '3px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      boxShadow: '0 4px 12px rgba(179, 137, 56, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Truck size={14} strokeWidth={1.5} /> Track Live Delivery
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
