'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DealCountdownBanner from '@/components/customer/storefront/DealCountdownBanner';
import { useCart } from '@/context/CartContext';

export default function LandingNavbar() {
  const [customer, setCustomer] = useState<{ name?: string; email?: string } | null>(null);
  const { totalCount } = useCart();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('customerUser');
      if (stored) {
        setCustomer(JSON.parse(stored));
      }
    } catch (e) {
      // Ignore
    }
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
        background: 'rgba(250, 248, 245, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 4px 20px rgba(45, 25, 8, 0.04)',
      }}
    >
      {/* Real-time Deal Countdown Ribbon */}
      <DealCountdownBanner />

      {/* Main Navbar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 36px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Brand Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
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
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '0.88rem' }}>
          <Link
            href="/"
            style={{ color: '#2d2218', textDecoration: 'none', letterSpacing: '0.04em', fontWeight: 600 }}
          >
            Home
          </Link>
          <Link
            href="/catalog"
            style={{ color: '#2d2218', textDecoration: 'none', letterSpacing: '0.04em', fontWeight: 500 }}
          >
            All Sarees
          </Link>
          <Link
            href="/categories"
            style={{ color: '#2d2218', textDecoration: 'none', letterSpacing: '0.04em', fontWeight: 500 }}
          >
            Categories
          </Link>
          <Link
            href="/collections"
            style={{ color: '#2d2218', textDecoration: 'none', letterSpacing: '0.04em', fontWeight: 500 }}
          >
            Collections
          </Link>
          <Link
            href="/about"
            style={{ color: '#2d2218', textDecoration: 'none', letterSpacing: '0.04em', fontWeight: 500 }}
          >
            Our Story
          </Link>

          {/* 👜 Luxury Shopping Bag Button */}
          <Link
            href="/bag"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: totalCount > 0 ? 'rgba(179, 137, 56, 0.15)' : '#ffffff',
              border: totalCount > 0 ? '1.5px solid var(--gold)' : '1px solid rgba(179, 137, 56, 0.25)',
              borderRadius: '20px',
              color: totalCount > 0 ? 'var(--gold)' : '#1a130d',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              boxShadow: '0 2px 8px rgba(45, 25, 8, 0.04)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>👜</span>
            <span>Bag</span>
            <span
              style={{
                background: totalCount > 0 ? 'var(--gold)' : 'rgba(0,0,0,0.08)',
                color: totalCount > 0 ? '#ffffff' : '#1a130d',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                  background: 'rgba(179, 137, 56, 0.1)',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(179, 137, 56, 0.3)',
                }}
              >
                <span>👤</span>
                <span>{customer.name || customer.email?.split('@')[0] || 'Sanctuary'}</span>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  padding: '4px 6px',
                }}
              >
                Sign Out
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
                borderRadius: '20px',
                fontSize: '0.82rem',
                boxShadow: '0 2px 10px rgba(179, 137, 56, 0.3)',
              }}
            >
              <span>👤</span>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}
