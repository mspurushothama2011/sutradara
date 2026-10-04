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

  // Form states
  const [statusInput, setStatusInput] = useState('SHIPPED');
  const [locationInput, setLocationInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [awbInput, setAwbInput] = useState('');
  const [courierInput, setCourierInput] = useState('Bluedart Apex Air');
  const [trackingUrlInput, setTrackingUrlInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');

  const COURIER_OPTIONS = [
    'Bluedart Apex Air',
    'Delhivery Express',
    'DTDC Express',
    'Speed Post (India Post)',
    'The Professional Couriers',
    'Shadowfax Air',
    'Xpressbees Logistics',
    'In-House White-Glove Handover',
  ];

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest(`/orders/track/${orderId}`);
      if (res.order) {
        setOrder(res.order);
        setStatusInput(res.order.status || 'SHIPPED');
        setAwbInput(res.order.awbNumber || '');
        setCourierInput(res.order.courierPartner || 'Bluedart Apex Air');
        setTrackingUrlInput(res.order.trackingUrl || '');
        setVideoUrlInput(res.order.inspectionVideoUrl || '');
      }
    } catch (e: any) {
      if (e?.status === 404) {
        setOrder(null);
      } else if (e?.status !== 401) {
        console.warn('Failed to load order tracking details:', e?.message || e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

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
          trackingUrl: trackingUrlInput || undefined,
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
        <p style={{ letterSpacing: '0.2em' }}>FETCHING WAREHOUSE & DISPATCH TELEMETRY...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Order Not Found</h2>
        <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>Could not locate tracking record for #{orderId}</p>
        <Link
          href="/portal/orders"
          style={{ display: 'inline-block', marginTop: '16px', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}
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
        <span style={{ color: 'var(--gold-dark, #8A6418)', fontWeight: 600 }}>Dispatch Telemetry: {order.orderNumber}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', margin: 0 }}>
              Order Dispatch Desk: {order.orderNumber}
            </h1>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: order.status === 'DELIVERED' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(179, 137, 56, 0.12)',
                color: order.status === 'DELIVERED' ? '#15803d' : 'var(--gold-dark, #8A6418)',
                border: '1px solid rgba(179, 137, 56, 0.25)',
              }}
            >
              {order.status}
            </span>
            {order.isNdrFlagged && (
              <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem', background: '#dc2626', color: '#FFFFFF', fontWeight: 700 }}>
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
              background: '#FFFFFF',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(26, 19, 13, 0.03)',
            }}
          >
            <span>Customer View ↗</span>
          </a>

          <button
            onClick={handleToggleNdr}
            style={{
              padding: '10px 16px',
              background: order.isNdrFlagged ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.1)',
              border: order.isNdrFlagged ? '1px solid #16a34a' : '1px solid #ef4444',
              borderRadius: '6px',
              color: order.isNdrFlagged ? '#15803d' : '#b91c1c',
              fontSize: '0.82rem',
              fontWeight: 700,
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
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              IMMUTABLE CUSTOMER SNAPSHOT
            </span>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.05rem' }}>
                {order.customerName || shipping.recipientName || 'Valued Patron'}
              </p>
              <p style={{ color: 'var(--text-dim)' }}>
                <strong style={{ color: 'var(--text)' }}>Email:</strong> {order.customerEmail || 'N/A'}
              </p>
              <p style={{ color: 'var(--text-dim)' }}>
                <strong style={{ color: 'var(--text)' }}>Phone:</strong> {order.customerPhone || shipping.recipientPhone || 'N/A'}
              </p>
              <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(179, 137, 56, 0.15)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--gold-dark, #8A6418)', fontWeight: 600 }}>Shipping Destination:</span>
                <p style={{ color: 'var(--text)', fontSize: '0.86rem', marginTop: '2px', lineHeight: 1.4 }}>
                  {shipping.recipientName && <strong>{shipping.recipientName} • </strong>}
                  {shipping.street}, {shipping.city}, {shipping.state} - <strong>{shipping.pincode}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Verification & Handover Credentials */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              VERIFICATION & EVIDENCE
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(179, 137, 56, 0.08)', borderRadius: '8px', border: '1px solid rgba(179, 137, 56, 0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--gold-dark, #8A6418)', textTransform: 'uppercase', fontWeight: 600 }}>Handover Protocol</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginTop: '6px' }}>
                  Direct Signature
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-deep)', borderRadius: '8px', border: '1px solid rgba(179, 137, 56, 0.15)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Items in Trunk</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                  {order.items?.length || 1} Piece(s)
                </div>
              </div>
            </div>

            {/* Inspection Video Clip */}
            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--gold-dark, #8A6418)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                📹 Pre-Shipment Sealing Video:
              </span>
              {order.inspectionVideoUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a
                    href={order.inspectionVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#2563eb', fontSize: '0.82rem', textDecoration: 'underline', wordBreak: 'break-all', fontWeight: 600 }}
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
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              ACQUIRED PIECES (₹{order.totalAmount.toLocaleString('en-IN')})
            </span>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img
                    src={item.product?.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                    alt={item.product?.name || 'Saree'}
                    style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(179, 137, 56, 0.25)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--text)', fontSize: '0.88rem', fontWeight: 700 }}>{item.product?.name || 'Silk Handloom'}</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      SKU: <span style={{ fontFamily: 'monospace', color: 'var(--gold-dark, #8A6418)', fontWeight: 600 }}>{item.product?.sku}</span> • ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
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
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text)', marginBottom: '18px' }}>
              Update Logistics & Milestone Telemetry
            </h2>

            <form onSubmit={handleUpdateMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#FAF8F5',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      borderRadius: '6px',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    <option value="PAID">PAID (Order Placed)</option>
                    <option value="PROCESSING">PROCESSING (Inspected & Packed)</option>
                    <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                    <option value="IN_TRANSIT">IN_TRANSIT (In Transit)</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Out for Delivery)</option>
                    <option value="DELIVERED">DELIVERED (Delivered to Patron)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                    Courier Partner
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <select
                      value={COURIER_OPTIONS.includes(courierInput) ? courierInput : 'Other'}
                      onChange={(e) => {
                        if (e.target.value !== 'Other') {
                          setCourierInput(e.target.value);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#FAF8F5',
                        border: '1px solid rgba(179, 137, 56, 0.3)',
                        borderRadius: '6px',
                        color: 'var(--text)',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    >
                      {COURIER_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="Other">Other / Custom</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Courier Name"
                      value={courierInput}
                      onChange={(e) => setCourierInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#FAF8F5',
                        border: '1px solid rgba(179, 137, 56, 0.25)',
                        borderRadius: '6px',
                        color: 'var(--text)',
                        fontSize: '0.82rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                    AWB Tracking #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BD-89102481IN or DTDC12345"
                    value={awbInput}
                    onChange={(e) => setAwbInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#FAF8F5',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      borderRadius: '6px',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                    Location (City / Hub)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Varanasi Loom Vault or Delhi Hub"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#FAF8F5',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      borderRadius: '6px',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                  External Courier Tracking Web Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://www.delhivery.com/track/package/..."
                  value={trackingUrlInput}
                  onChange={(e) => setTrackingUrlInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                  Milestone Progress Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saree packed in velvet trunk and handed over for express air transit."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                  Packing Evidence Video Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.85rem',
                    outline: 'none',
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
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: isUpdating ? 'wait' : 'pointer',
                  boxShadow: '0 2px 8px rgba(179, 137, 56, 0.35)',
                }}
              >
                {isUpdating ? 'Saving Update...' : '✓ Commit Milestone & Update Customer Tracker'}
              </button>
            </form>
          </div>

          {/* Live Milestone Timeline */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--text)', marginBottom: '20px' }}>
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
                      background: idx === 0 ? 'var(--gold)' : 'rgba(179, 137, 56, 0.3)',
                      marginTop: '4px',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{event.status}</strong>
                      {event.location && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--gold-dark, #8A6418)', fontWeight: 600 }}>📍 {event.location}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {event.message}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
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
