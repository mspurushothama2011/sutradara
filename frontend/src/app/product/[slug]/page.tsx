'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Product } from '../../../../../shared/types/index';
import LandingNavbar from '@/components/landing/LandingNavbar';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToBag, setBuyNowItem, totalCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('/frames/ezgif-frame-240.jpg');
  const [isLoading, setIsLoading] = useState(true);
  const [bagToast, setBagToast] = useState<string | null>(null);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<'AUTH' | 'ADDRESS' | 'SUCCESS'>('AUTH');

  // Auth Inputs (if not logged in)
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
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function loadProduct() {
      try {
        setIsLoading(true);
        const res = await apiRequest(`/products/${slug}`);
        if (res.product) {
          setProduct(res.product);
          if (res.product.images?.length) {
            setActiveImage(res.product.images[0]);
          }
        }
      } catch (e) {
        console.error('Failed to load product:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();

    // Check customer session
    try {
      const stored = localStorage.getItem('customerUser');
      if (stored) {
        setCustomerUser(JSON.parse(stored));
      }
    } catch (e) {
      // Ignore
    }
  }, [slug]);

  // Open Checkout Flow
  const handleOpenCheckout = async () => {
    const stored = localStorage.getItem('customerUser');
    const token = localStorage.getItem('accessToken') || localStorage.getItem('sutradara_token');

    if (stored && token) {
      const parsed = JSON.parse(stored);
      setCustomerUser(parsed);
      setRecipientName(parsed.name || '');
      setRecipientPhone(parsed.phone || '');
      setCheckoutStep('ADDRESS');
      setIsCheckoutOpen(true);

      // Load saved addresses
      try {
        const res = await apiRequest('/customer/auth/me');
        if (res.addresses && res.addresses.length > 0) {
          setSavedAddresses(res.addresses);
          setSelectedAddressIndex(0);
          const first = res.addresses[0];
          setRecipientName(first.recipientName || parsed.name || '');
          setRecipientPhone(first.recipientPhone || parsed.phone || '');
          setStreet(first.street || '');
          setLandmark(first.landmark || '');
          setCity(first.city || '');
          setState(first.state || '');
          setPincode(first.pincode || '');
        }
      } catch (e) {
        // Fallback
      }
    } else {
      // Not logged in -> Show Email OTP step
      setCheckoutStep('AUTH');
      setIsCheckoutOpen(true);
    }
  };

  // Send OTP during checkout
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const res = await apiRequest('/customer/auth/send-otp', {
        method: 'POST',
        data: { email: authEmail },
      });
      if (res.devOtp) {
        setDevOtpCode(res.devOtp);
      }
      setIsOtpSent(true);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send OTP.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Verify OTP during checkout
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const res = await apiRequest('/customer/auth/verify-otp', {
        method: 'POST',
        data: { email: authEmail, otp: authOtp },
      });

      if (res.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('customerUser', JSON.stringify(res.user));
        setCustomerUser(res.user);
        setRecipientName(res.user.name || '');
        setRecipientPhone(res.user.phone || '');
        setCheckoutStep('ADDRESS');

        if (res.addresses && res.addresses.length > 0) {
          setSavedAddresses(res.addresses);
          setSelectedAddressIndex(0);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Invalid verification code.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Apply Coupon Code
  const handleApplyCoupon = async () => {
    if (!couponCode || !product) return;
    try {
      const res = await apiRequest('/marketing/validate-coupon', {
        method: 'POST',
        data: { code: couponCode, cartTotal: product.sellingPrice },
      });
      if (res.valid) {
        setDiscountAmount(res.discountAmount);
        setCouponMessage(`✓ Code "${couponCode}" applied: ₹${res.discountAmount.toLocaleString('en-IN')} off!`);
      }
    } catch (err: any) {
      setDiscountAmount(0);
      setCouponMessage(`✕ ${err.message || 'Invalid coupon code.'}`);
    }
  };

  // Place Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!street || !city || !state || !pincode) {
      alert('Please fill in complete street, city, state, and 6-digit PIN code.');
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      alert('Please enter a valid 6-digit Indian postal PIN code.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const shippingAddress = {
        recipientName: recipientName || customerUser?.name || 'Valued Patron',
        recipientPhone: recipientPhone || customerUser?.phone || '+91 98765 43210',
        street: street.trim(),
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: 'India',
      };

      const res = await apiRequest('/customer/orders/create', {
        method: 'POST',
        data: {
          items: [{ productId: product.id, quantity: 1 }],
          shippingAddress,
          couponCode: discountAmount > 0 ? couponCode : undefined,
        },
      });

      if (res.order) {
        router.push(`/track/${res.order.orderNumber}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
        <p style={{ letterSpacing: '0.2em' }}>AUTHENTICATING LOOM PROVENANCE...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', textAlign: 'center', padding: '120px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Saree Not Found</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>This specific heirloom piece may have been acquired or relocated.</p>
        <Link href="/catalog" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', background: 'var(--gold)', color: '#110c08', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
          ← Return to Curated Catalog
        </Link>
      </div>
    );
  }

  const isSoldOut = product.stock <= 0;
  const finalPrice = Math.max(0, product.sellingPrice - discountAmount);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top Navigation */}
      <LandingNavbar />

      <div style={{ paddingTop: '120px', maxWidth: '1300px', margin: '0 auto', paddingLeft: '32px', paddingRight: '32px', paddingBottom: '100px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '32px' }}>
          <Link href="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/catalog" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>Curated Catalog</Link>
          <span>/</span>
          <Link href={`/catalog?craftRegion=${encodeURIComponent(product.craftRegion)}`} style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>{product.craftRegion}</Link>
          <span>/</span>
          <span style={{ color: 'var(--gold)' }}>{product.sku}</span>
        </div>

        {/* 2-Column Saree Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '64px' }}>
          {/* Left Column: Image Gallery */}
          <div>
            <div
              style={{
                position: 'relative',
                height: '560px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#0a0602',
                border: '1px solid rgba(201, 168, 76, 0.25)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
            >
              <img
                src={activeImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {product.isHeirloom1of1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    padding: '6px 14px',
                    background: 'rgba(26, 20, 14, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--gold)',
                    borderRadius: '6px',
                    color: 'var(--gold)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                  }}
                >
                  👑 1-OF-1 UNREPEATABLE HEIRLOOM
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: activeImage === img ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.15)',
                      padding: 0,
                      background: '#000',
                      cursor: 'pointer',
                    }}
                  >
                    <img src={img} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Provenance & Purchase Box */}
          <div>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              {product.craftRegion} LOOM CLUSTER • SKU: {product.sku}
            </span>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: '#fff', lineHeight: 1.25 }}>
              {product.name}
            </h1>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', margin: '20px 0 24px' }}>
              <span style={{ fontSize: '2rem', color: '#fff', fontWeight: 600 }}>
                ₹{product.sellingPrice.toLocaleString('en-IN')}
              </span>
              {product.comparePrice && (
                <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                  ₹{product.comparePrice.toLocaleString('en-IN')}
                </span>
              )}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                Inclusive of all taxes & nationwide insured shipping
              </span>
            </div>

            {/* 1-of-1 Heirloom Notice */}
            {product.isHeirloom1of1 && (
              <div
                style={{
                  background: 'rgba(201, 168, 76, 0.1)',
                  border: '1px solid rgba(201, 168, 76, 0.35)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                <h4 style={{ color: 'var(--gold)', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👑 Single-Piece Heritage Edition
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.5 }}>
                  This saree is an unrepeatable single piece woven on a master pit-loom. Once acquired, no identical duplicate will ever be produced.
                </p>
              </div>
            )}

            {/* Primary Action Buttons (Add to Bag + Direct Checkout) */}
            <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bagToast && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(201, 168, 76, 0.15)',
                    border: '1px solid var(--gold)',
                    borderRadius: '8px',
                    color: 'var(--gold)',
                    fontSize: '0.86rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{bagToast}</span>
                  <Link
                    href="/bag"
                    style={{
                      color: '#110c08',
                      background: 'var(--gold)',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                    }}
                  >
                    View Bag →
                  </Link>
                </div>
              )}

              {isSoldOut ? (
                <button
                  disabled
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    color: '#f87171',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'not-allowed',
                  }}
                >
                  Acquired / Sold Out
                </button>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
                  <button
                    onClick={() => {
                      addToBag(product, 1);
                      setBagToast(`👜 Added "${product.name}" to your luxury bag!`);
                      setTimeout(() => setBagToast(null), 5000);
                    }}
                    style={{
                      padding: '16px',
                      background: 'rgba(201, 168, 76, 0.1)',
                      border: '1px solid var(--gold)',
                      borderRadius: '8px',
                      color: 'var(--gold)',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>👜</span>
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={() => {
                      setBuyNowItem({ product, quantity: 1 });
                      router.push('/checkout');
                    }}
                    style={{
                      padding: '16px',
                      background: 'var(--gold)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#110c08',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(201, 168, 76, 0.4)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    👑 Buy Now →
                  </button>
                </div>
              )}
            </div>

            {/* 4 Pillars of Assurance */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                padding: '20px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                marginBottom: '32px',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem', color: '#fff' }}>🏛️ Silk Mark Verified</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Tag: {product.silkMarkNumber || 'SM-CSB-2026'}</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem', color: '#fff' }}>👑 1-of-1 Vault Record</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{product.isHeirloom1of1 ? 'Individual Piece' : 'Limited Loom Edition'}</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem', color: '#fff' }}>📹 20s Inspection Clip</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Pre-dispatch verification</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.82rem', color: '#fff' }}>📦 4-Digit Drop OTP</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Insured doorstep delivery</span>
              </div>
            </div>

            {/* Saree Specifications Table */}
            <div>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Weave & Fabric Provenance
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Fabric: </span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{product.fabric}</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Zari Type: </span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{product.zariType}</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Craft Region: </span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{product.craftRegion}</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Weave Style: </span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{product.weaveStyle || 'Traditional Pit Loom'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LUXURY INSTANT CHECKOUT DRAWER / MODAL */}
      {isCheckoutOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#150f0a',
              border: '1px solid var(--gold)',
              borderRadius: '16px',
              padding: '36px 32px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
              position: 'relative',
              color: '#fff',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsCheckoutOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '1.4rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                SUTRAಧಾರ CHECKOUT
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#fff', marginTop: '4px' }}>
                Acquiring Saree Piece
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                {product.name} (SKU: {product.sku})
              </p>
            </div>

            {/* STEP 1: CUSTOMER AUTH (If not signed in) */}
            {checkoutStep === 'AUTH' && (
              <div>
                {!isOtpSent ? (
                  <form onSubmit={handleSendOtp}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: 1.5 }}>
                      Please enter your email to receive a 6-digit verification code. Sign in is required only to confirm your delivery and 4-digit drop OTP.
                    </p>
                    {authError && (
                      <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '6px', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '16px' }}>
                        {authError}
                      </div>
                    )}
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. patron@royal.in"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(201, 168, 76, 0.3)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        marginBottom: '20px',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: 'var(--gold)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#110c08',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                      }}
                    >
                      {isAuthLoading ? 'Sending Verification Code...' : 'Send 6-Digit Verification Code →'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    {devOtpCode && (
                      <div style={{ padding: '12px', background: 'rgba(201, 168, 76, 0.15)', border: '1px solid var(--gold)', borderRadius: '6px', color: 'var(--gold)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        🔑 <strong>Development Verification Code:</strong> {devOtpCode}
                      </div>
                    )}
                    {authError && (
                      <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '6px', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '16px' }}>
                        {authError}
                      </div>
                    )}
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Enter 6-Digit Code Sent to {authEmail}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123456"
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(201, 168, 76, 0.3)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '1.2rem',
                        letterSpacing: '0.2em',
                        textAlign: 'center',
                        marginBottom: '20px',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: 'var(--gold)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#110c08',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                      }}
                    >
                      {isAuthLoading ? 'Verifying...' : 'Verify Code & Continue to Address →'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* STEP 2: DELIVERY ADDRESS & GIFTING DETAILS */}
            {checkoutStep === 'ADDRESS' && (
              <form onSubmit={handlePlaceOrder}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 600 }}>
                    1. Shipping & Recipient Details
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Signed in as: {customerUser?.email}
                  </span>
                </div>

                {/* Recipient info for gifting */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Recipient Name (or Self)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunita Verma"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Recipient Phone (for Drop OTP)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Street Address / Flat / Building</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Villa 4, Lotus Heritage Enclave, Outer Ring Road"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bengaluru"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>State</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Karnataka"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>PIN Code</label>
                    <input
                      type="text"
                      required
                      placeholder="6-digit PIN"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201, 168, 76, 0.2)', borderRadius: '8px', marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Apply Royal Privilege Code
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. VIRASAT10 or FIRSTHEIRLOOM"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      style={{ padding: '8px 16px', background: 'rgba(201, 168, 76, 0.2)', border: '1px solid var(--gold)', borderRadius: '6px', color: 'var(--gold)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && (
                    <span style={{ fontSize: '0.78rem', color: discountAmount > 0 ? '#4ade80' : '#f87171', display: 'block', marginTop: '6px' }}>
                      {couponMessage}
                    </span>
                  )}
                </div>

                {/* Order Summary & Final Total */}
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    <span>Saree Price:</span>
                    <span>₹{product.sellingPrice.toLocaleString('en-IN')}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4ade80', marginBottom: '6px' }}>
                      <span>Coupon Discount:</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                    <span>Insured Courier Delivery:</span>
                    <span style={{ color: '#4ade80' }}>COMPLIMENTARY</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', color: '#fff', fontWeight: 700, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span>Total Amount:</span>
                    <span style={{ color: 'var(--gold)' }}>₹{finalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPlacingOrder}
                  style={{
                    width: '100%',
                    padding: '16px',
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
                  }}
                >
                  {isPlacingOrder ? 'Confirming Vault Allocation...' : 'Confirm Acquisition & Place Order →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
