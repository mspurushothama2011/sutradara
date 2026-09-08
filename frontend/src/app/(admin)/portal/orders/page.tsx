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
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            FULFILLMENT &amp; LOGISTICS VAULT
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>
            Orders &amp; Shiprocket Dispatch Queue
          </h1>
        </div>

        <button
          onClick={loadOrders}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          🔄 Refresh Queue
        </button>
      </div>

      {/* Orders Table */}
      <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--gold)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
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
                  <tr key={o.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 600 }}>
                      {o.orderNumber}
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#fff' }}>
                      <strong>{o.customerName || shipping.recipientName || o.customer?.name || 'Valued Patron'}</strong>
                      <span style={{ display: 'block', fontSize: '0.73rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {shipping.street ? `${shipping.street}, ${shipping.city}` : `${shipping.city || 'India'}, ${shipping.state || ''}`} - {shipping.pincode || ''}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        ✉️ {o.customerEmail || o.customer?.email || '—'} • 📞 {o.customerPhone || shipping.recipientPhone || o.customer?.phone || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#fff', fontWeight: 600 }}>
                      ₹{o.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: o.status === 'DELIVERED'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : o.status === 'SHIPPED'
                            ? 'rgba(59, 130, 246, 0.2)'
                            : 'rgba(201, 168, 76, 0.2)',
                          color: o.status === 'DELIVERED'
                            ? '#4ade80'
                            : o.status === 'SHIPPED'
                            ? '#60a5fa'
                            : 'var(--gold)',
                        }}
                      >
                        {o.status}
                      </span>
                      {o.isNdrFlagged && (
                        <span style={{ display: 'block', marginTop: '4px', color: '#f87171', fontSize: '0.68rem', fontWeight: 700 }}>
                          ⚠️ NDR EXCEPTION
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {o.awbNumber ? (
                        <div>
                          <span style={{ fontFamily: 'monospace', color: '#fff', fontSize: '0.78rem', fontWeight: 600 }}>
                            {o.awbNumber}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--gold)' }}>
                            {o.courierPartner || 'Air Express'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Pending AWB</span>
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
                              padding: '5px 10px',
                              background: 'var(--gold)',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#110c08',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: isProcessingThis ? 'wait' : 'pointer',
                            }}
                          >
                            {isProcessingThis ? 'Booking...' : '🚀 Ship via Shiprocket'}
                          </button>
                        )}

                        {/* Dedicated Admin Logistics & Dispatch Console */}
                        <Link
                          href={`/portal/orders/${o.orderNumber}/track`}
                          style={{
                            padding: '5px 10px',
                            background: 'rgba(201, 168, 76, 0.15)',
                            border: '1px solid var(--gold)',
                            borderRadius: '4px',
                            color: 'var(--gold)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
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
                            padding: '5px 10px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '0.75rem',
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
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div style={{ width: '100%', maxWidth: '520px', background: 'var(--bg-deep)', border: '1px solid rgba(201, 168, 76, 0.35)', borderRadius: '12px', padding: '24px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                Fulfillment Desk: {selectedOrder.orderNumber}
              </h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Air Waybill (AWB) #</label>
                <input
                  type="text"
                  placeholder="e.g. BD-778902144IN"
                  value={awbInput || selectedOrder.awbNumber || ''}
                  onChange={(e) => setAwbInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>20s Inspection Video URL</label>
                <input
                  type="url"
                  placeholder="https://assets.sutradara.in/videos/inspection-001.mp4"
                  value={videoUrlInput || selectedOrder.inspectionVideoUrl || ''}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleUpdateDispatch(selectedOrder.id, 'SHIPPED')}
                  style={{ flex: 1, minWidth: '140px', padding: '10px', background: 'var(--gold)', border: 'none', borderRadius: '6px', color: '#110c08', fontWeight: 700, cursor: 'pointer' }}
                >
                  🚀 Confirm Shipped
                </button>
                <button
                  onClick={() => handleUpdateDispatch(selectedOrder.id, 'DELIVERED')}
                  style={{ flex: 1, minWidth: '140px', padding: '10px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', borderRadius: '6px', color: '#4ade80', fontWeight: 700, cursor: 'pointer' }}
                >
                  ✓ Mark Delivered
                </button>
              </div>

              <button
                onClick={() => handleToggleNdr(selectedOrder)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: selectedOrder.isNdrFlagged ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '6px',
                  color: selectedOrder.isNdrFlagged ? '#fff' : '#fca5a5',
                  fontSize: '0.78rem',
                  fontWeight: 600,
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
