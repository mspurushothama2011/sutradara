'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { apiRequest } from '@/lib/api';
import LandingNavbar from '@/components/landing/LandingNavbar';

export default function CommonCheckoutPage() {
  const router = useRouter();
  const { bagItems, buyNowItem, setBuyNowItem, clearBag } = useCart();

  // Determine active checkout items (Buy Now takes priority over general bag)
  const activeItems = buyNowItem ? [buyNowItem] : bagItems;

  // Customer session state
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Auth Inputs (for guest patron verification)
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Address Inputs (New address form)
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressLabel, setAddressLabel] = useState('Home');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Payment Selection State (Simulated)
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'BANK_TRANSFER'>('RAZORPAY');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Compute Totals
  const subtotal = activeItems.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );
  const totalItemsCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Check customer login session & fetch saved addresses
  const loadCustomerData = async () => {
    try {
      const stored = localStorage.getItem('customerUser');
      if (stored) {
        const u = JSON.parse(stored);
        setCustomerUser(u);
        setRecipientName(u.name || '');
        setRecipientPhone(u.phone || '');

        // Fetch saved addresses from PostgreSQL
        const res = await apiRequest('/customer/auth/me');
        if (res.customer?.addresses && res.customer.addresses.length > 0) {
          setSavedAddresses(res.customer.addresses);
          const def = res.customer.addresses.find((a: any) => a.isDefault) || res.customer.addresses[0];
          if (def) {
            setSelectedAddressId(def.id);
            setRecipientName(def.recipientName || u.name || '');
            setRecipientPhone(def.recipientPhone || u.phone || '');
            setStreet(def.street || '');
            setLandmark(def.landmark || '');
            setCity(def.city || '');
            setState(def.state || '');
            setPincode(def.pincode || '');
          }
        } else {
          setIsAddingNewAddress(true);
        }
      } else {
        setIsAddingNewAddress(true);
      }
    } catch (e) {
      setIsAddingNewAddress(true);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  // Select a saved address
  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setIsAddingNewAddress(false);
    setRecipientName(addr.recipientName || customerUser?.name || '');
    setRecipientPhone(addr.recipientPhone || customerUser?.phone || '');
    setStreet(addr.street || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPincode(addr.pincode || '');
  };

  // Inline OTP Auth Flow
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

      // Load saved addresses after verification
      await loadCustomerData();
    } catch (e: any) {
      setAuthError(e.message || 'Invalid verification code.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Coupon Validation
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

  // Save new address to PostgreSQL if authenticated
  const handleSaveNewAddressToDb = async () => {
    if (!customerUser || !street || !city || !state || !pincode) return;
    try {
      await apiRequest('/customer/auth/address', {
        method: 'POST',
        data: {
          recipientName: recipientName || customerUser.name,
          recipientPhone: recipientPhone || customerUser.phone,
          street,
          landmark,
          city,
          state,
          pincode,
          label: addressLabel,
          isDefault: savedAddresses.length === 0,
        },
      });
      await loadCustomerData();
    } catch (e) {
      // Continue even if address saving fails
    }
  };

  // Final Order Execution against PostgreSQL
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerUser) {
      alert('Please complete patron verification to proceed.');
      return;
    }

    if (!street || !city || !state || !pincode) {
      alert('Please complete all delivery destination fields.');
      return;
    }

    if (activeItems.length === 0) {
      alert('No items selected for acquisition.');
      return;
    }

    setIsSubmittingOrder(true);

    // Save address if adding new
    if (isAddingNewAddress) {
      await handleSaveNewAddressToDb();
    }

    const shippingAddress = {
      recipientName: recipientName || customerUser.name || 'Valued Patron',
      recipientPhone: recipientPhone || customerUser.phone || '+91 98765 43210',
      street,
      landmark,
      city,
      state,
      pincode,
      country: 'India',
    };

    const itemsPayload = activeItems.map((item) => ({
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

      // Clear bag & buy now session
      clearBag();
      setBuyNowItem(null);

      // Redirect to live satellite delivery tracking
      router.push(orderRes.trackingUrl || `/track/${orderRes.order?.orderNumber}`);
    } catch (e: any) {
      alert('Order placement failed: ' + (e.message || 'Database rejected order.'));
      setIsSubmittingOrder(false);
    }
  };

  if (activeItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>
        <LandingNavbar />
        <div style={{ paddingTop: '140px', textAlign: 'center', paddingLeft: '24px', paddingRight: '24px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>👑</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>No Items Selected for Acquisition</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>
            Please select a handcrafted saree from our catalog or shopping bag to proceed with checkout.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
            <Link href="/catalog" style={{ padding: '12px 24px', background: 'var(--gold)', color: '#110c08', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>
              Explore Master Weaves →
            </Link>
            <Link href="/bag" style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
              View Bag
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

      <main style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '130px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px' }}>
        {/* Header Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>
              HIGH-ASSURANCE HERITAGE ACQUISITION
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff', marginTop: '4px' }}>
              Master Checkout Sanctuary
            </h1>
          </div>
          <Link href="/bag" style={{ color: 'var(--gold)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
            ← Return to Shopping Bag
          </Link>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '48px', alignItems: 'start' }}>
            {/* Left Column: Customer Details, Addresses, Shipping & Payment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Step 1: Customer Identity Card */}
              <div
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: '12px',
                  padding: '24px 28px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold)', color: '#110c08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      1
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff' }}>
                      Patron Details &amp; Verification
                    </h3>
                  </div>
                  {customerUser && (
                    <span style={{ fontSize: '0.75rem', color: '#4ade80', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                      ✓ Verified Patron
                    </span>
                  )}
                </div>

                {customerUser ? (
                  /* Logged-In Patron Card */
                  <div style={{ padding: '14px 18px', background: 'rgba(201, 168, 76, 0.08)', borderRadius: '8px', border: '1px solid rgba(201, 168, 76, 0.2)' }}>
                    <p style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 600 }}>
                      {customerUser.name || 'Valued Patron'}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {customerUser.email} • {customerUser.phone || '+91 98201 54321'}
                    </p>
                  </div>
                ) : (
                  /* Inline Guest OTP Verification */
                  <div style={{ padding: '18px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
                      Enter your email address to receive an instant 6-digit access code for secure checkout:
                    </p>

                    {authError && (
                      <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#fca5a5', fontSize: '0.8rem', marginBottom: '12px' }}>
                        {authError}
                      </div>
                    )}

                    {!isOtpSent ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="email"
                          placeholder="patron@sutradara.in"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          style={{ flex: 1, padding: '10px 14px', background: '#110c08', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                        />
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isAuthLoading}
                          style={{ padding: '10px 18px', background: 'var(--gold)', color: '#110c08', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          {isAuthLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {devOtpCode && (
                          <div style={{ padding: '8px 12px', background: 'rgba(201, 168, 76, 0.15)', border: '1px dashed var(--gold)', borderRadius: '6px', color: 'var(--gold)', fontSize: '0.8rem', textAlign: 'center' }}>
                            🔑 Instant Development OTP: <strong>{devOtpCode}</strong>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            value={authOtp}
                            onChange={(e) => setAuthOtp(e.target.value)}
                            style={{ flex: 1, padding: '10px 14px', background: '#110c08', border: '1px solid var(--gold)', borderRadius: '6px', color: '#fff', fontSize: '1rem', letterSpacing: '0.2em', textAlign: 'center', fontWeight: 700 }}
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isAuthLoading}
                            style={{ padding: '10px 18px', background: 'var(--gold)', color: '#110c08', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                          >
                            {isAuthLoading ? 'Verifying...' : 'Verify OTP'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Delivery Destination & Saved Addresses */}
              <div
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: '12px',
                  padding: '24px 28px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold)', color: '#110c08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      2
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff' }}>
                      Delivery Destination &amp; Gifting Details
                    </h3>
                  </div>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--gold)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {isAddingNewAddress ? 'Use Saved Address' : '+ Add New Address'}
                    </button>
                  )}
                </div>

                {/* Saved Address Cards Grid */}
                {!isAddingNewAddress && savedAddresses.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          style={{
                            padding: '14px 18px',
                            background: isSelected ? 'rgba(201, 168, 76, 0.15)' : 'rgba(0,0,0,0.4)',
                            border: isSelected ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase' }}>
                              📍 {addr.label || 'Home'}
                            </span>
                            {addr.isDefault && (
                              <span style={{ fontSize: '0.65rem', background: 'rgba(201,168,76,0.2)', color: 'var(--gold)', padding: '2px 6px', borderRadius: '4px' }}>
                                Default
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600 }}>
                            {addr.recipientName || customerUser?.name}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px', lineHeight: 1.4 }}>
                            {addr.street}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                            📞 {addr.recipientPhone || customerUser?.phone}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* New Address Entry Form */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Recipient Name (Self or Gift) *
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
                          Recipient Phone (Drop OTP) *
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
                          6-Digit PIN Code *
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
                  </div>
                )}
              </div>

              {/* Step 3: Shipping Logistics (Preserved Architecture) */}
              <div
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: '12px',
                  padding: '24px 28px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold)', color: '#110c08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                    3
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff' }}>
                    High-Assurance Logistics &amp; Courier Protocol
                  </h3>
                </div>

                <div style={{ padding: '16px 20px', background: 'rgba(201, 168, 76, 0.08)', borderRadius: '8px', border: '1px solid var(--gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', color: '#fff', fontSize: '0.92rem' }}>
                      ✈️ Bluedart Apex Air Express (Sealed Heritage Trunk)
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
                      Pre-dispatch 20s ultra-HD inspection + 4-Digit Secure Drop OTP doorstep authentication
                    </span>
                  </div>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                    FREE
                  </span>
                </div>
              </div>

              {/* Step 4: Payment Method (Preserved Architecture) */}
              <div
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: '12px',
                  padding: '24px 28px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold)', color: '#110c08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                    4
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff' }}>
                    Sovereign Payment Gateway
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label
                    style={{
                      padding: '14px 18px',
                      background: paymentMethod === 'RAZORPAY' ? 'rgba(201, 168, 76, 0.15)' : 'rgba(0,0,0,0.4)',
                      border: paymentMethod === 'RAZORPAY' ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                    />
                    <div>
                      <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>
                        💳 Razorpay Sovereign Checkout (Instant UPI / Cards / NetBanking)
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        256-bit encrypted bank checkout with live webhook confirmation
                      </span>
                    </div>
                  </label>

                  <label
                    style={{
                      padding: '14px 18px',
                      background: paymentMethod === 'BANK_TRANSFER' ? 'rgba(201, 168, 76, 0.15)' : 'rgba(0,0,0,0.4)',
                      border: paymentMethod === 'BANK_TRANSFER' ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                    />
                    <div>
                      <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>
                        🏛️ Direct Heritage Bank Wire (RTGS / NEFT)
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Direct allocation from Sutraಧಾರ Treasury
                      </span>
                    </div>
                  </label>
                </div>

                <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(201, 168, 76, 0.08)', borderRadius: '6px', border: '1px dashed rgba(201, 168, 76, 0.3)', fontSize: '0.78rem', color: 'var(--gold)' }}>
                  ⚡ <strong>Development Simulation Mode Active:</strong> Payment and Shiprocket locks are bypassed for instant testing. Order status is immediately saved as `PAID` with stock decrement in PostgreSQL.
                </div>
              </div>
            </div>

            {/* Right Column: Verified Product Details & Final Acquisition */}
            <div
              style={{
                background: 'var(--bg-deep)',
                border: '1px solid rgba(201, 168, 76, 0.35)',
                borderRadius: '16px',
                padding: '32px',
                position: 'sticky',
                top: '120px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
                Acquisition Summary ({totalItemsCount})
              </h2>

              {/* Verified Product Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {activeItems.map((item) => {
                  const p = item.product;
                  return (
                    <div key={p.id} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <img
                        src={p.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                        alt={p.name}
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--gold)' }}>
                            {p.sku}
                          </span>
                          {p.isHeirloom1of1 && (
                            <span style={{ fontSize: '0.62rem', background: 'rgba(201,168,76,0.2)', color: 'var(--gold)', padding: '1px 4px', borderRadius: '3px' }}>
                              1-of-1
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '0.88rem', color: '#fff', marginTop: '2px' }}>{p.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Qty: {item.quantity}</span>
                      </div>
                      <strong style={{ fontSize: '0.95rem', color: '#fff' }}>
                        ₹{(p.sellingPrice * item.quantity).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Box */}
              <div style={{ marginBottom: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Privilege Code
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="VIRASAT10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', background: '#110c08', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    style={{ padding: '10px 16px', background: 'rgba(201, 168, 76, 0.2)', border: '1px solid var(--gold)', borderRadius: '6px', color: 'var(--gold)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    Apply
                  </button>
                </div>

                {couponSuccess && <p style={{ color: '#86efac', fontSize: '0.78rem', marginTop: '6px' }}>{couponSuccess}</p>}
                {couponError && <p style={{ color: '#fca5a5', fontSize: '0.78rem', marginTop: '6px' }}>{couponError}</p>}
              </div>

              {/* Price Calculation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                  <span>Subtotal</span>
                  <span style={{ color: '#fff' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                    <span>Discount ({appliedCoupon})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                  <span>Insured Delivery</span>
                  <span style={{ color: 'var(--gold)' }}>COMPLIMENTARY</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
                <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>Total Acquisition</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)', fontWeight: 700 }}>
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Confirm Acquisition Button */}
              <button
                type="submit"
                disabled={isSubmittingOrder}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#110c08',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: isSubmittingOrder ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(201, 168, 76, 0.4)',
                }}
              >
                {isSubmittingOrder ? 'Securing Acquisition...' : '👑 Confirm Acquisition & Place Order'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
