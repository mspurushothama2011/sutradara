'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Order } from '@/shared/types/index';
import LandingNavbar from '@/components/customer/landing/LandingNavbar';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    async function loadTracking() {
      try {
        setIsLoading(true);
        const res = await apiRequest(`/orders/track/${orderId}`);
        setOrder(res.order || null);
      } catch (e) {
        console.error('Failed to load tracking:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadTracking();
  }, [orderId]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
        <p style={{ letterSpacing: '0.2em' }}>FETCHING SECURE SATELLITE TRACKING...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <LandingNavbar />
        <div style={{ paddingTop: '140px', textAlign: 'center', paddingLeft: '24px', paddingRight: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)' }}>Order Not Found</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Please verify your Order Reference ID or AWB Tracking Number.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
            <button
              onClick={() => router.back()}
              style={{ padding: '12px 24px', background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.3)', color: 'var(--text)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              ← Go Back
            </button>
            <Link href="/catalog" style={{ padding: '12px 24px', background: 'var(--gold)', color: '#ffffff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
              Browse Curated Catalog →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      <main style={{ maxWidth: '1080px', margin: '0 auto', paddingTop: '120px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
        {/* Navigation & Breadcrumbs Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => router.back()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#ffffff',
                border: '1px solid rgba(179, 137, 56, 0.3)',
                borderRadius: '6px',
                color: 'var(--gold)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              ← Back
            </button>
            <Link
              href="/catalog"
              style={{
                color: 'var(--text-dim)',
                textDecoration: 'none',
                fontSize: '0.82rem',
              }}
            >
              Curated Catalog
            </Link>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>/</span>
            <Link
              href="/account/orders"
              style={{
                color: 'var(--text-dim)',
                textDecoration: 'none',
                fontSize: '0.82rem',
              }}
            >
              My Acquisitions
            </Link>
          </div>

          <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--gold)', background: '#FAF8F5', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(179, 137, 56, 0.25)', fontWeight: 600 }}>
            Ref: {order.orderNumber}
          </span>
        </div>

        {/* Top Status Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F4EFEA 0%, #FAF8F5 100%)',
            border: '1px solid rgba(179, 137, 56, 0.3)',
            borderRadius: '12px',
            padding: '24px 28px',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
              CURRENT SHIPMENT STATUS
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text)', marginTop: '4px' }}>
              {order.status === 'SHIPPED'
                ? `🚚 In Transit (${order.courierPartner || 'Express Air'})`
                : order.status === 'PAID'
                ? '✓ Order Confirmed & Vault Allocation'
                : order.status === 'DELIVERED'
                ? '✓ Successfully Delivered'
                : order.status}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Courier Partner: <strong style={{ color: 'var(--text)' }}>{order.courierPartner || 'Express Priority Air'}</strong>
              {order.awbNumber && (
                <>
                  {' '}• AWB: <strong style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>{order.awbNumber}</strong>
                </>
              )}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              background: '#ffffff',
              border: '1px solid rgba(179, 137, 56, 0.25)',
              borderRadius: '8px',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🛡️</span>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                Insured Express Shipment
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Direct white-glove doorstep delivery
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column: Left = Video QC & Items, Right = Timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Left Column: Saree & Pre-Shipment Inspection Video */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Pre-Shipment 20s Inspection Video Card */}
            {order.inspectionVideoUrl && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(179, 137, 56, 0.25)',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>📹</span>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', color: 'var(--gold)', fontWeight: 700 }}>
                      Pre-Shipment 20s Inspection Log
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Recorded before packaging in sealed heritage trunk
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setShowVideoModal(true)}
                  style={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    background: '#F4EFEA',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(179, 137, 56, 0.2)',
                  }}
                >
                  <img
                    src={order.items?.[0]?.image || '/frames/ezgif-frame-240.jpg'}
                    alt="video thumbnail"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(179, 137, 56, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    ▶
                  </div>
                </div>
              </div>
            )}

            {/* Saree Item Card */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
              <h3 style={{ fontSize: '0.88rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', fontWeight: 700 }}>
                Acquired Pieces ({order.items?.length || 1})
              </h3>
              {order.items?.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img
                    src={item.image || item.product?.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                    alt={item.productName || item.product?.name}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(179, 137, 56, 0.2)' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.92rem', color: 'var(--text)' }}>{item.productName || item.product?.name}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--gold)', marginTop: '4px', fontWeight: 700 }}>
                      ₹{item.price.toLocaleString('en-IN')} (Qty: {item.quantity})
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Recipient Box */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
              <h3 style={{ fontSize: '0.88rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 700 }}>
                Delivery Destination
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 600 }}>
                {(order.shippingAddress as any)?.recipientName || (order.shippingAddress as any)?.fullName || 'Valued Patron'}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {(order.shippingAddress as any)?.street}, {(order.shippingAddress as any)?.city}, {(order.shippingAddress as any)?.state} - <strong>{(order.shippingAddress as any)?.pincode}</strong>
              </p>
            </div>
          </div>

          {/* Right Column: Live Milestone Timeline */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '10px', padding: '24px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: '20px' }}>
              Live Delivery Milestones
            </h3>

            <div style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Timeline Vertical Bar */}
              <div
                style={{
                  position: 'absolute',
                  left: '6px',
                  top: '8px',
                  bottom: '8px',
                  width: '2px',
                  background: 'rgba(179, 137, 56, 0.25)',
                }}
              />

              {((order.trackingEvents || (order as any).trackingHistory || []) as any[]).map((evt: any, idx: number) => (
                <div key={evt.id || idx} style={{ position: 'relative' }}>
                  {/* Timeline Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-24px',
                      top: '4px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#15803d' : 'var(--gold)',
                      border: '3px solid #ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: idx === 0 ? '#15803d' : 'var(--text)' }}>
                        {String(evt.status || '').replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {evt.timestamp ? `${new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${new Date(evt.timestamp).toLocaleDateString()}` : 'Just Now'}
                      </span>
                    </div>
                    {evt.location && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold)', display: 'block', marginTop: '2px', fontWeight: 600 }}>
                        📍 {evt.location}
                      </span>
                    )}
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.4 }}>
                      {evt.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Quick Return Links */}
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            href="/catalog"
            style={{
              padding: '12px 24px',
              background: 'var(--gold)',
              color: '#ffffff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              boxShadow: '0 4px 14px rgba(179, 137, 56, 0.25)',
            }}
          >
            Explore More Master Weaves →
          </Link>
          <Link
            href="/account/orders"
            style={{
              padding: '12px 24px',
              background: '#ffffff',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              color: 'var(--gold)',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
            }}
          >
            View All My Orders
          </Link>
        </div>
      </main>
    </div>
  );
}
