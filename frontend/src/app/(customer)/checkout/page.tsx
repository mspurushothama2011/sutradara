'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { apiRequest } from '@/lib/api';
import LandingNavbar from '@/components/landing/LandingNavbar';
import TurnstileCaptcha from '@/components/auth/TurnstileCaptcha';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { launchRazorpayCheckout } from '@/lib/razorpay';

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
  // Stock and submission state
  const [stockInfo, setStockInfo] = useState<LiveProductStock>({});
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [hasSoldOutItems, setHasSoldOutItems] = useState(false);
  const [raceConditionAlert, setRaceConditionAlert] = useState<string | null>(null);
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

  // Finalize order upon payment verification
  const commitPaymentVerification = async (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    items: { productId: string; quantity: number }[];
    shippingAddress: any;
    couponCode?: string;
  }) => {
    setIsSubmittingOrder(true);
    try {
      const verifyRes = await apiRequest('/customer/orders/razorpay/verify-payment', {
        method: 'POST',
        data: payload,
      });

      // Clear bag & buy now session
      clearBag();
      setBuyNowItem(null);

      // Redirect to live tracking
      router.push(verifyRes.trackingUrl || `/track/${verifyRes.order?.orderNumber}`);
    } catch (e: any) {
      setIsSubmittingOrder(false);
      if (e.code === 'OUT_OF_STOCK' || e.message?.includes('STOCK_UNAVAILABLE') || e.message?.includes('acquired by another patron')) {
        setRaceConditionAlert(`⚠️ Race Condition: ${e.message || 'An item was just acquired by another patron during final payment. Please return to your bag to adjust.'}`);
        checkLiveStock();
      } else {
        alert('Payment verification error: ' + (e.message || 'Failed to record transaction.'));
      }
    }
  };

  // Final Order Execution with Razorpay Payment Gateway
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
      // 1. Initialize Razorpay Order (validates prices and stock directly from PostgreSQL DB)
      const rzpInit = await apiRequest('/customer/orders/razorpay/create-order', {
        method: 'POST',
        data: {
          items: itemsPayload,
          couponCode: appliedCoupon || undefined,
        },
      });

      // 2. Launch Razorpay Standard Checkout SDK modal
      const launched = await launchRazorpayCheckout({
        keyId: rzpInit.keyId,
        amount: rzpInit.amountInPaise,
        currency: rzpInit.currency || 'INR',
        orderId: rzpInit.razorpayOrderId,
        description: `Acquisition of ${totalItemsCount} Handloom Piece(s)`,
        prefill: {
          name: recipientName || customerUser.name,
          email: customerUser.email,
          contact: recipientPhone || customerUser.phone,
        },
        onSuccess: async (rzpResponse) => {
          await commitPaymentVerification({
            razorpayOrderId: rzpResponse.razorpay_order_id,
            razorpayPaymentId: rzpResponse.razorpay_payment_id,
            razorpaySignature: rzpResponse.razorpay_signature,
            items: itemsPayload,
            shippingAddress,
            couponCode: appliedCoupon || undefined,
          });
        },
        onDismiss: () => {
          setIsSubmittingOrder(false);
        },
      });

      if (!launched) {
        setIsSubmittingOrder(false);
        alert('Could not initialize Razorpay checkout gateway. Please ensure popups/scripts are enabled.');
      }
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
        alert('Payment initialization failed: ' + (e.message || 'Database rejected order.'));
      }
    }
  };

  if (activeItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <LandingNavbar />
        <div style={{ paddingTop: '140px', textAlign: 'center', paddingLeft: '20px', paddingRight: '20px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>👑</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)' }}>No Items Selected for Acquisition</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: '8px', maxWidth: '480px', margin: '8px auto 0' }}>
            Please select an authentic handcrafted saree from our catalog or shopping bag to proceed with checkout.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
            <Link href="/catalog" style={{ padding: '12px 24px', background: 'var(--gold)', color: '#ffffff', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>
              Explore Master Weaves →
            </Link>
            <Link href="/bag" style={{ padding: '12px 24px', background: '#ffffff', border: '1px solid var(--gold)', color: 'var(--gold)', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
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
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
              HIGH-ASSURANCE HERITAGE ACQUISITION
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--text)', marginTop: '4px' }}>
              Master Checkout Sanctuary
            </h1>
          </div>
          <Link href="/bag" style={{ color: 'var(--gold)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
            ← Return to Shopping Bag
          </Link>
        </div>

        {/* Race Condition / Stock Alert Banner */}
        {raceConditionAlert && (
          <div style={{ marginBottom: '24px', padding: '16px 20px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', color: '#991b1b', fontSize: '0.9rem', lineHeight: 1.5 }}>
            <strong style={{ display: 'block', color: '#7f1d1d', marginBottom: '4px' }}>Acquisition Notice:</strong>
            {raceConditionAlert}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '32px', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: Steps 1 - 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* STEP 1: Customer Details Card */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(179, 137, 56, 0.25)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      1
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--text)' }}>
                      Customer Details &amp; Verification
                    </h3>
                  </div>
                  {customerUser && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--olive-deep)', background: 'var(--olive-glow)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--olive-border)', fontWeight: 600 }}>
                      ✓ Verified Customer
                    </span>
                  )}
                </div>

                {customerUser ? (
                  /* Logged-In Customer Card */
                  <div style={{ padding: '14px 18px', background: '#FAF8F5', borderRadius: '8px', border: '1px solid rgba(179, 137, 56, 0.25)' }}>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text)', fontWeight: 600 }}>
                      {customerUser.name || 'Valued Customer'}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {customerUser.email} • {customerUser.phone || '+91 98201 54321'}
                    </p>
                  </div>
                ) : (
                  /* Inline Guest OTP Verification */
                  <div style={{ padding: '16px', background: '#FAF8F5', borderRadius: '8px', border: '1px solid rgba(179, 137, 56, 0.2)' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                      Enter your email address to receive an instant 6-digit access code for secure checkout:
                    </p>

                    {authError && (
                      <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#b91c1c', fontSize: '0.8rem', marginBottom: '12px' }}>
                        {authError}
                      </div>
                    )}

                    {!isOtpSent ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <input
                            type="email"
                            placeholder="yourname@gmail.com"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            style={{ flex: '1 1 200px', padding: '10px 14px', background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.9rem' }}
                          />
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isAuthLoading || !turnstileToken}
                            style={{
                              padding: '10px 18px',
                              background: !turnstileToken ? 'rgba(179, 137, 56, 0.3)' : 'var(--gold)',
                              color: !turnstileToken ? 'var(--text-dim)' : '#ffffff',
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
                          <div style={{ flex: 1, height: '1px', background: 'rgba(179, 137, 56, 0.15)' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>or</span>
                          <div style={{ flex: 1, height: '1px', background: 'rgba(179, 137, 56, 0.15)' }} />
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
                          <div style={{ padding: '8px 12px', background: 'rgba(179, 137, 56, 0.12)', border: '1px dashed var(--gold)', borderRadius: '6px', color: 'var(--gold)', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>
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
                            style={{ flex: '1 1 160px', padding: '10px 14px', background: '#ffffff', border: '1px solid var(--gold)', borderRadius: '6px', color: 'var(--text)', fontSize: '1rem', letterSpacing: '0.2em', textAlign: 'center', fontWeight: 700 }}
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isAuthLoading}
                            style={{ padding: '10px 18px', background: 'var(--gold)', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 }}
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
                  background: '#ffffff',
                  border: '1px solid rgba(179, 137, 56, 0.25)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      2
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--text)' }}>
                      Delivery &amp; Shipping Destination
                    </h3>
                  </div>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                      style={{
                        background: isAddingNewAddress ? '#FAF8F5' : 'rgba(179, 137, 56, 0.12)',
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
                              background: isSelected ? 'rgba(179, 137, 56, 0.08)' : '#FAF8F5',
                              border: isSelected ? '2px solid var(--gold)' : '1px solid rgba(179, 137, 56, 0.2)',
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
                                <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 700 }}>
                                  ✓ Selected
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 600 }}>
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
                          color: locationNotice.startsWith('✓') ? '#15803d' : '#b91c1c',
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
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                          Recipient Full Name (Self or Gift) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sunita Verma"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                          Contact Phone Number (For delivery updates) *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98201 54321"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                        Door / Flat / Building No. &amp; Complete Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Flat 402, Royal Residency, 14th Main Road"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                        Landmark / Nearby Area (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Near Silk Board Junction / Behind Temple"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                          City / District *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Varanasi"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Uttar Pradesh"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
                          6-Digit PIN Code *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="e.g. 221001"
                          value={pincode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.85rem' }}
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
                    background: '#FAF8F5',
                    border: '1px solid var(--gold)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>📦</span>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.45 }}>
                    <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '2px' }}>
                      Delivery to this Address:
                    </strong>
                    Your order will be safely packaged and delivered directly to this address with complimentary insured express shipping.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Verified Product Details & Summary */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid rgba(179, 137, 56, 0.25)',
                borderRadius: '16px',
                padding: '24px 28px',
                position: 'sticky',
                top: '110px',
                boxShadow: '0 8px 30px rgba(26, 19, 13, 0.06)',
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text)', marginBottom: '16px', borderBottom: '1px solid rgba(179, 137, 56, 0.15)', paddingBottom: '12px' }}>
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
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(179, 137, 56, 0.2)', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 600 }}>
                            {p.sku}
                          </span>
                          {p.isHeirloom1of1 && (
                            <span style={{ fontSize: '0.62rem', background: 'rgba(179, 137, 56, 0.15)', color: 'var(--gold)', padding: '1px 4px', borderRadius: '3px', fontWeight: 600 }}>
                              1-of-1
                            </span>
                          )}
                          {/* Live Stock Indicator */}
                          {isSoldOut ? (
                            <span style={{ fontSize: '0.62rem', background: 'rgba(239, 68, 68, 0.15)', color: '#b91c1c', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                              🔴 Sold Out
                            </span>
                          ) : itemStock <= 2 ? (
                            <span style={{ fontSize: '0.62rem', background: 'rgba(201, 101, 23, 0.15)', color: '#c96517', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                              ⚡ Only {itemStock} left
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.62rem', background: 'rgba(20, 90, 82, 0.12)', color: '#145a52', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                              🟢 In Stock
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Qty: {item.quantity}</span>
                      </div>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text)', flexShrink: 0 }}>
                        ₹{(p.sellingPrice * item.quantity).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Section + "View Available Coupons" Button */}
              <div style={{ marginBottom: '20px', borderTop: '1px solid rgba(179, 137, 56, 0.15)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
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
                    style={{ flex: 1, padding: '9px 12px', background: '#FAF8F5', border: '1px solid rgba(179, 137, 56, 0.3)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.82rem', textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    style={{ padding: '9px 16px', background: 'rgba(179, 137, 56, 0.12)', border: '1px solid var(--gold)', borderRadius: '6px', color: 'var(--gold)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', flexShrink: 0 }}
                  >
                    Apply
                  </button>
                </div>

                {couponSuccess && <p style={{ color: '#15803d', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>{couponSuccess}</p>}
                {couponError && <p style={{ color: '#b91c1c', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>{couponError}</p>}
              </div>

              {/* Price Calculation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', borderBottom: '1px solid rgba(179, 137, 56, 0.15)', paddingBottom: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                  <span>Subtotal</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d', fontWeight: 600 }}>
                    <span>Discount ({appliedCoupon})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                  <span>Express Delivery</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>COMPLIMENTARY</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '22px' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600 }}>Total Acquisition</span>
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
                  background: hasSoldOutItems ? 'rgba(179, 137, 56, 0.3)' : 'var(--gold)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: isSubmittingOrder || hasSoldOutItems ? 'not-allowed' : 'pointer',
                  boxShadow: hasSoldOutItems ? 'none' : '0 8px 24px rgba(179, 137, 56, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                {isSubmittingOrder
                  ? 'Connecting to Razorpay...'
                  : hasSoldOutItems
                  ? '⚠️ Remove Sold Out Pieces'
                  : '💳 Confirm & Pay with Razorpay'}
              </button>

              <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.73rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span>🔒</span>
                <span>256-Bit Encrypted Razorpay Gateway • UPI, Cards &amp; NetBanking</span>
              </div>
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
              boxShadow: '0 24px 64px rgba(26, 19, 13, 0.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(179, 137, 56, 0.2)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
                  OFFERS &amp; COUPONS
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text)', marginTop: '2px' }}>
                  Available Coupons
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
                        background: isEligible ? '#FAF8F5' : '#f9f9f9',
                        border: isEligible
                          ? isCurrentlyApplied
                            ? '2px solid #15803d'
                            : '1px solid var(--gold)'
                          : '1px solid rgba(179, 137, 56, 0.15)',
                        borderRadius: '10px',
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
                              color: 'var(--gold)',
                              background: '#ffffff',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px dashed var(--gold)',
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
                              background: isCurrentlyApplied ? 'rgba(34, 197, 94, 0.15)' : 'var(--gold)',
                              border: isCurrentlyApplied ? '1px solid #15803d' : 'none',
                              color: isCurrentlyApplied ? '#15803d' : '#ffffff',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: isCurrentlyApplied ? 'default' : 'pointer',
                            }}
                          >
                            {isCurrentlyApplied ? '✓ Applied' : 'Apply Code'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: '#F4EFEA', padding: '4px 8px', borderRadius: '4px' }}>
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
                        <div style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(201, 101, 23, 0.1)', border: '1px solid rgba(201, 101, 23, 0.25)', borderRadius: '4px', color: '#c96517', fontSize: '0.72rem' }}>
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

