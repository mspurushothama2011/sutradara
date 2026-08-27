'use client';

import Link from 'next/link';

export default function LandingNavbar() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '18px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(17, 12, 8, 0.85) 0%, rgba(17, 12, 8, 0) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--gold)', display: 'block', fontWeight: 600 }}>
          SUTRADARA
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff' }}>
          The Handloom Sanctuary
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link
          href="/catalog"
          style={{
            color: '#e0d8cc',
            fontSize: '0.88rem',
            textDecoration: 'none',
            letterSpacing: '0.05em',
            fontWeight: 500,
            transition: 'color 0.2s ease',
          }}
        >
          Curated Sarees
        </Link>
        <Link
          href="/portal/login"
          style={{
            color: 'var(--text-dim)',
            fontSize: '0.82rem',
            textDecoration: 'none',
          }}
        >
          Staff Portal ↗
        </Link>
        <Link
          href="/catalog"
          style={{
            padding: '10px 22px',
            background: 'var(--gold)',
            color: '#110c08',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 16px rgba(201, 168, 76, 0.3)',
          }}
        >
          Shop Live Weaves →
        </Link>
      </div>
    </header>
  );
}
