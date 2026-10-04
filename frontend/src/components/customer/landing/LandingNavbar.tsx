'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function LandingNavbar() {
  const [customer, setCustomer] = useState<{ name?: string; email?: string } | null>(null);
  const [navLogoError, setNavLogoError] = useState(false);
  const { totalCount } = useCart();

  useEffect(() => {
    const syncCustomer = () => {
      try {
        const stored = localStorage.getItem('customerUser');
        const token = localStorage.getItem('accessToken');
        if (stored && token) {
          setCustomer(JSON.parse(stored));
        } else {
          setCustomer(null);
        }
      } catch (e) {
        setCustomer(null);
      }
    };

    syncCustomer();

    window.addEventListener('storage', syncCustomer);
    window.addEventListener('customer-auth-expired', syncCustomer);

    return () => {
      window.removeEventListener('storage', syncCustomer);
      window.removeEventListener('customer-auth-expired', syncCustomer);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('customerUser');
    setCustomer(null);
    window.location.href = '/';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(250, 248, 245, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 4px 20px rgba(45, 25, 8, 0.04)',
      }}
    >
      {/* Main Navbar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 36px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Brand Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          {!navLogoError ? (
            <img
              src="/logo-dark.png"
              alt="Sutradara Handloom Sarees"
              onError={() => setNavLogoError(true)}
              style={{
                maxHeight: '44px',
                maxWidth: '180px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.45rem',
                  letterSpacing: '0.18em',
                  color: '#1a130d',
                  fontWeight: 700,
                  display: 'block',
                }}
              >
                SUTRA<span style={{ color: 'var(--gold)', fontWeight: 800 }}>ಧಾರ</span>
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  letterSpacing: '0.28em',
                  color: 'var(--gold)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginTop: '-2px',
                  fontWeight: 600,
                }}
              >
                Authentic Handloom Sarees
              </span>
            </div>
          )}
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center', fontSize: '0.85rem' }}>
          <Link
            href="/"
            style={{ color: '#2d2218', textDecoration: 'none', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.78rem' }}
          >
            Home
          </Link>
          <Link
            href="/catalog"
            style={{ color: '#2d2218', textDecoration: 'none', letterSpacing: '0.05em', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.78rem' }}
          >
            All Sarees
          </Link>
          <Link
            href="/categories"
            style={{ color: '#2d2218', textDecoration: 'none', letterSpacing: '0.05em', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.78rem' }}
          >
            Categories
          </Link>
          <Link
            href="/collections"
            style={{ color: '#2d2218', textDecoration: 'none', letterSpacing: '0.05em', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.78rem' }}
          >
            Collections
          </Link>
          <Link
            href="/about"
            style={{ color: '#2d2218', textDecoration: 'none', letterSpacing: '0.05em', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.78rem' }}
          >
            Our Story
          </Link>

          {/* Luxury Shopping Bag Trigger */}
          <Link
            href="/bag"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              background: totalCount > 0 ? 'rgba(179, 137, 56, 0.12)' : '#ffffff',
              border: totalCount > 0 ? '1px solid var(--gold)' : '1px solid rgba(179, 137, 56, 0.25)',
              borderRadius: '3px',
              color: totalCount > 0 ? 'var(--gold)' : '#1a130d',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              transition: 'all 0.2s ease',
            }}
          >
            <ShoppingBag size={15} strokeWidth={1.5} />
            <span>Bag</span>
            <span
              style={{
                background: totalCount > 0 ? 'var(--gold)' : 'rgba(0,0,0,0.06)',
                color: totalCount > 0 ? '#ffffff' : '#1a130d',
                borderRadius: '2px',
                padding: '1px 6px',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {totalCount}
            </span>
          </Link>

          {/* Customer Auth State */}
          {customer ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                href="/account"
                style={{
                  color: 'var(--gold)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(179, 137, 56, 0.08)',
                  padding: '7px 12px',
                  borderRadius: '3px',
                  border: '1px solid rgba(179, 137, 56, 0.25)',
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <User size={14} strokeWidth={1.5} />
                <span>{customer.name || customer.email?.split('@')[0] || 'Patron'}</span>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <LogOut size={13} strokeWidth={1.5} />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                color: '#ffffff',
                background: 'var(--gold)',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '3px',
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                boxShadow: '0 2px 10px rgba(179, 137, 56, 0.25)',
              }}
            >
              <User size={14} strokeWidth={1.5} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}
