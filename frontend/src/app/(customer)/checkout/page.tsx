'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { apiRequest } from '@/lib/api';
import LandingNavbar from '@/components/landing/LandingNavbar';
import TurnstileCaptcha from '@/components/auth/TurnstileCaptcha';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

interface LiveProductStock {
  [productId: string]: {
    stock: number;
    isAvailable: boolean;
    name: string;
  };
}

export default function CommonCheckoutPage() {
  const router = useRouter();
  const { bagItems, buyNowItem, setBuyNowItem, clearBag } = useCart();

  // Active checkout items (Buy Now takes priority over general bag)
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Address & Shipping Inputs
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressLabel, setAddressLabel] = useState('Home');
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // Coupon State & Modal
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  // Live Stock State & Race Condition Alert
  const [stockInfo, setStockInfo] = useState<LiveProductStock>({});
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [hasSoldOutItems, setHasSoldOutItems] = useState(false);
  const [raceConditionAlert, setRaceConditionAlert] = useState<string | null>(null);

  // Payment Selection State
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
        try {
          const res = await apiRequest('/customer/auth/me');
          if (res.addresses && res.addresses.length > 0) {
            setSavedAddresses(res.addresses);
            const def = res.addresses.find((a: any) => a.isDefault) || res.addresses[0];
            if (def) {
              setSelectedAddressId(def.id);
              setRecipientName(def.recipientName || u.name || '');
              setRecipientPhone(def.recipientPhone || u.phone || '');
              setStreet(def.street || '');
              setLandmark(def.landmark || '');
              setCity(def.city || '');
              setState(def.state || '');
              setPincode(def.pincode || '');
              setIsAddingNewAddress(false);
            }
          } else {
            setSavedAddresses([]);
            setIsAddingNewAddress(true);
          }
        } catch (authErr) {
          // Token expired or invalid - reset to Step 1 verification
          localStorage.removeItem('accessToken');
          localStorage.removeItem('customerUser');
          setCustomerUser(null);
          setIsAddingNewAddress(true);
        }
      } else {
        setIsAddingNewAddress(true);
      }
    } catch (e) {
      setIsAddingNewAddress(true);
    }
  };

  // Live stock verification against PostgreSQL
  const checkLiveStock = async () => {
    if (activeItems.length === 0) return;
    setIsValidatingStock(true);
    try {
      const payload = {
        items: activeItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      await apiRequest('/customer/orders/validate-cart', {
        method: 'POST',
        data: payload,
      });

      const stockMap: LiveProductStock = {};
      let soldOutFound = false;

      for (const item of activeItems) {
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
    } catch (err: any) {
      console.warn('Stock validation notice:', err);
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
    loadCustomerData();
    checkLiveStock();
    fetchAvailableCoupons();
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

  // Inline OTP Auth Flow with Turnstile CAPTCHA Protection
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    if (!turnstileToken) {
      setAuthError('Please complete the security verification below.');
      return;
    }
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const res = await apiRequest('/customer/auth/send-otp', {
        method: 'POST',
        data: { email: authEmail, turnstileToken },
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
      localStorage.setItem('customerUser', JSON.stringify(res.user));
      setCustomerUser(res.user);
      setRecipientName(res.user.name || '');
      setRecipientPhone(res.user.phone || '');

      await loadCustomerData();
    } catch (e: any) {
      setAuthError(e.message || 'Invalid verification code.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const res = await apiRequest('/customer/auth/google', {
        method: 'POST',
        data: { idToken },
      });

      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('customerUser', JSON.stringify(res.user));
      setCustomerUser(res.user);
      setRecipientName(res.user.name || '');
      setRecipientPhone(res.user.phone || '');

      await loadCustomerData();
    } catch (e: any) {
      setAuthError(e.message || 'Google authentication failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Instant India Post PIN Code Validation & Auto-Fill
  const handlePincodeChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setPincode(cleaned);

    if (cleaned.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
        const data = await res.json();
        if (
          Array.isArray(data) &&
          data[0] &&
          data[0].Status === 'Success' &&
          data[0].PostOffice &&
          data[0].PostOffice.length > 0
        ) {
          const po = data[0].PostOffice[0];
          if (po.District) setCity(po.District);
          if (po.State) setState(po.State);
          setLocationNotice(`✓ PIN Code verified: ${po.District}, ${po.State}`);
        }
      } catch (err) {
        console.warn('Pincode lookup error:', err);
      }
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

  // Save new address to PostgreSQL
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
      // Non-blocking
    }
  };

  // Final Order Execution against PostgreSQL with Race Condition Handling
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setRaceConditionAlert(null);

    if (!customerUser || (typeof window !== 'undefined' && !localStorage.getItem('accessToken'))) {
      alert('Please enter your email and verify your 6-digit access code in Step 1 before placing your order.');
      setCustomerUser(null);
      setIsAddingNewAddress(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!street || !city || !state || !pincode) {
      alert('Please fill all delivery address fields including 6-digit PIN code.');
      return;
    }

    if (activeItems.length === 0) {
      alert('No items selected for acquisition.');
      return;
    }

    if (hasSoldOutItems) {
      alert('One or more items in your order are currently sold out. Please review your bag.');
      return;
    }

    setIsSubmittingOrder(true);

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

      // Redirect to live tracking
      router.push(orderRes.trackingUrl || `/track/${orderRes.order?.orderNumber}`);
    } catch (e: any) {
      setIsSubmittingOrder(false);
      if (e.message?.includes('token') || e.message?.includes('401') || e.message?.includes('Authentication')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('customerUser');
        setCustomerUser(null);
        setAuthError('Your verification session expired. Please enter your email and 6-digit code in Step 1 to complete your order.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.code === 'OUT_OF_STOCK' || e.message?.includes('STOCK_UNAVAILABLE') || e.message?.includes('acquired by another patron')) {
        setRaceConditionAlert(`⚠️ Race Condition: ${e.message || 'An item was just acquired by another patron during final payment. Please return to your bag to adjust.'}`);
        checkLiveStock();
      } else {
        alert('Order placement failed: ' + (e.message || 'Database rejected order.'));
      }
    }
  };

  if (activeItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>
        <LandingNavbar />
        <div style={{ paddingTop: '140px', textAlign: 'center', paddingLeft: '20px', paddingRight: '20px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>👑</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>No Items Selected for Acquisition</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: '8px', maxWidth: '480px', margin: '8px auto 0' }}>
            Please select an authentic handcrafted saree from our catalog or shopping bag to proceed with checkout.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
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

      <main style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '110px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
        {/* Header Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
              HIGH-ASSURANCE HERITAGE ACQUISITION
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: '#fff', marginTop: '4px' }}>
              Master Checkout Sanctuary
            </h1>
          </div>
          <Link href="/bag" style={{ color: 'var(--gold)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
            ← Return to Shopping Bag
          </Link>
        </div>

        {/* Race Condition / Stock Alert Banner */}
        {raceConditionAlert && (
          <div style={{ marginBottom: '24px', padding: '16px 20px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.9rem', lineHeight: 1.5 }}>
            <strong style={{ display: 'block', color: '#fff', marginBottom: '4px' }}>Acquisition Notice:</strong>
            {raceConditionAlert}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '32px', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: Steps 1 - 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* STEP 1: Patron Identity Card */}
              <div
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold)', color: '#110c08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      1
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#fff' }}>
                      Patron Details &amp; Verification
                    </h3>
                  </div>
                  {customerUser && (
                    <span style={{ fontSize: '0.72rem', color: '#4ade80', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
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
                  <div style={{ padding: '16px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                      Enter your email address to receive an instant 6-digit access code for secure checkout:
                    </p>

                    {authError && (
                      <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#fca5a5', fontSize: '0.8rem', marginBottom: '12px' }}>
                        {authError}
                      </div>
                    )}

                    {!isOtpSent ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <input
                            type="email"
                            placeholder="patron@sutradara.in"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            style={{ flex: '1 1 200px', padding: '10px 14px', background: '#110c08', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                          />
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isAuthLoading || !turnstileToken}
                            style={{
                              padding: '10px 18px',
                              background: !turnstileToken ? 'rgba(201, 168, 76, 0.3)' : 'var(--gold)',
                              color: !turnstileToken ? 'var(--text-dim)' : '#110c08',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: !turnstileToken || isAuthLoading ? 'not-allowed' : 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            {isAuthLoading ? 'Sending...' : 'Send OTP'}
                          </button>
                        </div>

                        {/* Turnstile CAPTCHA */}
                        <TurnstileCaptcha
                          onVerify={(token) => setTurnstileToken(token)}
                          onExpire={() => setTurnstileToken(null)}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>or</span>
                          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                        </div>

                        {/* Google Auth Button */}
                        <GoogleAuthButton
                          text="continue_with"
                          onSuccess={handleGoogleSuccess}
                          onError={() => setAuthError('Google sign-in failed.')}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {devOtpCode && (
                          <div style={{ padding: '8px 12px', background: 'rgba(201, 168, 76, 0.15)', border: '1px dashed var(--gold)', borderRadius: '6px', color: 'var(--gold)', fontSize: '0.8rem', textAlign: 'center' }}>
                            🔑 Instant Local Verification OTP: <strong>{devOtpCode}</strong>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="6-digit OTP"
                            value={authOtp}
                            onChange={(e) => setAuthOtp(e.target.value)}
                            style={{ flex: '1 1 160px', padding: '10px 14px', background: '#110c08', border: '1px solid var(--gold)', borderRadius: '6px', color: '#fff', fontSize: '1rem', letterSpacing: '0.2em', textAlign: 'center', fontWeight: 700 }}
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isAuthLoading}
                            style={{ padding: '10px 18px', background: 'var(--gold)', color: '#110c08', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 }}
                          >
                            {isAuthLoading ? 'Verifying...' : 'Verify OTP'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 2: Delivery & Shipping Destination */}
              <div
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold)', color: '#110c08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      2
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#fff' }}>
                      Delivery &amp; Shipping Destination
                    </h3>
                  </div>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                      style={{
                        background: isAddingNewAddress ? 'rgba(255,255,255,0.08)' : 'rgba(201, 168, 76, 0.15)',
                        border: '1px solid var(--gold)',
                        color: 'var(--gold)',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {isAddingNewAddress ? '📋 Choose Saved Address' : '+ Add New Address'}
                    </button>
                  )}
                </div>

                {/* Saved Address Cards Selection */}
                {!isAddingNewAddress && savedAddresses.length > 0 ? (
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                      Select a saved delivery destination or add a new one:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            style={{
                              padding: '14px 16px',
                              background: isSelected ? 'rgba(201, 168, 76, 0.15)' : 'rgba(0,0,0,0.4)',
                              border: isSelected ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              position: 'relative',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase' }}>
                                📍 {addr.label || 'Home'}
                              </span>
                              {isSelected && (
                                <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 700 }}>
                                  ✓ Selected
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
                  </div>
                ) : (
                  /* New Address & Shipping Entry Form */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {locationNotice && (
                      <div
                        style={{
                          padding: '10px 14px',
                          background: locationNotice.startsWith('✓') ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          border: locationNotice.startsWith('✓') ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                          borderRadius: '8px',
                          color: locationNotice.startsWith('✓') ? '#86efac' : '#fca5a5',
                          fontSize: '0.8rem',
                          lineHeight: 1.4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span>{locationNotice.startsWith('✓') ? '✅' : '📌'}</span>
                        <span>{locationNotice}</span>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Recipient Full Name (Self or Gift) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sunita Verma"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', background: '#0a0602', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Contact Phone Number (For delivery updates) *
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
                        Door / Flat / Building No. &amp; Complete Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Flat 402, Royal Residency, 14th Main Road"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: '#0a0602', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Landmark / Nearby Area (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Near Silk Board Junction / Behind Temple"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: '#0a0602', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                          City / District *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Varanasi"
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
                          placeholder="e.g. Uttar Pradesh"
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
                          maxLength={6}
                          placeholder="e.g. 221001"
                          value={pincode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', background: '#0a0602', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Explicit Customer Order Delivery Notice */}
                <div
                  style={{
                    marginTop: '16px',
                    padding: '14px 18px',
                    background: 'rgba(201, 168, 76, 0.08)',
                    border: '1px solid var(--gold)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>📦</span>
                  <div style={{ fontSize: '0.82rem', color: '#fff', lineHeight: 1.45 }}>
                    <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '2px' }}>
                      Delivery to this Address:
                    </strong>
                    Your order will be safely packaged and delivered directly to this address with complimentary insured express shipping.
                  </div>
                </div>
              </div>

              {/* STEP 3: Sovereign Payment Gateway */}
              <div
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold)', color: '#110c08', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                    3
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#fff' }}>
                    Sovereign Payment Gateway
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label
                    style={{
                      padding: '12px 16px',
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
                      <strong style={{ display: 'block', color: '#fff', fontSize: '0.88rem' }}>
                        💳 Razorpay Sovereign Checkout (UPI / Cards / NetBanking)
                      </strong>
                      <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                        256-bit encrypted gateway with instant webhook confirmation
                      </span>
                    </div>
                  </label>

                  <label
                    style={{
                      padding: '12px 16px',
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
                      <strong style={{ display: 'block', color: '#fff', fontSize: '0.88rem' }}>
                        🏛️ Direct Heritage Bank Wire (RTGS / NEFT)
                      </strong>
                      <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                        Direct allocation from Sutraಧಾರ Treasury
                      </span>
                    </div>
                  </label>
                </div>

                <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(201, 168, 76, 0.08)', borderRadius: '6px', border: '1px dashed rgba(201, 168, 76, 0.3)', fontSize: '0.75rem', color: 'var(--gold)' }}>
                  ⚡ <strong>Development Bypass Mode:</strong> Instant order placement with atomic PostgreSQL stock decrement and live order number generation.
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Verified Product Details & Summary */}
            <div
              style={{
                background: 'var(--bg-deep)',
                border: '1px solid rgba(201, 168, 76, 0.35)',
                borderRadius: '16px',
                padding: '24px 28px',
                position: 'sticky',
                top: '110px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#fff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                Acquisition Summary ({totalItemsCount})
              </h2>

              {/* Verified Product Cards with Live Stock Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {activeItems.map((item) => {
                  const p = item.product;
                  const itemStock = stockInfo[p.id]?.stock ?? p.stock;
                  const isSoldOut = itemStock < item.quantity || itemStock === 0;

                  return (
                    <div key={p.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', opacity: isSoldOut ? 0.6 : 1 }}>
                      <img
                        src={p.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                        alt={p.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--gold)' }}>
                            {p.sku}
                          </span>
                          {p.isHeirloom1of1 && (
                            <span style={{ fontSize: '0.62rem', background: 'rgba(201,168,76,0.2)', color: 'var(--gold)', padding: '1px 4px', borderRadius: '3px' }}>
                              1-of-1
                            </span>
                          )}
                          {/* Live Stock Indicator */}
                          {isSoldOut ? (
                            <span style={{ fontSize: '0.62rem', background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                              🔴 Sold Out
                            </span>
                          ) : itemStock <= 2 ? (
                            <span style={{ fontSize: '0.62rem', background: 'rgba(234, 179, 8, 0.2)', color: '#fef08a', padding: '1px 5px', borderRadius: '3px' }}>
                              ⚡ Only {itemStock} left
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.62rem', background: 'rgba(34, 197, 94, 0.15)', color: '#86efac', padding: '1px 5px', borderRadius: '3px' }}>
                              🟢 In Stock
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '0.85rem', color: '#fff', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Qty: {item.quantity}</span>
                      </div>
                      <strong style={{ fontSize: '0.92rem', color: '#fff', flexShrink: 0 }}>
                        ₹{(p.sellingPrice * item.quantity).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Section + "View Available Coupons" Button */}
              <div style={{ marginBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
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
                    style={{ flex: 1, padding: '9px 12px', background: '#110c08', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem', textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    style={{ padding: '9px 16px', background: 'rgba(201, 168, 76, 0.2)', border: '1px solid var(--gold)', borderRadius: '6px', color: 'var(--gold)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', flexShrink: 0 }}
                  >
                    Apply
                  </button>
                </div>

                {couponSuccess && <p style={{ color: '#86efac', fontSize: '0.75rem', marginTop: '6px' }}>{couponSuccess}</p>}
                {couponError && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: '6px' }}>{couponError}</p>}
              </div>

              {/* Price Calculation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '14px' }}>
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
                  <span>Express Delivery</span>
                  <span style={{ color: 'var(--gold)' }}>COMPLIMENTARY</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '22px' }}>
                <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>Total Acquisition</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', fontWeight: 700 }}>
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Confirm Acquisition Button */}
              <button
                type="submit"
                disabled={isSubmittingOrder || hasSoldOutItems}
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
                  cursor: isSubmittingOrder || hasSoldOutItems ? 'not-allowed' : 'pointer',
                  boxShadow: hasSoldOutItems ? 'none' : '0 8px 24px rgba(201, 168, 76, 0.4)',
                }}
              >
                {isSubmittingOrder
                  ? 'Securing Acquisition...'
                  : hasSoldOutItems
                  ? '⚠️ Remove Sold Out Pieces'
                  : '👑 Confirm Acquisition & Place Order'}
              </button>
            </div>
          </div>
        </form>
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

                      {/* Greying-out reason notification */}
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
