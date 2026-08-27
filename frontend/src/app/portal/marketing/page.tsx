'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Coupon } from '../../../../../shared/types/index';

export default function PortalMarketingPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [deal, setDeal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);

  // New Coupon Form
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
  });

  const loadMarketingData = async () => {
    try {
      setIsLoading(true);
      const [couponsRes, dealRes] = await Promise.all([
        apiRequest('/marketing/coupons'),
        apiRequest('/marketing/deal'),
      ]);
      setCoupons(couponsRes.coupons || []);
      setDeal(dealRes.deal || null);
    } catch (e) {
      console.error('Failed to load marketing data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketingData();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/marketing/coupons', {
        method: 'POST',
        data: newCoupon,
      });
      setShowAddCouponModal(false);
      loadMarketingData();
      setNewCoupon({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  const handleUpdateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/marketing/deal', {
        method: 'PUT',
        data: deal,
      });
      alert('✓ Deal of the Day updated successfully!');
      loadMarketingData();
    } catch (err: any) {
      alert(err.message || 'Failed to update deal');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
          PROMOTIONS & PRIVILEGES
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>
          Marketing Suite
        </h1>
      </div>

      {/* Grid: Left = Deal of the Day, Right = Active Coupons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '32px', alignItems: 'start' }}>
        {/* Deal of the Day Card */}
        <div
          style={{
            background: 'var(--bg-deep)',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff' }}>
                Deal of the Day Engine
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Configures the live countdown banner and promo price
              </p>
            </div>
          </div>

          {deal && (
            <form onSubmit={handleUpdateDeal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>
                  Featured Saree Name
                </label>
                <input
                  type="text"
                  value={deal.productName || ''}
                  onChange={(e) => setDeal({ ...deal, productName: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={deal.originalPrice || ''}
                    onChange={(e) => setDeal({ ...deal, originalPrice: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>
                    Deal Price (₹)
                  </label>
                  <input
                    type="number"
                    value={deal.dealPrice || ''}
                    onChange={(e) => setDeal({ ...deal, dealPrice: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#4ade80' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>
                  Top Announcement Banner Text
                </label>
                <textarea
                  rows={2}
                  value={deal.bannerText || ''}
                  onChange={(e) => setDeal({ ...deal, bannerText: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#110c08',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Save & Update Live Storefront Deal
              </button>
            </form>
          )}
        </div>

        {/* Coupons & Promo Codes */}
        <div
          style={{
            background: 'var(--bg-deep)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff' }}>
                Active Coupons & Privileges
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Client-applied discounts during checkout
              </p>
            </div>
            <button
              onClick={() => setShowAddCouponModal(true)}
              style={{
                padding: '8px 14px',
                background: 'rgba(201, 168, 76, 0.15)',
                border: '1px solid var(--gold)',
                borderRadius: '6px',
                color: 'var(--gold)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + New Coupon
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {coupons.map((c) => (
              <div
                key={c.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(201, 168, 76, 0.2)',
                        border: '1px dashed var(--gold)',
                        color: 'var(--gold)',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        borderRadius: '4px',
                      }}
                    >
                      {c.code}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                    {c.minOrderValue ? `Min order: ₹${c.minOrderValue.toLocaleString('en-IN')}` : 'No minimum order'}
                    {c.maxDiscount ? ` • Max cap: ₹${c.maxDiscount.toLocaleString('en-IN')}` : ''}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{c.usedCount} used</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {c.usageLimit ? `/ ${c.usageLimit} max` : 'Unlimited'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
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
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              background: 'var(--bg-deep)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '12px',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff' }}>Create Privilege Coupon</h2>
              <button onClick={() => setShowAddCouponModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI2026"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Discount Value *</label>
                  <input
                    type="number"
                    required
                    placeholder="10 or 2500"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Min Order Value (₹)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={newCoupon.minOrderValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Max Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={newCoupon.maxDiscount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  style={{ padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: 'var(--gold)', border: 'none', borderRadius: '6px', color: '#110c08', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
