'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { apiRequest } from '@/lib/api';
import LandingNavbar from '@/components/landing/LandingNavbar';

export default function BagPage() {
  const router = useRouter();
  const { bagItems, updateQuantity, removeFromBag, clearBag, subtotal, totalCount } = useCart();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<'AUTH' | 'ADDRESS' | 'SUCCESS'>('AUTH');

  // Auth Inputs (if guest checkout)
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Address Inputs
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);

  // Load active customer session
  useEffect(() => {
    try {
      const stored = localStorage.getItem('customerUser');
      if (stored) {
        const u = JSON.parse(stored);
        setCustomerUser(u);
        setRecipientName(u.name || '');
        setRecipientPhone(u.phone || '');
        fetchCustomerAddresses();
      }
    } catch (e) {}
  }, []);

  const fetchCustomerAddresses = async () => {
    try {
      const res = await apiRequest('/customer/auth/me');
      if (res.customer?.addresses) {
        setSavedAddresses(res.customer.addresses);
        const def = res.customer.addresses.find((a: any) => a.isDefault) || res.customer.addresses[0];
        if (def) {
          setSelectedAddressId(def.id);
          setRecipientName(def.recipientName || '');
          setRecipientPhone(def.recipientPhone || '');
          setStreet(def.street || '');
          setLandmark(def.landmark || '');
          setCity(def.city || '');
          setState(def.state || '');
          setPincode(def.pincode || '');
        }
      }
    } catch (e) {}
  };

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
        setDiscountAmount(res.discountAmount || 0);
        setCouponSuccess(`✓ Privilege Code ${code} applied! Saved ₹${res.discountAmount?.toLocaleString('en-IN')}`);
      } else {
        setCouponError(res.message || 'Invalid coupon code');
        setDiscountAmount(0);
        setAppliedCoupon(null);
      }
    } catch (e: any) {
      setCouponError(e.message || 'Failed to validate coupon');
    }
  };

  // Handle Checkout Click
  const handleStartCheckout = () => {
    setIsCheckoutOpen(true);
    if (customerUser) {
      setCheckoutStep('ADDRESS');
    } else {
      setCheckoutStep('AUTH');
    }
  };

  // OTP Login Flow
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const res = await apiRequest('/customer/auth/send-otp', {
        method: 'POST',
        data: { email: authEmail },
      });
      setIsOtpSent(true);
      if (res.devOtp) {
        setDevOtpCode(res.devOtp);
      }
    } catch (e: any) {
      setAuthError(e.message || 'Failed to send verification code.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authOtp) return;
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const res = await apiRequest('/customer/auth/verify-otp', {
        method: 'POST',
        data: { email: authEmail, otp: authOtp },
      });

      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('customerUser', JSON.stringify(res.customer));
      setCustomerUser(res.customer);
      setRecipientName(res.customer.name || '');
      setRecipientPhone(res.customer.phone || '');

      setCheckoutStep('ADDRESS');
      fetchCustomerAddresses();
    } catch (e: any) {
      setAuthError(e.message || 'Invalid verification code.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Confirm Order Execution against PostgreSQL
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !pincode) {
      alert('Please complete all delivery destination fields.');
      return;
    }

    setIsOrderSubmitting(true);

    const shippingAddress = {
      recipientName: recipientName || customerUser?.name || 'Valued Patron',
      recipientPhone: recipientPhone || customerUser?.phone || '+91 98765 43210',
      street,
      landmark,
      city,
      state,
      pincode,
      country: 'India',
    };

    const itemsPayload = bagItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    try {
      const orderRes = await apiRequest('/customer/orders/create', {
        method: 'POST',
        data: {
          items: itemsPayload,
          shippingAddress,
          couponCode: appliedCoupon || undefined,
        },
      });

      clearBag();
      router.push(orderRes.trackingUrl || `/track/${orderRes.order?.orderNumber}`);
    } catch (e: any) {
      alert('Order creation failed: ' + (e.message || 'Please check items and try again.'));
      setIsOrderSubmitting(false);
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      <main style={{ maxWidth: '1240px', margin: '0 auto', paddingTop: '130px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px' }}>
        {/* Header Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>
              ROYAL ACQUISITIONS
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff', marginTop: '4px' }}>
              Your Handloom Sanctuary Bag
            </h1>
          </div>
          <Link href="/catalog" style={{ color: 'var(--gold)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
            ← Continue Exploring Sarees
          </Link>
        </div>

        {bagItems.length === 0 ? (
          /* Empty Bag State */
          <div
            style={{
              textAlign: 'center',
              padding: '80px 24px',
              background: 'var(--bg-deep)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
            }}
          >
            <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px' }}>👜</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#fff' }}>
              Your Bag is Currently Empty
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', maxWidth: '440px', margin: '12px auto 28px' }}>
              Explore our verified collections from Varanasi, Kanchipuram, Yeola, and Chanderi to acquire authentic handloom heirlooms.
            </p>
            <Link
              href="/catalog"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                background: 'var(--gold)',
                color: '#110c08',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Explore Master Weaves →
            </Link>
          </div>
        ) : (
          /* 2-Column Shopping Bag Layout */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '48px', alignItems: 'start' }}>
            {/* Left Column: Bag Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  {totalCount} {totalCount === 1 ? 'Handloom Piece' : 'Handloom Pieces'} Selected
                </span>
                <button
                  onClick={clearBag}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Clear Bag
                </button>
              </div>

              {bagItems.map((item) => {
                const p = item.product;
                return (
                  <div
                    key={p.id}
                    style={{
                      background: 'var(--bg-deep)',
                      border: '1px solid rgba(201, 168, 76, 0.2)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Link href={`/product/${p.slug}`}>
                      <img
                        src={p.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                        alt={p.name}
                        style={{ width: '100px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </Link>

                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 600 }}>
                          {p.sku}
                        </span>
                        {p.isHeirloom1of1 && (
                          <span style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(201, 168, 76, 0.2)', color: 'var(--gold)', borderRadius: '4px' }}>
                            👑 1-of-1 Heirloom
                          </span>
                        )}
                      </div>

                      <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 600, margin: '2px 0 4px' }}>
                          {p.name}
                        </h3>
                      </Link>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                        {p.craftRegion} • {p.fabric} • {p.zariType}
                      </p>

                      <strong style={{ fontSize: '1.15rem', color: 'var(--gold)', display: 'block' }}>
                        ₹{(p.sellingPrice * item.quantity).toLocaleString('en-IN')}
                      </strong>
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                          onClick={() => updateQuantity(p.id, item.quantity - 1)}
                          style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(p.id, item.quantity + 1)}
                          disabled={p.isHeirloom1of1}
                          style={{
                            width: '28px',
                            height: '28px',
                            background: 'transparent',
                            border: 'none',
                            color: p.isHeirloom1of1 ? 'var(--text-dim)' : '#fff',
                            fontSize: '1.1rem',
                            cursor: p.isHeirloom1of1 ? 'not-allowed' : 'pointer',
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
                          fontSize: '0.78rem',
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

            {/* Right Column: Order Summary & Checkout */}
            <div
              style={{
                background: 'var(--bg-deep)',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
                position: 'sticky',
                top: '120px',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                Acquisition Summary
              </h2>

              {/* Coupon Box */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Privilege Code / Coupon
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. VIRASAT10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: '#110c08',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                    }}
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    style={{
                      padding: '10px 18px',
                      background: 'rgba(201, 168, 76, 0.2)',
                      border: '1px solid var(--gold)',
                      borderRadius: '6px',
                      color: 'var(--gold)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Apply
                  </button>
                </div>

                {/* Quick Coupon Chips */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {['VIRASAT10', 'FIRSTHEIRLOOM', 'UTSAV20'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        setCouponCode(chip);
                        handleApplyCoupon(chip);
                      }}
                      style={{
                        padding: '3px 8px',
                        background: appliedCoupon === chip ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: appliedCoupon === chip ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: appliedCoupon === chip ? '#86efac' : 'var(--text-dim)',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {couponSuccess && (
                  <p style={{ color: '#86efac', fontSize: '0.8rem', marginTop: '8px' }}>{couponSuccess}</p>
                )}
                {couponError && (
                  <p style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: '8px' }}>{couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                  <span>Saree Subtotal</span>
                  <span style={{ color: '#fff' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                    <span>Privilege Discount ({appliedCoupon})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                  <span>Insured Bluedart Air Delivery</span>
                  <span style={{ color: 'var(--gold)' }}>COMPLIMENTARY</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
                <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>Total Acquisition</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)', fontWeight: 700 }}>
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Checkout Trigger Button */}
              <button
                onClick={handleStartCheckout}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#110c08',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(201, 168, 76, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                👑 Proceed to Secure Checkout →
              </button>

              <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                🛡️ Zero-risk acquisition • 4-digit drop OTP doorstep authentication
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 🔐 CHECKOUT MODAL: Step 1 = Login Check, Step 2 = PostgreSQL Address & Order Creation */}
      {isCheckoutOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1c150e 0%, #110c08 100%)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '36px 32px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Close Modal Button */}
            <button
              onClick={() => setIsCheckoutOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {/* Step 1: Customer Login Check */}
            {checkoutStep === 'AUTH' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    PATRON AUTHENTICATION
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#fff', marginTop: '4px' }}>
                    Sign In to Acquire Pieces
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Enter your email to receive a passwordless 6-digit access code
                  </p>
                </div>

                {authError && (
                  <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '16px' }}>
                    {authError}
                  </div>
                )}

                {!isOtpSent ? (
                  <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. patron@sutradara.in"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: '#0a0602',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.95rem',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      style={{
                        padding: '14px',
                        background: 'var(--gold)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#110c08',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: isAuthLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isAuthLoading ? 'Generating Code...' : 'Send Access OTP →'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {devOtpCode && (
                      <div style={{ padding: '10px 14px', background: 'rgba(201, 168, 76, 0.15)', border: '1px dashed var(--gold)', borderRadius: '6px', color: 'var(--gold)', fontSize: '0.82rem', textAlign: 'center' }}>
                        🔑 Instant Development OTP: <strong>{devOtpCode}</strong>
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                        Enter 6-Digit Code sent to {authEmail}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={authOtp}
                        onChange={(e) => setAuthOtp(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: '#0a0602',
                          border: '1px solid rgba(201, 168, 76, 0.4)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '1.2rem',
                          textAlign: 'center',
                          letterSpacing: '0.25em',
                          fontWeight: 700,
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      style={{
                        padding: '14px',
                        background: 'var(--gold)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#110c08',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: isAuthLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isAuthLoading ? 'Verifying...' : 'Verify & Continue to Checkout →'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      ← Change Email
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Step 2: Delivery Destination & Place Order */}
            {checkoutStep === 'ADDRESS' && (
              <div>
                <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    FINAL STEP: SECURE DISPATCH DESTINATION
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: '#fff', marginTop: '2px' }}>
                    Confirm Delivery Address
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Authenticated as <strong>{customerUser?.email}</strong>
                  </p>
                </div>

                <form onSubmit={handleConfirmOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ananya Deshmukh"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: '#0a0602', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Recipient Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98201 54321"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: '#0a0602', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Street Address &amp; House / Penthouse # *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="14, Altamount Road, Cumballa Hill"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: '#0a0602', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: '#0a0602', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Maharashtra"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: '#0a0602', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="400026"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: '#0a0602', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div style={{ padding: '12px 16px', background: 'rgba(201, 168, 76, 0.08)', borderRadius: '8px', border: '1px solid rgba(201, 168, 76, 0.2)', marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: '#fff' }}>Total Amount ({totalCount} items):</span>
                      <strong style={{ color: 'var(--gold)' }}>₹{finalTotal.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  {/* Confirm Place Order Button */}
                  <button
                    type="submit"
                    disabled={isOrderSubmitting}
                    style={{
                      marginTop: '10px',
                      padding: '16px',
                      background: 'var(--gold)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#110c08',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: isOrderSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 8px 24px rgba(201, 168, 76, 0.4)',
                    }}
                  >
                    {isOrderSubmitting ? 'Securing Acquisition in Database...' : '👑 Confirm Acquisition & Place Order'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
