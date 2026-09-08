'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Order } from '@/shared/types/index';

export default function AdminOrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  // Form states
  const [statusInput, setStatusInput] = useState('SHIPPED');
  const [locationInput, setLocationInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [awbInput, setAwbInput] = useState('');
  const [courierInput, setCourierInput] = useState('Bluedart Apex Air');
  const [videoUrlInput, setVideoUrlInput] = useState('');

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest(`/orders/track/${orderId}`);
      if (res.order) {
        setOrder(res.order);
        setStatusInput(res.order.status || 'SHIPPED');
        setAwbInput(res.order.awbNumber || '');
        setCourierInput(res.order.courierPartner || 'Bluedart Apex Air');
        setVideoUrlInput(res.order.inspectionVideoUrl || '');
      }
    } catch (e) {
      console.error('Failed to load order tracking details:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // 1-Click Shiprocket Automated Booking
  const handleShiprocketDispatch = async () => {
    if (!order) return;
    setIsDispatching(true);
    try {
      const res = await apiRequest(`/orders/${order.id}/shiprocket-dispatch`, {
        method: 'POST',
      });
      alert(`✓ ${res.message || 'Shipment dispatched successfully!'}\nCourier: ${res.dispatch?.courierPartner}\nAWB: ${res.dispatch?.awbNumber}`);
      await loadOrder();
    } catch (e: any) {
      alert('Shiprocket Dispatch Notice: ' + (e.message || 'Failed to dispatch'));
    } finally {
      setIsDispatching(false);
    }
  };

  // Milestone Progress Update
  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsUpdating(true);

    try {
      await apiRequest(`/orders/${order.id}/dispatch`, {
        method: 'PATCH',
        data: {
          status: statusInput,
          location: locationInput || undefined,
          message: messageInput || undefined,
          awbNumber: awbInput || undefined,
          courierPartner: courierInput || undefined,
          inspectionVideoUrl: videoUrlInput || undefined,
        },
      });

      alert('✓ Order logistics status and milestone updated successfully!');
      setLocationInput('');
      setMessageInput('');
      await loadOrder();
    } catch (e: any) {
      alert(e.message || 'Failed to update dispatch record');
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle NDR
  const handleToggleNdr = async () => {
    if (!order) return;
    const nextState = !order.isNdrFlagged;
    const reason = nextState ? prompt('Enter NDR (Non-Delivery) exception reason:', 'Customer address inaccessible / Rescheduled') : null;
    if (nextState && !reason) return;

    try {
      await apiRequest(`/orders/${order.id}/dispatch`, {
        method: 'PATCH',
        data: { isNdrFlagged: nextState, ndrReason: reason },
      });
      alert(`✓ NDR status ${nextState ? 'FLAGGED' : 'CLEARED'}`);
      await loadOrder();
    } catch (e: any) {
      alert(e.message || 'Failed to update NDR');
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gold)' }}>
        <p style={{ letterSpacing: '0.2em' }}>FETCHING WAREHOUSE &amp; DISPATCH TELEMETRY...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff' }}>Order Not Found</h2>
        <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Could not locate tracking record for #{orderId}</p>
        <Link
          href="/portal/orders"
          style={{ display: 'inline-block', marginTop: '16px', color: 'var(--gold)', textDecoration: 'none' }}
        >
          ← Back to Orders Queue
        </Link>
      </div>
    );
  }

  const shipping = (order.shippingAddress || {}) as any;
  const isDispatched = order.status === 'SHIPPED' || order.status === 'DELIVERED';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
        <Link href="/portal/dashboard" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Portal</Link>
        <span>/</span>
        <Link href="/portal/orders" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Orders Queue</Link>
        <span>/</span>
        <span style={{ color: 'var(--gold)' }}>Dispatch Telemetry: {order.orderNumber}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', margin: 0 }}>
              Order Dispatch Desk: {order.orderNumber}
            </h1>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: order.status === 'DELIVERED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(201, 168, 76, 0.2)',
                color: order.status === 'DELIVERED' ? '#4ade80' : 'var(--gold)',
                border: '1px solid rgba(201, 168, 76, 0.3)',
              }}
            >
              {order.status}
            </span>
            {order.isNdrFlagged && (
              <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem', background: '#dc2626', color: '#fff', fontWeight: 700 }}>
                ⚠️ NDR FLAGGED
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '4px' }}>
            Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href={`/track/${order.orderNumber}`}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '10px 18px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.82rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Customer View ↗</span>
          </a>

          {!isDispatched && (
            <button
              onClick={handleShiprocketDispatch}
              disabled={isDispatching}
              style={{
                padding: '10px 20px',
                background: 'var(--gold)',
                border: 'none',
                borderRadius: '6px',
                color: '#110c08',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: isDispatching ? 'wait' : 'pointer',
              }}
            >
              {isDispatching ? 'Booking...' : '🚀 1-Click Shiprocket Dispatch'}
            </button>
          )}

          <button
            onClick={handleToggleNdr}
            style={{
              padding: '10px 16px',
              background: order.isNdrFlagged ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: order.isNdrFlagged ? '1px solid #22c55e' : '1px solid #ef4444',
              borderRadius: '6px',
              color: order.isNdrFlagged ? '#4ade80' : '#f87171',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {order.isNdrFlagged ? '✓ Clear NDR Flag' : '⚠️ Flag NDR Exception'}
          </button>
        </div>
      </div>

      {/* Grid: Left Column (Snapshot & Courier) vs Right Column (Milestone Updater & Timeline) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '28px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Customer Snapshot & Logistics Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Customer Snapshot Card */}
          <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              IMMUTABLE CUSTOMER SNAPSHOT
            </span>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '1.05rem' }}>
                {order.customerName || shipping.recipientName || 'Valued Patron'}
              </p>
              <p style={{ color: 'var(--text-dim)' }}>
                ✉️ <strong>Email:</strong> {order.customerEmail || '—'}
              </p>
              <p style={{ color: 'var(--text-dim)' }}>
                📞 <strong>Phone:</strong> {order.customerPhone || shipping.recipientPhone || '—'}
              </p>
              <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>📍 Shipping Destination:</span>
                <p style={{ color: '#e0d8cc', fontSize: '0.84rem', marginTop: '2px', lineHeight: 1.4 }}>
                  {shipping.recipientName && <strong>{shipping.recipientName} • </strong>}
                  {shipping.street}, {shipping.city}, {shipping.state} - <strong>{shipping.pincode}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Verification & Handover Credentials */}
          <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(201, 168, 76, 0.25)', borderRadius: '12px', padding: '24px' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              VERIFICATION &amp; EVIDENCE
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(201, 168, 76, 0.08)', borderRadius: '8px', border: '1px solid rgba(201, 168, 76, 0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase' }}>4-Digit Drop OTP</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '4px', marginTop: '4px' }}>
                  {order.deliveryOtp || '3836'}
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Items in Trunk</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                  {order.items?.length || 1} Piece(s)
                </div>
              </div>
            </div>

            {/* Inspection Video Clip */}
            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>
                📹 Pre-Shipment Sealing Video:
              </span>
              {order.inspectionVideoUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a
                    href={order.inspectionVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#60a5fa', fontSize: '0.82rem', textDecoration: 'underline', wordBreak: 'break-all' }}
                  >
                    {order.inspectionVideoUrl}
                  </a>
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No video footage attached yet.</p>
              )}
            </div>
          </div>

          {/* Order Items List */}
          <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              ACQUIRED PIECES (₹{order.totalAmount.toLocaleString('en-IN')})
            </span>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img
                    src={item.product?.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                    alt={item.product?.name || 'Saree'}
                    style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#fff', fontSize: '0.86rem', fontWeight: 600 }}>{item.product?.name || 'Silk Handloom'}</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      SKU: {item.product?.sku} • ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Milestone Updater & Interactive Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Dispatch & Milestone Management Form */}
          <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(201, 168, 76, 0.25)', borderRadius: '12px', padding: '28px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--gold)', marginBottom: '18px' }}>
              Update Logistics &amp; Milestone Telemetry
            </h2>

            <form onSubmit={handleUpdateMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="PAID">PAID (Order Placed)</option>
                    <option value="PROCESSING">PROCESSING (Under Inspection)</option>
                    <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                    <option value="IN_TRANSIT">IN_TRANSIT (In Flight/Hub)</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                    <option value="DELIVERED">DELIVERED (Handover Complete)</option>
                    <option value="RETURNED">RETURNED</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courierInput}
                    onChange={(e) => setCourierInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    AWB Airway Bill Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BD-89102481IN"
                    value={awbInput}
                    onChange={(e) => setAwbInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    Location (Hub / Vault)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Varanasi Loom Vault or Delhi Air Hub"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Milestone Progress Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Package cleared X-Ray inspection and boarded Air Express Cargo."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Packing Evidence Video Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://storage.sutradara.in/videos/inspection_102.mp4"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                style={{
                  marginTop: '6px',
                  padding: '12px',
                  background: 'var(--gold)',
                  color: '#110c08',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: isUpdating ? 'wait' : 'pointer',
                }}
              >
                {isUpdating ? 'Saving Update...' : 'Commit Milestone &amp; Notify Patron'}
              </button>
            </form>
          </div>

          {/* Live Milestone Timeline */}
          <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#fff', marginBottom: '20px' }}>
              Milestone Audit Trail
            </h3>

            {/* Timeline Events */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
              {(order.trackingEvents && order.trackingEvents.length > 0
                ? order.trackingEvents
                : ((order as any).trackingHistory as any[]) || []
              ).map((event: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: idx === 0 ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
                      marginTop: '4px',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{event.status}</strong>
                      {event.location && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>📍 {event.location}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {event.message}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px', display: 'block' }}>
                      {event.timestamp ? new Date(event.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
