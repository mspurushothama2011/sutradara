'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { apiRequest } from '@/lib/api';
import LandingNavbar from '@/components/landing/LandingNavbar';

interface LiveProductStock {
  [productId: string]: {
    stock: number;
    isAvailable: boolean;
    name: string;
  };
}

export default function BagPage() {
  const router = useRouter();
  const { bagItems, setBuyNowItem, updateQuantity, removeFromBag, clearBag, subtotal, totalCount } = useCart();

  // Coupon state & Modal
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  // Live Stock validation state
  const [stockInfo, setStockInfo] = useState<LiveProductStock>({});
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [hasSoldOutItems, setHasSoldOutItems] = useState(false);

  // Check live stock against PostgreSQL
  const checkLiveStock = async () => {
    if (bagItems.length === 0) return;
    setIsValidatingStock(true);
    try {
      const stockMap: LiveProductStock = {};
      let soldOutFound = false;

      for (const item of bagItems) {
        try {
          const pRes = await apiRequest(`/products/${item.product.id}`);
          const pData = pRes.product || pRes;
          const currentStock = typeof pData.stock === 'number' ? pData.stock : item.product.stock;
          stockMap[item.product.id] = {
            stock: currentStock,
            isAvailable: currentStock >= item.quantity,
            name: pData.name || item.product.name,
          };
          if (currentStock < item.quantity) {
            soldOutFound = true;
          }
        } catch {
          stockMap[item.product.id] = {
            stock: item.product.stock,
            isAvailable: item.product.stock >= item.quantity,
            name: item.product.name,
          };
        }
      }

      setStockInfo(stockMap);
      setHasSoldOutItems(soldOutFound);
    } catch (err) {
      console.warn('Live stock check notice:', err);
    } finally {
      setIsValidatingStock(false);
    }
  };

  // Fetch Public Coupons for dedicated overlay modal
  const fetchAvailableCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const res = await apiRequest('/marketing/public-coupons');
      if (res.coupons) {
        setAvailableCoupons(res.coupons);
      }
    } catch (e) {
      console.error('Failed to load coupons:', e);
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  useEffect(() => {
    checkLiveStock();
    fetchAvailableCoupons();
  }, [bagItems.length]);

  // Validate Privilege Coupon Code
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).toUpperCase().trim();
    if (!code) return;
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await apiRequest('/marketing/validate-coupon', {
        method: 'POST',
        data: { code, cartTotal: subtotal },
      });

      if (res.valid) {
        setAppliedCoupon(code);
        setCouponCode(code);
        setDiscountAmount(res.discountAmount || 0);
        setCouponSuccess(`✓ Privilege Code ${code} applied! Saved ₹${res.discountAmount?.toLocaleString('en-IN')}`);
        setIsCouponModalOpen(false);
      } else {
        setCouponError(res.error || 'Invalid coupon code');
        setDiscountAmount(0);
        setAppliedCoupon(null);
      }
    } catch (e: any) {
      setCouponError(e.message || 'Failed to validate coupon');
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Handle Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (hasSoldOutItems) {
      alert('Please remove sold out heirlooms from your bag to proceed to checkout.');
      return;
    }
    setBuyNowItem(null); // Ensure checkout processes the complete bag
    router.push('/checkout');
  };

  if (bagItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>
        <LandingNavbar />
        <div style={{ paddingTop: '140px', textAlign: 'center', paddingLeft: '20px', paddingRight: '20px' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px' }}>🛍️</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff' }}>
            Your Acquisition Bag is Empty
          </h1>
          <p style={{ color: 'var(--text-dim)', marginTop: '8px', maxWidth: '480px', margin: '8px auto 0' }}>
            Explore our curated heirloom vaults, featuring one-of-a-kind handloom sarees woven with pure certified zari.
          </p>
          <div style={{ marginTop: '28px' }}>
            <Link
              href="/catalog"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                background: 'var(--gold)',
                color: '#110c08',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(201, 168, 76, 0.4)',
              }}
            >
              Explore Master Catalog →
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

      <main style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '110px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
        {/* Header Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
              PATRON ACQUISITION VAULT
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: '#fff', marginTop: '4px' }}>
              Shopping Bag ({totalCount} {totalCount === 1 ? 'Piece' : 'Pieces'})
            </h1>
          </div>
          <button
            onClick={clearBag}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Clear Entire Bag
          </button>
        </div>

        {/* Sold out Alert notice */}
        {hasSoldOutItems && (
          <div style={{ marginBottom: '24px', padding: '14px 18px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.88rem' }}>
            ⚠️ <strong>Notice:</strong> One or more items in your bag have just been acquired by another patron and are currently sold out. Please remove them to proceed.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '32px', alignItems: 'start' }}>
          
          {/* LEFT: Item List with Live Stock Validation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bagItems.map((item) => {
              const p = item.product;
              const itemStock = stockInfo[p.id]?.stock ?? p.stock;
              const isSoldOut = itemStock < item.quantity || itemStock === 0;

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '20px',
                    background: 'var(--bg-deep)',
                    border: isSoldOut ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    opacity: isSoldOut ? 0.75 : 1,
                  }}
                >
                  <Link href={`/product/${p.slug}`}>
                    <img
                      src={p.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                      alt={p.name}
                      style={{ width: '90px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}
                    />
                  </Link>

                  <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 600 }}>
                        {p.sku}
                      </span>
                      {p.isHeirloom1of1 && (
                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(201, 168, 76, 0.2)', color: 'var(--gold)', borderRadius: '4px' }}>
                          👑 1-of-1 Heirloom
                        </span>
                      )}
                      {/* Live Stock Indicator */}
                      {isSoldOut ? (
                        <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          🔴 Sold Out
                        </span>
                      ) : itemStock <= 2 ? (
                        <span style={{ fontSize: '0.65rem', background: 'rgba(234, 179, 8, 0.2)', color: '#fef08a', padding: '2px 6px', borderRadius: '4px' }}>
                          ⚡ Only {itemStock} left in vault
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.65rem', background: 'rgba(34, 197, 94, 0.15)', color: '#86efac', padding: '2px 6px', borderRadius: '4px' }}>
                          🟢 In Stock
                        </span>
                      )}
                    </div>

                    <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, margin: '2px 0 4px' }}>
                        {p.name}
                      </h3>
                    </Link>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                      {p.craftRegion} • {p.fabric} • {p.zariType}
                    </p>

                    <strong style={{ fontSize: '1.1rem', color: 'var(--gold)', display: 'block' }}>
                      ₹{(p.sellingPrice * item.quantity).toLocaleString('en-IN')}
                    </strong>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', marginLeft: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <button
                        onClick={() => updateQuantity(p.id, item.quantity - 1)}
                        style={{ width: '26px', height: '26px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', minWidth: '18px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(p.id, item.quantity + 1)}
                        disabled={p.isHeirloom1of1 || item.quantity >= itemStock}
                        style={{
                          width: '26px',
                          height: '26px',
                          background: 'transparent',
                          border: 'none',
                          color: p.isHeirloom1of1 || item.quantity >= itemStock ? 'var(--text-dim)' : '#fff',
                          fontSize: '1.1rem',
                          cursor: p.isHeirloom1of1 || item.quantity >= itemStock ? 'not-allowed' : 'pointer',
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromBag(p.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fca5a5',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Order Summary & Proceed CTA */}
          <div
            style={{
              background: 'var(--bg-deep)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '16px',
              padding: '24px 28px',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
              position: 'sticky',
              top: '110px',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              Acquisition Summary
            </h2>

            {/* Coupon Box & View Coupons CTA */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Privilege Code
                </span>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--gold)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 600,
                  }}
                >
                  🎟️ View Available Coupons
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. VIRASAT10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    background: '#110c08',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    textTransform: 'uppercase',
                  }}
                />
                <button
                  onClick={() => handleApplyCoupon()}
                  style={{
                    padding: '9px 16px',
                    background: 'rgba(201, 168, 76, 0.2)',
                    border: '1px solid var(--gold)',
                    borderRadius: '6px',
                    color: 'var(--gold)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Apply
                </button>
              </div>

              {couponSuccess && <p style={{ color: '#86efac', fontSize: '0.75rem', marginTop: '6px' }}>{couponSuccess}</p>}
              {couponError && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '6px' }}>{couponError}</p>}
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                <span>Subtotal ({totalCount} items)</span>
                <span style={{ color: '#fff' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                  <span>Privilege Discount ({appliedCoupon})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                <span>Express Delivery</span>
                <span style={{ color: 'var(--gold)' }}>COMPLIMENTARY</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>Total Payable</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)', fontWeight: 700 }}>
                ₹{finalTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Master Checkout CTA */}
            <button
              onClick={handleProceedToCheckout}
              disabled={hasSoldOutItems}
              style={{
                width: '100%',
                padding: '16px',
                background: hasSoldOutItems ? 'rgba(255,255,255,0.1)' : 'var(--gold)',
                border: 'none',
                borderRadius: '8px',
                color: hasSoldOutItems ? 'var(--text-dim)' : '#110c08',
                fontSize: '0.92rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: hasSoldOutItems ? 'not-allowed' : 'pointer',
                boxShadow: hasSoldOutItems ? 'none' : '0 8px 24px rgba(201, 168, 76, 0.4)',
              }}
            >
              {hasSoldOutItems ? '⚠️ Remove Sold Out Pieces' : '👑 Proceed to Checkout'}
            </button>
          </div>
        </div>
      </main>

      {/* DEDICATED LUXURY COUPONS MODAL OVERLAY */}
      {isCouponModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setIsCouponModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#130d07',
              border: '1px solid var(--gold)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(201, 168, 76, 0.3)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  PATRON PRIVILEGES
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#fff', marginTop: '2px' }}>
                  Available Heirloom Coupons
                </h3>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {isLoadingCoupons ? (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px' }}>Loading available privileges...</p>
            ) : availableCoupons.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px' }}>No active privileges found at this time.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {availableCoupons.map((coupon) => {
                  const isEligible = !coupon.minOrderValue || subtotal >= coupon.minOrderValue;
                  const deficit = coupon.minOrderValue ? Math.max(0, coupon.minOrderValue - subtotal) : 0;
                  const isCurrentlyApplied = appliedCoupon === coupon.code;

                  return (
                    <div
                      key={coupon.id || coupon.code}
                      style={{
                        padding: '16px',
                        background: isEligible ? 'rgba(201, 168, 76, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: isEligible
                          ? isCurrentlyApplied
                            ? '2px solid #4ade80'
                            : '1px solid var(--gold)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        opacity: isEligible ? 1 : 0.45,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '1rem',
                              color: isEligible ? 'var(--gold)' : '#fff',
                              background: 'rgba(0, 0, 0, 0.5)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px dashed rgba(201, 168, 76, 0.4)',
                              display: 'inline-block',
                            }}
                          >
                            {coupon.code}
                          </span>
                          <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginTop: '6px' }}>
                            {coupon.discountType === 'PERCENTAGE'
                              ? `${coupon.discountValue}% OFF on Master Weaves`
                              : `₹${coupon.discountValue.toLocaleString('en-IN')} FLAT OFF`}
                          </p>
                        </div>

                        {isEligible ? (
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon(coupon.code)}
                            disabled={isCurrentlyApplied}
                            style={{
                              padding: '6px 14px',
                              background: isCurrentlyApplied ? 'rgba(34, 197, 94, 0.2)' : 'var(--gold)',
                              border: isCurrentlyApplied ? '1px solid #4ade80' : 'none',
                              color: isCurrentlyApplied ? '#4ade80' : '#110c08',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: isCurrentlyApplied ? 'default' : 'pointer',
                            }}
                          >
                            {isCurrentlyApplied ? '✓ Applied' : 'Apply Code'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '4px' }}>
                            Locked
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                        {coupon.minOrderValue && (
                          <p style={{ margin: '2px 0' }}>
                            • Minimum acquisition value: ₹{coupon.minOrderValue.toLocaleString('en-IN')}
                          </p>
                        )}
                        {coupon.maxDiscount && (
                          <p style={{ margin: '2px 0' }}>
                            • Maximum privilege cap: ₹{coupon.maxDiscount.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>

                      {!isEligible && (
                        <div style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '4px', color: '#fef08a', fontSize: '0.72rem' }}>
                          ⚠️ Add ₹{deficit.toLocaleString('en-IN')} more to unlock this privilege
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
