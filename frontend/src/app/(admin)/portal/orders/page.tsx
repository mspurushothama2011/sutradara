'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Order } from '@/shared/types/index';
import { Search, RefreshCw, Send, CheckCircle2, Truck, Eye, ShieldAlert, Filter, PackageCheck, ExternalLink } from 'lucide-react';

const COURIER_PARTNERS = [
  'Bluedart Apex Air',
  'Delhivery Express',
  'DTDC Express',
  'Speed Post (India Post)',
  'The Professional Couriers',
  'Shadowfax Air',
  'Xpressbees Logistics',
  'In-House White-Glove Handover',
];

export default function PortalOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal form states
  const [statusInput, setStatusInput] = useState('SHIPPED');
  const [awbInput, setAwbInput] = useState('');
  const [courierInput, setCourierInput] = useState('Bluedart Apex Air');
  const [locationInput, setLocationInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/orders');
      setOrders(res.orders || []);
    } catch (e: any) {
      if (e?.status !== 401) {
        console.warn('Orders queue notice:', e?.message || e);
      }
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openFulfillmentModal = (order: Order) => {
    setSelectedOrder(order);
    setStatusInput(order.status || 'SHIPPED');
    setAwbInput(order.awbNumber || '');
    setCourierInput(order.courierPartner || 'Bluedart Apex Air');
    setVideoUrlInput(order.inspectionVideoUrl || '');
    setLocationInput('');
    setMessageInput('');
  };

  // Manual Milestone & Dispatch Update
  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      await apiRequest(`/orders/${selectedOrder.id}/dispatch`, {
        method: 'PATCH',
        data: {
          status: statusInput,
          awbNumber: awbInput || undefined,
          courierPartner: courierInput || undefined,
          location: locationInput || undefined,
          message: messageInput || undefined,
          inspectionVideoUrl: videoUrlInput || undefined,
        },
      });
      alert('✓ Order dispatch record and timeline updated successfully!');
      setSelectedOrder(null);
      await loadOrders();
    } catch (e: any) {
      alert(e.message || 'Dispatch update failed');
    } finally {
      setIsUpdating(false);
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

  // Filtered Orders
  const filteredOrders = orders.filter((o: any) => {
    const shipping = (o.shippingAddress || {}) as any;
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipping.recipientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.awbNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'NDR') return o.isNdrFlagged;
    return o.status === statusFilter;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
            FULFILLMENT & LOGISTICS VAULT
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginTop: '4px' }}>
            Orders & Fulfillment Dispatch Queue
          </h1>
        </div>

        <button
          onClick={loadOrders}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
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
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Queue
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Orders' },
            { key: 'PAID', label: 'Paid / Pending' },
            { key: 'QC_INSPECTED', label: 'QC Inspected' },
            { key: 'SHIPPED', label: 'Shipped' },
            { key: 'IN_TRANSIT', label: 'In Transit' },
            { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
            { key: 'DELIVERED', label: 'Delivered' },
            { key: 'NDR', label: '⚠️ NDR Exceptions' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: statusFilter === tab.key ? '1px solid var(--gold)' : '1px solid rgba(179, 137, 56, 0.2)',
                background: statusFilter === tab.key ? 'var(--gold)' : '#FFFFFF',
                color: statusFilter === tab.key ? '#FFFFFF' : 'var(--text)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} color="var(--gold)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search Order #, Patron, AWB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: '#FFFFFF',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.22)', borderRadius: '12px', overflowX: 'auto', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '880px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid rgba(179, 137, 56, 0.18)', color: 'var(--text)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
              <th style={{ padding: '14px 18px' }}>Order #</th>
              <th style={{ padding: '14px 18px' }}>Recipient & Address</th>
              <th style={{ padding: '14px 18px' }}>Total Amount</th>
              <th style={{ padding: '14px 18px' }}>Status</th>
              <th style={{ padding: '14px 18px' }}>Courier & AWB</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading orders queue...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  {searchQuery || statusFilter !== 'ALL' ? 'No matching orders found for your filter.' : 'No orders found in queue.'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((o: any) => {
                const shipping = (o.shippingAddress || {}) as any;

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
                        Email: {o.customerEmail || o.customer?.email || 'N/A'} • Phone: {o.customerPhone || shipping.recipientPhone || o.customer?.phone || 'N/A'}
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
                            : o.status === 'OUT_FOR_DELIVERY' || o.status === 'IN_TRANSIT'
                            ? 'rgba(234, 179, 8, 0.15)'
                            : o.status === 'SHIPPED'
                            ? 'rgba(59, 130, 246, 0.12)'
                            : 'rgba(179, 137, 56, 0.12)',
                          color: o.status === 'DELIVERED'
                            ? '#15803d'
                            : o.status === 'OUT_FOR_DELIVERY' || o.status === 'IN_TRANSIT'
                            ? '#a16207'
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
                            {o.courierPartner || 'Bluedart Apex Air'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Pending AWB</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Quick Update Fulfillment Modal */}
                        <button
                          onClick={() => openFulfillmentModal(o)}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--gold)',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#FFFFFF',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(179, 137, 56, 0.25)',
                          }}
                        >
                          📦 Update Status
                        </button>

                        {/* Dedicated Admin Logistics & Dispatch Console */}
                        <Link
                          href={`/portal/orders/${o.orderNumber}/track`}
                          style={{
                            padding: '6px 12px',
                            background: '#FFFFFF',
                            border: '1px solid rgba(179, 137, 56, 0.35)',
                            borderRadius: '4px',
                            color: 'var(--text)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
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

      {/* Dispatch & Milestone Modal */}
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
          <div style={{ width: '100%', maxWidth: '540px', background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.35)', borderRadius: '12px', padding: '28px', color: 'var(--text)', boxShadow: '0 20px 50px rgba(26, 19, 13, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(179, 137, 56, 0.18)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>Fulfillment & Dispatch Desk</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--text)', margin: 0 }}>
                  Order #{selectedOrder.orderNumber}
                </h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>

            <form onSubmit={handleSaveDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>Target Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="PAID">PAID (Order Confirmed)</option>
                    <option value="QC_INSPECTED">QC_INSPECTED (Under Inspection)</option>
                    <option value="PROCESSING">PROCESSING (Packaging)</option>
                    <option value="SHIPPED">SHIPPED (Handed to Air Courier)</option>
                    <option value="IN_TRANSIT">IN_TRANSIT (In Flight / Gateway)</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Doorstep)</option>
                    <option value="DELIVERED">DELIVERED (Handover Complete)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>Courier Partner</label>
                  <select
                    value={courierInput}
                    onChange={(e) => setCourierInput(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                  >
                    {COURIER_PARTNERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>Air Waybill (AWB) #</label>
                  <input
                    type="text"
                    placeholder="e.g. BD-89241512IN"
                    value={awbInput}
                    onChange={(e) => setAwbInput(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'monospace', fontWeight: 600, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>Location (Hub/City)</label>
                  <input
                    type="text"
                    placeholder="e.g. National Logistics Gateway"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    style={{ width: '100%', padding: '10px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>Custom Milestone Message (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Package cleared white-glove security scan."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{ flex: 1, padding: '12px', background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{ flex: 2, padding: '12px', background: 'var(--gold)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontWeight: 700, cursor: isUpdating ? 'wait' : 'pointer', boxShadow: '0 2px 8px rgba(179, 137, 56, 0.3)' }}
                >
                  {isUpdating ? 'Saving Dispatch...' : '✓ Update Logistics & Milestone'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleToggleNdr(selectedOrder)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: selectedOrder.isNdrFlagged ? '#dc2626' : 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  color: selectedOrder.isNdrFlagged ? '#FFFFFF' : '#b91c1c',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '4px',
                }}
              >
                {selectedOrder.isNdrFlagged ? '⚠️ Clear NDR Exception' : '🚩 Flag NDR Non-Delivery Exception'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
