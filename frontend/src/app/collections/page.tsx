'use client';

import Link from 'next/link';

const COLLECTIONS = [
  {
    slug: '1-of-1-heirlooms',
    name: 'The 1-of-1 Heirloom Vault',
    tagline: 'Single-Piece Unrepeatable Masterpieces',
    image: '/frames/ezgif-frame-240.jpg',
    description: 'Each saree in this vault was handwoven once across 4 to 8 months. Once acquired, the weave card is permanently archived.',
    count: 12,
    badge: '👑 SINGLE PIECE',
  },
  {
    slug: 'bridal-sanctuary',
    name: 'The Royal Bridal Sanctuary',
    tagline: 'Heavy Pure Gold Zari Wedding Drapes',
    image: '/frames/ezgif-frame-180.jpg',
    description: 'Heritage Kanjivaram Korvais and Banarasi Kadhwa brocades designed for the discerning Indian bride.',
    count: 18,
    badge: '🪔 BRIDAL',
  },
  {
    slug: 'festive-silks',
    name: 'Festive & Auspicious Silks',
    tagline: 'Celebratory Splendour in Vibrant Weaves',
    image: '/frames/ezgif-frame-150.jpg',
    description: 'Paithani kaleidoscopic borders, Chanderi tissue silks, and festive Banarasi silks crafted for Diwali, Dussehra, and family celebrations.',
    count: 24,
    badge: '🌸 FESTIVE',
  },
  {
    slug: 'deal-of-the-day',
    name: 'Privileged Deal of the Day',
    tagline: 'Curator Special with Live Countdown',
    image: '/frames/ezgif-frame-120.jpg',
    description: 'A singular daily handpicked saree available at privileged terms with Silk Mark assurance.',
    count: 1,
    badge: '⏳ LIVE DEAL',
  },
];

export default function CollectionsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            CURATED EDITS
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', color: '#fff', marginTop: '8px' }}>
            Sutraಧಾರ Collections
          </h1>
          <p style={{ maxWidth: '600px', margin: '12px auto 0', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
            Handpicked themes, rare bridal drapes, and single-piece unrepeatable heirlooms curated for discerning collectors.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          {COLLECTIONS.map((col) => (
            <Link
              key={col.slug}
              href={`/collections/${col.slug}`}
              style={{
                textDecoration: 'none',
                background: 'var(--bg-deep)',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                <img
                  src={col.image}
                  alt={col.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    padding: '4px 10px',
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid var(--gold)',
                    color: 'var(--gold)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                  }}
                >
                  {col.badge}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '4px 8px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                  }}
                >
                  {col.count} Curations
                </span>
              </div>

              <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {col.tagline}
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#fff', margin: '6px 0 10px' }}>
                    {col.name}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    {col.description}
                  </p>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 600 }}>
                    View Collection →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
