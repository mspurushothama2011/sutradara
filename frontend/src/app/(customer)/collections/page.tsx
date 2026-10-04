'use client';

import Link from 'next/link';
import { Award, Sparkles, Heart, ArrowRight } from 'lucide-react';
import LandingNavbar from '@/components/landing/LandingNavbar';

const COLLECTIONS = [
  {
    slug: '1-of-1-heirlooms',
    name: 'The 1-of-1 Heirloom Vault',
    tagline: 'Single-Piece Unrepeatable Masterpieces',
    image: '/frames/ezgif-frame-240.jpg',
    description: 'Each saree in this vault was handwoven once across 4 to 8 months. Once acquired, the weave pattern is permanently retired.',
    count: 12,
    badge: 'SINGLE PIECE',
    icon: Award,
  },
  {
    slug: 'bridal-sanctuary',
    name: 'The Royal Bridal Sanctuary',
    tagline: 'Heavy Pure Gold Zari Wedding Drapes',
    image: '/frames/ezgif-frame-180.jpg',
    description: 'Heritage Kanjivaram Korvais and Banarasi Kadhwa brocades designed for the discerning Indian bride.',
    count: 18,
    badge: 'BRIDAL MASTERPIECE',
    icon: Heart,
  },
  {
    slug: 'festive-silks',
    name: 'Festive & Auspicious Silks',
    tagline: 'Celebratory Splendour in Vibrant Weaves',
    image: '/frames/ezgif-frame-150.jpg',
    description: 'Paithani kaleidoscopic borders, Chanderi tissue silks, and festive Banarasi silks crafted for auspicious celebrations.',
    count: 24,
    badge: 'FESTIVE SILKS',
    icon: Sparkles,
  },
  {
    slug: 'master-weaves',
    name: 'Generational Master Weaves',
    tagline: 'Rare Pit-Loom Heritage Editions',
    image: '/frames/ezgif-frame-120.jpg',
    description: 'Handpicked museum-grade textiles crafted with certified 2G gold zari and pure organic silk threads.',
    count: 16,
    badge: 'CURATOR SELECTION',
    icon: Award,
  },
];

export default function CollectionsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      <div style={{ paddingTop: '120px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
            CURATED EDITS
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', color: 'var(--text)', marginTop: '8px' }}>
            Sutraಧಾರ Collections
          </h1>
          <p style={{ maxWidth: '600px', margin: '12px auto 0', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
            Handpicked themes, rare bridal drapes, and single-piece unrepeatable heirlooms curated for discerning collectors.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          {COLLECTIONS.map((col) => {
            const Icon = col.icon;
            return (
              <Link
                key={col.slug}
                href={`/catalog?collection=${col.slug}`}
                style={{
                  textDecoration: 'none',
                  background: '#ffffff',
                  border: '1px solid rgba(179, 137, 56, 0.22)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(26, 19, 13, 0.05)',
                }}
              >
                <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
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
                      background: 'rgba(26, 20, 14, 0.88)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid var(--gold)',
                      color: 'var(--gold)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    <Icon size={12} />
                    <span>{col.badge}</span>
                  </span>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {col.tagline}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--text)', margin: '8px 0 10px' }}>
                      {col.name}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                      {col.description}
                    </p>
                  </div>

                  <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(179, 137, 56, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                      {col.count} Curated Pieces
                    </span>
                    <span style={{ color: 'var(--gold)', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <span>Explore Collection</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
