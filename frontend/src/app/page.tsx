'use client';

import Link from 'next/link';
import LandingNavbar from '@/components/landing/LandingNavbar';
import DealCountdownBanner from '@/components/storefront/DealCountdownBanner';
import FeaturedShowcase from '@/components/landing/FeaturedShowcase';
import Footer from '@/components/ui/Footer';

const CLUSTERS_PREVIEW = [
  {
    name: 'Varanasi',
    craft: 'Royal Kadhwa & Tanchoi Brocades',
    image: '/frames/ezgif-frame-240.jpg',
    tag: 'Pure Gold Zari',
  },
  {
    name: 'Kanchipuram',
    craft: '3-Ply Mulberry Korvai Silks',
    image: '/frames/ezgif-frame-180.jpg',
    tag: 'Temple Borders',
  },
  {
    name: 'Yeola (Paithani)',
    craft: 'Kaleidoscope Peacock Pallus',
    image: '/frames/ezgif-frame-150.jpg',
    tag: 'Tapestry Weave',
  },
  {
    name: 'Chanderi',
    craft: 'Featherlight Tissue & Organza',
    image: '/frames/ezgif-frame-120.jpg',
    tag: 'Gold Meenakari',
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>
      {/* Deal of the Day Banner */}
      <div style={{ position: 'relative', zIndex: 120 }}>
        <DealCountdownBanner />
      </div>

      {/* Floating Luxury Navbar */}
      <LandingNavbar />

      {/* Grand Luxury Hero Section */}
      <section
        style={{
          position: 'relative',
          paddingTop: '160px',
          paddingBottom: '100px',
          paddingLeft: '24px',
          paddingRight: '24px',
          background: 'radial-gradient(ellipse at top, #2b1f15 0%, #150f0a 60%, #0d0906 100%)',
          textAlign: 'center',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(201, 168, 76, 0.2)',
        }}
      >
        {/* Subtle background glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(201, 168, 76, 0.15) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1080px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span
            style={{
              fontSize: '0.82rem',
              letterSpacing: '0.35em',
              color: 'var(--gold)',
              textTransform: 'uppercase',
              display: 'inline-block',
              fontWeight: 600,
              marginBottom: '16px',
              padding: '6px 16px',
              background: 'rgba(201, 168, 76, 0.1)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '20px',
            }}
          >
            DIRECT FROM MASTER WEAVING GUILDS
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.6rem, 5.5vw, 4.6rem)',
              color: '#ffffff',
              lineHeight: 1.15,
              fontWeight: 400,
              letterSpacing: '-0.01em',
              margin: '0 auto 20px',
              maxWidth: '900px',
            }}
          >
            The Sanctuary of Authentic Indian Handloom Heritage
          </h1>

          <p
            style={{
              maxWidth: '680px',
              margin: '0 auto 40px',
              fontSize: 'clamp(1rem, 2vw, 1.18rem)',
              color: '#d4ccbf',
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            Curated single-piece Banarasi, Kanjivaram, Paithani, and Chanderi sarees.
            Every weave is authenticated with official Silk Mark certification and sealed with high-assurance delivery.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '18px',
              flexWrap: 'wrap',
              marginBottom: '56px',
            }}
          >
            <Link
              href="/catalog"
              style={{
                padding: '18px 40px',
                background: 'var(--gold)',
                color: '#110c08',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                boxShadow: '0 12px 36px rgba(201, 168, 76, 0.4)',
                transition: 'all 0.3s ease',
              }}
            >
              Explore Curated Sarees →
            </Link>

            <Link
              href="/collections/1-of-1-heirlooms"
              style={{
                padding: '18px 36px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                backdropFilter: 'blur(8px)',
              }}
            >
              👑 1-of-1 Heirloom Vault
            </Link>
          </div>

          {/* 4 Pillars of Assurance Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              padding: '24px',
              background: 'rgba(10, 6, 3, 0.75)',
              border: '1px solid rgba(201, 168, 76, 0.25)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.4rem' }}>🏛️</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#fff' }}>Silk Mark Certified</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>100% natural silk</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.4rem' }}>👑</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#fff' }}>1-of-1 Heirlooms</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Woven only once</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.4rem' }}>📹</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#fff' }}>20s Video Inspection</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Pre-dispatch video log</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.4rem' }}>📦</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#fff' }}>4-Digit Drop OTP</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Insured white-glove delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Luxury Saree Curation */}
      <FeaturedShowcase />

      {/* Craft Provenance Quick Directory */}
      <section style={{ padding: '80px 24px 100px', background: 'var(--bg-deep)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                GEOGRAPHICAL MASTERY
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff', marginTop: '4px' }}>
                Explore by Craft Cluster
              </h2>
            </div>
            <Link href="/categories" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
              View All Clusters Directory →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {CLUSTERS_PREVIEW.map((cluster, idx) => (
              <Link
                key={idx}
                href={`/catalog?region=${encodeURIComponent(cluster.name.split(' ')[0])}`}
                style={{
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={cluster.image}
                    alt={cluster.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '3px 8px',
                      background: 'rgba(0,0,0,0.8)',
                      color: 'var(--gold)',
                      fontSize: '0.7rem',
                      borderRadius: '4px',
                      border: '1px solid var(--gold)',
                    }}
                  >
                    {cluster.tag}
                  </span>
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', margin: '0 0 4px' }}>
                    {cluster.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{cluster.craft}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Global Multi-Column Footer */}
      <Footer />
    </div>
  );
}
