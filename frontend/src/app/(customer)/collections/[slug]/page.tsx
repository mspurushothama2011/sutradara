'use client';

import { use } from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/landing/LandingNavbar';

export default function DynamicCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const titleMap: Record<string, { title: string; subtitle: string; filterTag: string }> = {
    '1-of-1-heirlooms': {
      title: 'The 1-of-1 Heirloom Vault',
      subtitle: 'Single-piece unrepeatable weaves preserved with individual Silk Mark certification numbers.',
      filterTag: '1-of-1',
    },
    'bridal-sanctuary': {
      title: 'The Royal Bridal Sanctuary',
      subtitle: 'Heavy pure gold zari bridal weaves curated for lifetime ceremonies.',
      filterTag: 'Bridal',
    },
    'festive-silks': {
      title: 'Festive & Auspicious Silks',
      subtitle: 'Vibrant celebratory silks from Varanasi, Yeola, and Kanchipuram.',
      filterTag: 'Festive',
    },
    'deal-of-the-day': {
      title: 'Privileged Deal of the Day',
      subtitle: 'Exclusive 24-hour privileged curation with tick-by-tick countdown.',
      filterTag: 'Deal',
    },
  };

  const colInfo = titleMap[slug] || {
    title: slug.replace(/-/g, ' ').toUpperCase(),
    subtitle: 'Curated artisanal handloom sarees.',
    filterTag: slug,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <LandingNavbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '140px 24px 80px' }}>
        <div style={{ marginBottom: '40px', borderBottom: '1px solid rgba(179, 137, 56, 0.2)', paddingBottom: '24px' }}>
          <Link href="/collections" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            ← Back to All Collections
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', color: 'var(--text)', marginTop: '12px' }}>
            {colInfo.title}
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginTop: '6px' }}>
            {colInfo.subtitle}
          </p>
        </div>

        {/* Jump to catalog with active filters */}
        <div style={{ background: '#ffffff', padding: '36px', borderRadius: '12px', border: '1px solid rgba(179, 137, 56, 0.22)', textAlign: 'center', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.05)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)' }}>
            Explore Verified Sarees in {colInfo.title}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', margin: '8px auto 24px', maxWidth: '500px' }}>
            All sarees in this collection feature guaranteed Silk Mark provenance and 4-digit Secure Delivery OTP.
          </p>
          <Link
            href="/catalog"
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              background: 'var(--gold)',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 14px rgba(179, 137, 56, 0.25)',
            }}
          >
            Browse Matching Sarees in Catalog →
          </Link>
        </div>
      </div>
    </div>
  );
}
