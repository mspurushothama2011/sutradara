'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Order } from '@/shared/types/index';
import LandingNavbar from '@/components/customer/landing/LandingNavbar';
import { Truck, ShieldCheck, Video, MapPin, CheckCircle2, ArrowLeft, ArrowRight, Play } from 'lucide-react';

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
      } catch (e: any) {
        if (e?.status === 404) {
          // Expected 404 for deleted or non-existent order
          setOrder(null);
        } else {
          console.warn('Tracking lookup notice:', e?.message || e);
          setOrder(null);
        }
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
              style={{ padding: '12px 24px', background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.3)', color: 'var(--text)', borderRadius: '3px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} strokeWidth={1.5} /> Go Back
            </button>
            <Link href="/catalog" style={{ padding: '12px 24px', background: 'var(--gold)', color: '#ffffff', borderRadius: '3px', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Browse Curated Catalog <ArrowRight size={16} strokeWidth={1.5} />
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
                borderRadius: '3px',
                color: 'var(--gold)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeft size={14} strokeWidth={1.5} /> Back
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

          <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--gold)', background: '#FAF8F5', padding: '4px 10px', borderRadius: '3px', border: '1px solid rgba(179, 137, 56, 0.25)', fontWeight: 600 }}>
            Ref: {order.orderNumber}
          </span>
        </div>

        {/* Top Status Banner */}
        <div
          style={{
            background: '#FAF8F5',
            border: '1px solid rgba(179, 137, 56, 0.3)',
            borderRadius: '6px',
            padding: '24px 28px',
            marginBottom: '24px',
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
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {order.status === 'DELIVERED' ? (
                <>
                  <CheckCircle2 size={24} strokeWidth={1.75} color="#15803d" /> Successfully Delivered
                </>
              ) : order.status === 'OUT_FOR_DELIVERY' ? (
                <>
                  <Truck size={24} strokeWidth={1.75} color="var(--gold)" /> Out for Doorstep Delivery
                </>
              ) : order.status === 'IN_TRANSIT' ? (
                <>
                  <Truck size={24} strokeWidth={1.75} color="var(--gold)" /> In Transit via Air Cargo
                </>
              ) : order.status === 'SHIPPED' || order.status === 'DISPATCHED' ? (
                <>
                  <Truck size={24} strokeWidth={1.75} color="var(--gold)" /> Dispatched via Express Air
                </>
              ) : order.status === 'QC_INSPECTED' || order.status === 'PROCESSING' ? (
                <>
                  <ShieldCheck size={24} strokeWidth={1.75} color="var(--gold)" /> Master QC Inspection & Vault Packaging
                </>
              ) : order.status === 'PAID' ? (
                <>
                  <CheckCircle2 size={24} strokeWidth={1.75} color="#15803d" /> Order Confirmed & Vault Allocation
                </>
              ) : (
                <>
                  <ShieldCheck size={24} strokeWidth={1.75} color="var(--gold)" /> {String(order.status || '').replace(/_/g, ' ')}
                </>
              )}
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '6px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span>
                Courier Partner:{' '}
                <strong style={{ color: 'var(--text)' }}>
                  {order.courierPartner || (order.status === 'PAID' || order.status === 'PROCESSING' ? 'In-House Fulfillment (Express Priority)' : 'Express Priority Air')}
                </strong>
              </span>
              {order.awbNumber && (
                <>
                  <span>•</span>
                  <span>
                    Tracking #:{' '}
                    <strong style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {order.awbNumber}
                    </strong>
                  </span>
                </>
              )}
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginLeft: '6px',
                    padding: '3px 8px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '4px',
                    color: 'var(--gold-dark, #8A6418)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Courier Site ↗
                </a>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              background: '#ffffff',
              border: '1px solid rgba(179, 137, 56, 0.25)',
              borderRadius: '6px',
            }}
          >
            <ShieldCheck size={24} strokeWidth={1.5} color="var(--gold)" />
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

        {/* Visual Multi-Step Milestone Progress Bar */}
        {(() => {
          const stages = [
            { key: 'CONFIRMED', label: 'Order Placed', statuses: ['PAID', 'PROCESSING', 'QC_INSPECTED', 'SHIPPED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
            { key: 'PACKED', label: 'Inspected & Packed', statuses: ['PROCESSING', 'QC_INSPECTED', 'SHIPPED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
            { key: 'DISPATCHED', label: 'Dispatched', statuses: ['SHIPPED', 'DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
            { key: 'IN_TRANSIT', label: 'In Transit', statuses: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'] },
            { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', statuses: ['OUT_FOR_DELIVERY', 'DELIVERED'] },
            { key: 'DELIVERED', label: 'Delivered', statuses: ['DELIVERED'] },
          ];

          const currentStatus = order.status || 'PAID';
          const currentStageIndex = stages.reduce((acc, s, idx) => (s.statuses.includes(currentStatus) ? idx : acc), 0);

          return (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(179, 137, 56, 0.22)',
                borderRadius: '6px',
                padding: '24px 20px',
                marginBottom: '32px',
                boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
                overflowX: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '560px', position: 'relative' }}>
                {stages.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div
                      key={stage.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        flex: 1,
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      {/* Connecting Line */}
                      {idx > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '50%',
                            left: '-50%',
                            height: '3px',
                            background: idx <= currentStageIndex ? 'var(--gold)' : 'rgba(179, 137, 56, 0.2)',
                            zIndex: -1,
                            transition: 'background 0.3s ease',
                          }}
                        />
                      )}

                      {/* Step Circle */}
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: isCompleted ? (isCurrent && currentStatus === 'DELIVERED' ? '#15803d' : 'var(--gold)') : '#FFFFFF',
                          border: isCompleted ? 'none' : '2px solid rgba(179, 137, 56, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isCompleted ? '#FFFFFF' : 'var(--text-dim)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(179, 137, 56, 0.25)' : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>

                      {/* Step Label */}
                      <span
                        style={{
                          marginTop: '8px',
                          fontSize: '0.75rem',
                          fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                          color: isCurrent ? 'var(--gold-dark, #8A6418)' : isCompleted ? 'var(--text)' : 'var(--text-dim)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* 2-Column: Left = Items & Recipient, Right = Timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Left Column: Saree & Delivery Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Saree Item Card */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '3px', padding: '20px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
              <h3 style={{ fontSize: '0.88rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', fontWeight: 700 }}>
                Acquired Pieces ({order.items?.length || 1})
              </h3>
              {order.items?.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img
                    src={item.image || item.product?.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                    alt={item.productName || item.product?.name}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '3px', border: '1px solid rgba(179, 137, 56, 0.2)' }}
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
            <div style={{ background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '3px', padding: '20px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
              <h3 style={{ fontSize: '0.88rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 700 }}>
                Delivery Destination
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 600 }}>
                {(order.shippingAddress as any)?.recipientName || (order.shippingAddress as any)?.fullName || 'Valued Patron'}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {(order.shippingAddress as any)?.street}, {(order.shippingAddress as any)?.city}, {(order.shippingAddress as any)?.state} (PIN: {(order.shippingAddress as any)?.pincode})
              </p>
            </div>
          </div>

          {/* Right Column: Live Milestone Timeline */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '3px', padding: '24px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
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

              {((order.trackingEvents || (order as any).trackingHistory || []) as any[])
                .filter((evt: any) => evt.status !== 'QC_INSPECTED')
                .map((evt: any, idx: number) => {
                  const statusLabel =
                    evt.status === 'PAID'
                      ? 'ORDER CONFIRMED'
                      : evt.status === 'SHIPPED'
                      ? 'DISPATCHED VIA AIR EXPRESS'
                      : evt.status === 'IN_TRANSIT'
                      ? 'IN TRANSIT'
                      : evt.status === 'OUT_FOR_DELIVERY'
                      ? 'OUT FOR DELIVERY'
                      : evt.status === 'DELIVERED'
                      ? 'DELIVERED'
                      : String(evt.status || '').replace(/_/g, ' ');

                  return (
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
                            {statusLabel}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            {evt.timestamp ? `${new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${new Date(evt.timestamp).toLocaleDateString()}` : 'Just Now'}
                          </span>
                        </div>
                        {evt.location && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 600 }}>
                            <MapPin size={12} strokeWidth={1.5} /> {evt.location}
                          </span>
                        )}
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.4 }}>
                          {evt.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
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
              borderRadius: '3px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              boxShadow: '0 4px 14px rgba(179, 137, 56, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Explore More Master Weaves <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
          <Link
            href="/account/orders"
            style={{
              padding: '12px 24px',
              background: '#ffffff',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              color: 'var(--gold)',
              borderRadius: '3px',
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
