'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DealCountdownBanner from '@/components/storefront/DealCountdownBanner';

export default function LandingNavbar() {
  const [customer, setCustomer] = useState<{ name?: string; email?: string } | null>(null);

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
      {/* 1. Live Deal of the Day Banner Stacked at the Very Top */}
      <DealCountdownBanner />

      {/* 2. Main Navigation Bar */}
      <header
        style={{
          padding: '14px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.3em', color: 'var(--gold)', display: 'block', fontWeight: 600 }}>
            SUTRAಧಾರ
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
            The Handloom Sanctuary
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '22px', fontSize: '0.85rem' }}>
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
            href="/about"
            style={{ color: '#e0d8cc', textDecoration: 'none', letterSpacing: '0.04em' }}
          >
            Our Story
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

          <Link
            href="/portal/login"
            style={{
              padding: '6px 14px',
              background: 'transparent',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '4px',
              color: 'var(--gold)',
              textDecoration: 'none',
              fontSize: '0.78rem',
              letterSpacing: '0.05em',
            }}
          >
            Staff Portal ↗
          </Link>
        </div>
      </header>
    </div>
  );
}
