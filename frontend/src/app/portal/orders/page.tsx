'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Order } from '../../../../../shared/types/index';

export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [awbInput, setAwbInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');

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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
          FULFILLMENT & DISPATCH
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>
          Orders & QC Queue
        </h1>
      </div>

      {/* Orders Table */}
      <div style={{ background: 'var(--bg-deep)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--gold)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '14px 18px' }}>Order #</th>
              <th style={{ padding: '14px 18px' }}>Recipient</th>
              <th style={{ padding: '14px 18px' }}>Total Paid</th>
              <th style={{ padding: '14px 18px' }}>Status</th>
              <th style={{ padding: '14px 18px' }}>Secure OTP</th>
              <th style={{ padding: '14px 18px' }}>QC Video</th>
              <th style={{ padding: '14px 18px' }}>AWB / Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading orders queue...</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 600 }}>
                    {o.orderNumber}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#fff' }}>
                    {o.shippingAddress?.fullName || 'Aarav Singhania'}
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {o.shippingAddress?.city}, {o.shippingAddress?.state}
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
                        fontWeight: 600,
                        background: o.status === 'DELIVERED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(201, 168, 76, 0.2)',
                        color: o.status === 'DELIVERED' ? '#4ade80' : 'var(--gold)',
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
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#fff', fontWeight: 700 }}>
                    {o.deliveryOtp || '—'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {o.inspectionVideoUrl ? (
                      <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>✓ Verified</span>
                    ) : (
                      <span style={{ color: '#fca5a5', fontSize: '0.75rem' }}>Pending QC</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`/track/${o.orderNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', textDecoration: 'none' }}
                      >
                        Track ↗
                      </a>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        style={{ padding: '4px 8px', background: 'rgba(201, 168, 76, 0.2)', border: '1px solid var(--gold)', borderRadius: '4px', color: 'var(--gold)', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Dispatch Desk
                      </button>
                      <button
                        onClick={() => handleToggleNdr(o)}
                        style={{ padding: '4px 8px', background: o.isNdrFlagged ? '#ef4444' : 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: '4px', color: o.isNdrFlagged ? '#fff' : '#f87171', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        {o.isNdrFlagged ? 'Clear NDR' : 'Flag NDR'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dispatch Modal */}
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
            padding: '24px',
          }}
        >
          <div style={{ width: '100%', maxWidth: '520px', background: 'var(--bg-deep)', border: '1px solid rgba(201, 168, 76, 0.35)', borderRadius: '12px', padding: '28px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                Fulfillment & Dispatch: {selectedOrder.orderNumber}
              </h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Bluedart AWB Air Waybill #</label>
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

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  onClick={() => handleUpdateDispatch(selectedOrder.id, 'SHIPPED')}
                  style={{ flex: 1, padding: '12px', background: 'var(--gold)', border: 'none', borderRadius: '6px', color: '#110c08', fontWeight: 600, cursor: 'pointer' }}
                >
                  🚀 Confirm Dispatch (Shipped)
                </button>
                <button
                  onClick={() => handleUpdateDispatch(selectedOrder.id, 'DELIVERED')}
                  style={{ flex: 1, padding: '12px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', borderRadius: '6px', color: '#4ade80', fontWeight: 600, cursor: 'pointer' }}
                >
                  ✓ Mark Delivered
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
