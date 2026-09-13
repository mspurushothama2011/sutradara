'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LandingNavbar from '@/components/landing/LandingNavbar';

export default function TrackOrderSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) {
      setError('Please enter your Order Reference Number (e.g. SUT-2026-4442) or AWB Tracking Number.');
      return;
    }
    setError(null);
    router.push(`/track/${encodeURIComponent(clean)}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      <main style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '140px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
            LIVE SATELLITE DISPATCH
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.5vw, 2.8rem)', color: 'var(--text)', marginTop: '8px' }}>
            Track Your Handloom Acquisition
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginTop: '10px', maxWidth: '560px', margin: '10px auto 0' }}>
            Real-time milestone telemetry, Silk Mark inspection footage, and courier delivery updates for your royal saree.
          </p>
        </div>

        {/* Tracking Search Form Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--gold)',
            borderRadius: '16px',
            padding: '36px 32px',
            boxShadow: '0 16px 48px rgba(26, 19, 13, 0.08)',
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--gold)', marginBottom: '8px', fontWeight: 700 }}>
                Order Number or AWB Airway Bill
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: 'var(--gold)' }}>
                  📦
                </span>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. SUT-2026-4442 or BD-10948291IN"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 52px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    fontSize: '1.05rem',
                    fontFamily: 'monospace',
                    letterSpacing: '1px',
                    outline: 'none',
                  }}
                />
              </div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                Tip: You can find your Order Reference in your confirmation email or Account Sanctuary.
              </span>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--gold)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(179, 137, 56, 0.25)',
              }}
            >
              Track Live Dispatch 🚀
            </button>
          </form>

          {/* Quick links */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(179, 137, 56, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem' }}>
            <Link href="/account/orders" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
              👤 View My Orders in Account Sanctuary
            </Link>
            <Link href="/contact" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>
              Need Help? Contact Concierge →
            </Link>
          </div>
        </div>

        {/* 3 Pillars of Dispatch Security */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '48px' }}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.05)' }}>
            <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '8px' }}>🛡️</span>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600 }}>Silk Mark Certified</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Every saree is inspected for 100% natural mulberry silk and authentic zari before box sealing.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.05)' }}>
            <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '8px' }}>✍️</span>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600 }}>White-Glove Handover</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Direct verified handover with courier proof of delivery and live tracking confirmation.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.05)' }}>
            <span style={{ fontSize: '1.6rem', display: 'block', marginBottom: '8px' }}>✈️</span>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600 }}>Insured Express Air</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Dispatched with Bluedart / Shiprocket Express in tamper-evident waterproof luxury presentation boxes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
