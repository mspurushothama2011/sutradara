'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Order } from '@/shared/types/index';

export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [awbInput, setAwbInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isDispatching, setIsDispatching] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/orders');
      setOrders(res.orders || []);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // 1-Click Shiprocket Automated Dispatch
  const handleShiprocketDispatch = async (order: Order) => {
    setIsDispatching(order.id);
    try {
      const res = await apiRequest(`/orders/${order.id}/shiprocket-dispatch`, {
        method: 'POST',
      });
      alert(`✓ ${res.message || 'Shipment dispatched successfully!'}\nCourier: ${res.dispatch?.courierPartner}\nAWB: ${res.dispatch?.awbNumber}`);
      await loadOrders();
    } catch (e: any) {
      alert('Shiprocket Dispatch Notice: ' + (e.message || 'Failed to dispatch'));
    } finally {
      setIsDispatching(null);
    }
  };

  // Manual Milestone Update
  const handleUpdateDispatch = async (orderId: string, status: string) => {
    try {
      await apiRequest(`/orders/${orderId}/dispatch`, {
        method: 'PATCH',
        data: {
          status,
          awbNumber: awbInput || undefined,
          courierPartner: 'Bluedart Apex Air',
          inspectionVideoUrl: videoUrlInput || undefined,
        },
      });
      alert('✓ Order dispatch record updated successfully!');
      setSelectedOrder(null);
      setAwbInput('');
      setVideoUrlInput('');
      loadOrders();
    } catch (e: any) {
      alert(e.message || 'Dispatch update failed');
    }
  };

  const handleToggleNdr = async (order: Order) => {
    const nextState = !order.isNdrFlagged;
    const reason = nextState ? prompt('Enter NDR (Non-Delivery) exception reason:', 'Customer address inaccessible / Rescheduled') : null;
    if (nextState && !reason) return;

    try {
      await apiRequest(`/orders/${order.id}/dispatch`, {
        method: 'PATCH',
        data: { isNdrFlagged: nextState, ndrReason: reason },
      });
      alert(`✓ NDR status ${nextState ? 'FLAGGED' : 'CLEARED'}`);
      loadOrders();
    } catch (e: any) {
      alert(e.message || 'Failed to update NDR');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
            FULFILLMENT &amp; LOGISTICS VAULT
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginTop: '4px' }}>
            Orders &amp; Shiprocket Dispatch Queue
          </h1>
        </div>

        <button
          onClick={loadOrders}
          style={{
            padding: '10px 18px',
            background: '#FFFFFF',
            border: '1px solid rgba(179, 137, 56, 0.3)',
            borderRadius: '6px',
            color: 'var(--text)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(26, 19, 13, 0.04)',
          }}
        >
          🔄 Refresh Queue
        </button>
      </div>

      {/* Orders Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', overflowX: 'auto', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid rgba(179, 137, 56, 0.18)', color: 'var(--text)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
              <th style={{ padding: '14px 18px' }}>Order #</th>
              <th style={{ padding: '14px 18px' }}>Recipient &amp; Address</th>
              <th style={{ padding: '14px 18px' }}>Total Amount</th>
              <th style={{ padding: '14px 18px' }}>Status</th>
              <th style={{ padding: '14px 18px' }}>Courier &amp; AWB</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading orders queue...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>No orders found in queue.</td>
              </tr>
            ) : (
              orders.map((o: any) => {
                const shipping = (o.shippingAddress || {}) as any;
                const isDispatched = o.status === 'SHIPPED' || o.status === 'IN_TRANSIT' || o.status === 'DELIVERED';
                const isProcessingThis = isDispatching === o.id;

                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid rgba(179, 137, 56, 0.12)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 700 }}>
                      {o.orderNumber}
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text)' }}>
                      <strong style={{ color: 'var(--text)' }}>{o.customerName || shipping.recipientName || o.customer?.name || 'Valued Patron'}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {shipping.street ? `${shipping.street}, ${shipping.city}` : `${shipping.city || 'India'}, ${shipping.state || ''}`} - {shipping.pincode || ''}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        ✉️ {o.customerEmail || o.customer?.email || '—'} • 📞 {o.customerPhone || shipping.recipientPhone || o.customer?.phone || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text)', fontWeight: 700, fontSize: '0.92rem' }}>
                      ₹{o.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: o.status === 'DELIVERED'
                            ? 'rgba(34, 197, 94, 0.12)'
                            : o.status === 'SHIPPED'
                            ? 'rgba(59, 130, 246, 0.12)'
                            : 'rgba(179, 137, 56, 0.12)',
                          color: o.status === 'DELIVERED'
                            ? '#15803d'
                            : o.status === 'SHIPPED'
                            ? '#1d4ed8'
                            : 'var(--gold-dark, #8A6418)',
                        }}
                      >
                        {o.status}
                      </span>
                      {o.isNdrFlagged && (
                        <span style={{ display: 'block', marginTop: '4px', color: '#dc2626', fontSize: '0.7rem', fontWeight: 700 }}>
                          ⚠️ NDR EXCEPTION
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {o.awbNumber ? (
                        <div>
                          <span style={{ fontFamily: 'monospace', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 700 }}>
                            {o.awbNumber}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold-dark, #8A6418)', fontWeight: 600 }}>
                            {o.courierPartner || 'Air Express'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Pending AWB</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* 1-Click Shiprocket Dispatch */}
                        {!isDispatched && (
                          <button
                            onClick={() => handleShiprocketDispatch(o)}
                            disabled={isProcessingThis}
                            style={{
                              padding: '6px 12px',
                              background: 'var(--gold)',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: isProcessingThis ? 'wait' : 'pointer',
                              boxShadow: '0 2px 6px rgba(179, 137, 56, 0.3)',
                            }}
                          >
                            {isProcessingThis ? 'Booking...' : '🚀 Ship via Shiprocket'}
                          </button>
                        )}

                        {/* Dedicated Admin Logistics & Dispatch Console */}
                        <Link
                          href={`/portal/orders/${o.orderNumber}/track`}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(179, 137, 56, 0.12)',
                            border: '1px solid rgba(179, 137, 56, 0.3)',
                            borderRadius: '4px',
                            color: 'var(--gold-dark, #8A6418)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          ⚡ Dispatch Desk
                        </Link>

                        {/* Customer Live Tracking Link */}
                        <a
                          href={`/track/${o.orderNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '6px 12px',
                            background: 'var(--bg-deep)',
                            border: '1px solid rgba(179, 137, 56, 0.25)',
                            borderRadius: '4px',
                            color: 'var(--text)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                          title="Preview public customer tracking page"
                        >
                          Customer View ↗
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dispatch Desk Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26, 19, 13, 0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div style={{ width: '100%', maxWidth: '520px', background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.35)', borderRadius: '12px', padding: '28px', color: 'var(--text)', boxShadow: '0 20px 50px rgba(26, 19, 13, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(179, 137, 56, 0.18)', paddingBottom: '12px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text)' }}>
                Fulfillment Desk: {selectedOrder.orderNumber}
              </h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Air Waybill (AWB) #</label>
                <input
                  type="text"
                  placeholder="e.g. BD-778902144IN"
                  value={awbInput || selectedOrder.awbNumber || ''}
                  onChange={(e) => setAwbInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'monospace', fontWeight: 600, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>20s Inspection Video URL</label>
                <input
                  type="url"
                  placeholder="https://assets.sutradara.in/videos/inspection-001.mp4"
                  value={videoUrlInput || selectedOrder.inspectionVideoUrl || ''}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleUpdateDispatch(selectedOrder.id, 'SHIPPED')}
                  style={{ flex: 1, minWidth: '140px', padding: '12px', background: 'var(--gold)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(179, 137, 56, 0.3)' }}
                >
                  🚀 Confirm Shipped
                </button>
                <button
                  onClick={() => handleUpdateDispatch(selectedOrder.id, 'DELIVERED')}
                  style={{ flex: 1, minWidth: '140px', padding: '12px', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid #16a34a', borderRadius: '6px', color: '#15803d', fontWeight: 700, cursor: 'pointer' }}
                >
                  ✓ Mark Delivered
                </button>
              </div>

              <button
                onClick={() => handleToggleNdr(selectedOrder)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: selectedOrder.isNdrFlagged ? '#dc2626' : 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  color: selectedOrder.isNdrFlagged ? '#FFFFFF' : '#b91c1c',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '4px',
                }}
              >
                {selectedOrder.isNdrFlagged ? '⚠️ Clear NDR Exception' : '🚩 Flag NDR Non-Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
