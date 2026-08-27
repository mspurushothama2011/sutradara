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
        padding: '16px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(17, 12, 8, 0.92) 0%, rgba(17, 12, 8, 0.6) 80%, rgba(17, 12, 8, 0) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(201, 168, 76, 0.15)',
      }}
    >
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '0.72rem', letterSpacing: '0.3em', color: 'var(--gold)', display: 'block', fontWeight: 600 }}>
          SUTRADARA
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
        <Link
          href="/search"
          style={{
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            color: 'var(--gold)',
            textDecoration: 'none',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>🔍</span>
          <span>Search</span>
        </Link>
        <Link
          href="/account"
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
          <span>Account</span>
        </Link>
        <Link
          href="/catalog"
          style={{
            padding: '9px 18px',
            background: 'var(--gold)',
            color: '#110c08',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 16px rgba(201, 168, 76, 0.3)',
          }}
        >
          Shop Live →
        </Link>
      </div>
    </header>
  );
}
