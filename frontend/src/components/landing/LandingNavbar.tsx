'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DealCountdownBanner from '@/components/storefront/DealCountdownBanner';
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
        background: 'linear-gradient(180deg, rgba(17, 12, 8, 0.96) 0%, rgba(17, 12, 8, 0.88) 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201, 168, 76, 0.2)',
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
          padding: '16px 36px',
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
                color: '#fff',
                display: 'block',
              }}
            >
              SUTRA<span style={{ color: 'var(--gold)', fontWeight: 600 }}>ಧಾರ</span>
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.35em',
                color: 'var(--gold)',
                textTransform: 'uppercase',
                display: 'block',
                marginTop: '-2px',
              }}
            >
              The Handloom Sanctuary
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '0.86rem' }}>
          <Link
            href="/catalog"
            style={{ color: '#e0d8cc', textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            Curated Sarees
          </Link>
          <Link
            href="/categories"
            style={{ color: '#e0d8cc', textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            Craft Clusters
          </Link>
          <Link
            href="/collections"
            style={{ color: '#e0d8cc', textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            Collections
          </Link>
          <Link
            href="/search"
            style={{ color: '#e0d8cc', textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            Search
          </Link>
          <Link
            href="/about"
            style={{ color: '#e0d8cc', textDecoration: 'none', letterSpacing: '0.04em' }}
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
              background: totalCount > 0 ? 'rgba(201, 168, 76, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: totalCount > 0 ? '1px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              color: totalCount > 0 ? 'var(--gold)' : '#e0d8cc',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              transition: 'all 0.2s ease',
            }}
          >
            <span>👜</span>
            <span>Bag</span>
            <span
              style={{
                background: totalCount > 0 ? 'var(--gold)' : 'rgba(255,255,255,0.2)',
                color: totalCount > 0 ? '#110c08' : '#fff',
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

          {/* Customer Auth State: Sign In vs Account Sanctuary */}
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
                  background: 'rgba(201, 168, 76, 0.1)',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
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
                color: 'var(--gold)',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
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
