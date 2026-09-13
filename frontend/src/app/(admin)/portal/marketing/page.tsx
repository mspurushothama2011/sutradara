'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Coupon } from '@/shared/types/index';

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
          PROMOTIONS & PRIVILEGES
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginTop: '4px' }}>
          Marketing Suite
        </h1>
      </div>

      {/* Grid: Left = Deal of the Day, Right = Active Coupons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Deal of the Day Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(179, 137, 56, 0.25)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)' }}>
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                  Featured Saree Name
                </label>
                <input
                  type="text"
                  value={deal.productName || ''}
                  onChange={(e) => setDeal({ ...deal, productName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={deal.originalPrice || ''}
                    onChange={(e) => setDeal({ ...deal, originalPrice: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                    Deal Price (₹)
                  </label>
                  <input
                    type="number"
                    value={deal.dealPrice || ''}
                    onChange={(e) => setDeal({ ...deal, dealPrice: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: '#15803d', fontWeight: 700, outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>
                  Top Announcement Banner Text
                </label>
                <textarea
                  rows={2}
                  value={deal.bannerText || ''}
                  onChange={(e) => setDeal({ ...deal, bannerText: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.82rem', outline: 'none' }}
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
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(179, 137, 56, 0.35)',
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
            background: '#FFFFFF',
            border: '1px solid rgba(179, 137, 56, 0.25)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)' }}>
                Active Coupons & Privileges
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Client-applied discounts during checkout
              </p>
            </div>
            <button
              onClick={() => setShowAddCouponModal(true)}
              style={{
                padding: '8px 16px',
                background: 'rgba(179, 137, 56, 0.12)',
                border: '1px solid var(--gold)',
                borderRadius: '6px',
                color: 'var(--gold-dark, #8A6418)',
                fontSize: '0.8rem',
                fontWeight: 700,
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
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(179, 137, 56, 0.18)',
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
                        padding: '4px 10px',
                        background: '#FFFFFF',
                        border: '1px dashed var(--gold)',
                        color: 'var(--gold-dark, #8A6418)',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        borderRadius: '4px',
                      }}
                    >
                      {c.code}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}>
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                    {c.minOrderValue ? `Min order: ₹${c.minOrderValue.toLocaleString('en-IN')}` : 'No minimum order'}
                    {c.maxDiscount ? ` • Max cap: ₹${c.maxDiscount.toLocaleString('en-IN')}` : ''}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 700 }}>{c.usedCount} used</span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
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
            background: 'rgba(26, 19, 13, 0.6)',
            backdropFilter: 'blur(6px)',
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
              background: '#FFFFFF',
              border: '1px solid rgba(179, 137, 56, 0.35)',
              borderRadius: '12px',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(26, 19, 13, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(179, 137, 56, 0.18)', paddingBottom: '12px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)' }}>Create Privilege Coupon</h2>
              <button onClick={() => setShowAddCouponModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>

            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI2026"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'monospace', fontWeight: 700, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Discount Value *</label>
                  <input
                    type="number"
                    required
                    placeholder="10 or 2500"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Min Order Value (₹)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={newCoupon.minOrderValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Max Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={newCoupon.maxDiscount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  style={{ padding: '10px 16px', background: '#FAF8F5', border: '1px solid rgba(179,137,56,0.3)', borderRadius: '6px', color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: 'var(--gold)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(179,137,56,0.3)' }}
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
