'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Award, AlertTriangle, Trash2, Ticket, Lock, ArrowRight, X, AlertCircle } from 'lucide-react';
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
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <LandingNavbar />
        <div style={{ paddingTop: '140px', textAlign: 'center', paddingLeft: '20px', paddingRight: '20px' }}>
          <div style={{ color: 'var(--gold)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <ShoppingBag size={48} strokeWidth={1.25} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--text)', fontWeight: 500 }}>
            Your Acquisition Bag is Empty
          </h1>
          <p style={{ color: 'var(--text-dim)', marginTop: '8px', maxWidth: '480px', margin: '8px auto 0', lineHeight: 1.6 }}>
            Explore our curated heirloom vaults, featuring one-of-a-kind handloom sarees woven with pure certified zari.
          </p>
          <div style={{ marginTop: '28px' }}>
            <Link
              href="/catalog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                background: 'var(--gold)',
                color: '#ffffff',
                borderRadius: '3px',
                fontWeight: 700,
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(179, 137, 56, 0.3)',
              }}
            >
              <span>Explore Heirloom Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '100px' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '120px', paddingLeft: '24px', paddingRight: '24px' }}>
        {/* Header Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(179, 137, 56, 0.2)', paddingBottom: '16px', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
              YOUR SELECTIONS
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--text)', margin: '4px 0 0', fontWeight: 500 }}>
              Acquisition Bag ({totalCount} {totalCount === 1 ? 'Piece' : 'Pieces'})
            </h1>
          </div>
          <button
            onClick={clearBag}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            Clear Entire Bag
          </button>
        </div>

        {/* Sold out Alert notice */}
        {hasSoldOutItems && (
          <div style={{ marginBottom: '24px', padding: '14px 18px', background: '#FEE2E2', border: '1px solid #ef4444', borderRadius: '3px', color: '#b91c1c', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            <span><strong>Notice:</strong> One or more items in your bag were just acquired by another customer. Please remove them to proceed.</span>
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
                    background: '#ffffff',
                    border: isSoldOut ? '1px solid #ef4444' : '1px solid rgba(179, 137, 56, 0.22)',
                    borderRadius: '3px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    opacity: isSoldOut ? 0.75 : 1,
                    boxShadow: '0 4px 16px rgba(45, 25, 8, 0.04)',
                  }}
                >
                  <Link href={`/product/${p.slug}`}>
                    <img
                      src={p.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                      alt={p.name}
                      style={{ width: '90px', height: '100px', objectFit: 'cover', borderRadius: '2px', border: '1px solid rgba(179, 137, 56, 0.25)', flexShrink: 0 }}
                    />
                  </Link>

                  <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--gold-dark, #8c6818)', fontWeight: 700 }}>
                        {p.sku}
                      </span>
                      {p.isHeirloom1of1 && (
                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(179, 137, 56, 0.15)', color: 'var(--gold-dark, #8c6818)', borderRadius: '2px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                          <Award size={10} />
                          <span>1-of-1 Heirloom</span>
                        </span>
                      )}
                      {/* Live Stock Indicator */}
                      {isSoldOut ? (
                        <span style={{ fontSize: '0.65rem', background: '#FEE2E2', color: '#b91c1c', padding: '2px 6px', borderRadius: '2px', fontWeight: 700, textTransform: 'uppercase' }}>
                          Sold Out
                        </span>
                      ) : itemStock <= 2 ? (
                        <span style={{ fontSize: '0.65rem', background: '#FEF3C7', color: '#92400e', padding: '2px 6px', borderRadius: '2px', fontWeight: 600, textTransform: 'uppercase' }}>
                          {itemStock === 1 ? 'Single piece in vault' : `${itemStock} pieces available`}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.65rem', background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '2px', fontWeight: 600, textTransform: 'uppercase' }}>
                          In Stock
                        </span>
                      )}
                    </div>

                    <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600, margin: '2px 0 4px' }}>
                        {p.name}
                      </h3>
                    </Link>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                      {p.craftRegion} • {p.fabric} • {p.zariType}
                    </p>

                    <strong style={{ fontSize: '1.1rem', color: 'var(--text)', display: 'block', fontWeight: 700 }}>
                      ₹{(p.sellingPrice * item.quantity).toLocaleString('en-IN')}
                    </strong>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', marginLeft: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FAF8F5', padding: '4px 8px', borderRadius: '2px', border: '1px solid rgba(179, 137, 56, 0.3)' }}>
                      <button
                        onClick={() => updateQuantity(p.id, item.quantity - 1)}
                        style={{ width: '26px', height: '26px', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', minWidth: '18px', textAlign: 'center' }}>
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
                          color: p.isHeirloom1of1 || item.quantity >= itemStock ? 'var(--text-dim)' : 'var(--text)',
                          fontSize: '1.1rem',
                          cursor: p.isHeirloom1of1 || item.quantity >= itemStock ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
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
                        color: '#dc2626',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Order Summary & Proceed CTA */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(179, 137, 56, 0.25)',
              borderRadius: '3px',
              padding: '24px 28px',
              boxShadow: '0 8px 30px rgba(45, 25, 8, 0.06)',
              position: 'sticky',
              top: '110px',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text)', marginBottom: '16px', borderBottom: '1px solid rgba(179, 137, 56, 0.15)', paddingBottom: '12px', fontWeight: 600 }}>
              Acquisition Summary
            </h2>

            {/* Coupon Box & View Coupons CTA */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--gold-dark, #8c6818)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Privilege Code
                </span>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--gold-dark, #8c6818)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Ticket size={12} />
                  <span>View Available Coupons</span>
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
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '2px',
                    color: 'var(--text)',
                    fontSize: '0.82rem',
                    textTransform: 'uppercase',
                  }}
                />
                <button
                  onClick={() => handleApplyCoupon()}
                  style={{
                    padding: '9px 16px',
                    background: 'var(--gold)',
                    border: 'none',
                    borderRadius: '2px',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Apply
                </button>
              </div>

              {couponSuccess && <p style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>{couponSuccess}</p>}
              {couponError && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>{couponError}</p>}
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', borderBottom: '1px solid rgba(179, 137, 56, 0.15)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                <span>Subtotal ({totalCount} items)</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                  <span>Privilege Discount ({appliedCoupon})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                <span>Express Delivery</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>COMPLIMENTARY</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600 }}>Total Payable</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold-dark, #8c6818)', fontWeight: 700 }}>
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
                background: hasSoldOutItems ? 'rgba(0,0,0,0.1)' : 'var(--gold)',
                border: 'none',
                borderRadius: '3px',
                color: hasSoldOutItems ? 'var(--text-dim)' : '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: hasSoldOutItems ? 'not-allowed' : 'pointer',
                boxShadow: hasSoldOutItems ? 'none' : '0 4px 16px rgba(179, 137, 56, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {hasSoldOutItems ? (
                <>
                  <AlertTriangle size={15} />
                  <span>Remove Sold Out Pieces</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Proceed to Checkout</span>
                </>
              )}
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
            background: 'rgba(26, 19, 13, 0.65)',
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
              background: '#ffffff',
              border: '1.5px solid var(--gold)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 24px 64px rgba(45, 25, 8, 0.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(179, 137, 56, 0.2)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--gold-dark, #8c6818)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
                  OFFERS & DISCOUNTS
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text)', marginTop: '2px', fontWeight: 600 }}>
                  Available Coupons
                </h3>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {isLoadingCoupons ? (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px' }}>Loading available coupons...</p>
            ) : availableCoupons.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px' }}>No active coupons available right now.</p>
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
                        background: isEligible ? '#FAF8F5' : '#F4EFEA',
                        border: isEligible
                          ? isCurrentlyApplied
                            ? '2px solid #16a34a'
                            : '1px solid rgba(179, 137, 56, 0.35)'
                          : '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '3px',
                        opacity: isEligible ? 1 : 0.55,
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
                              color: 'var(--gold-dark, #8c6818)',
                              background: '#ffffff',
                              padding: '4px 8px',
                              borderRadius: '3px',
                              border: '1px dashed rgba(179, 137, 56, 0.5)',
                              display: 'inline-block',
                            }}
                          >
                            {coupon.code}
                          </span>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, marginTop: '6px' }}>
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
                              background: isCurrentlyApplied ? '#DCFCE7' : 'var(--gold)',
                              border: isCurrentlyApplied ? '1px solid #16a34a' : 'none',
                              color: isCurrentlyApplied ? '#166534' : '#ffffff',
                              borderRadius: '3px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: isCurrentlyApplied ? 'default' : 'pointer',
                            }}
                          >
                            {isCurrentlyApplied ? '✓ Applied' : 'Apply Code'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: '#ffffff', padding: '4px 8px', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)' }}>
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
                        <div style={{ marginTop: '8px', padding: '6px 10px', background: '#FEF3C7', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '3px', color: '#92400e', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={13} strokeWidth={1.5} /> Add ₹{deficit.toLocaleString('en-IN')} more to unlock this privilege
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
