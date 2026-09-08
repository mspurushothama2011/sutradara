'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LandingNavbar from '@/components/landing/LandingNavbar';
import DealCountdownBanner from '@/components/storefront/DealCountdownBanner';
import FeaturedShowcase from '@/components/landing/FeaturedShowcase';

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

const TRENDING_SEARCHES = [
  'Varanasi Kadhwa',
  'Mulberry Korvai',
  'Peacock Paithani',
  'Pure Gold Zari',
  'Chanderi Tissue',
  '1-of-1 Heirlooms',
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/catalog');
    }
  };

  const handleTrendingClick = (keyword: string) => {
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>
      {/* Unified Luxury Navbar with Deal Countdown */}
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
              margin: '0 auto 36px',
              fontSize: 'clamp(1rem, 2vw, 1.18rem)',
              color: '#d4ccbf',
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            Curated single-piece Banarasi, Kanjivaram, Paithani, and Chanderi sarees.
            Every weave is authenticated with official Silk Mark certification and sealed with high-assurance delivery.
          </p>

          {/* 🔍 Prominent Storefront Search Bar at Top of Home Page */}
          <div
            style={{
              maxWidth: '760px',
              margin: '0 auto 48px',
              background: 'rgba(17, 12, 8, 0.85)',
              border: '1.5px solid var(--gold)',
              borderRadius: '16px',
              padding: '16px 20px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: '1.3rem', color: 'var(--gold)', paddingLeft: '4px' }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by cluster (Varanasi, Kanchipuram), weave (Kadhwa, Paithani), or zari..."
                style={{
                  flex: '1 1 280px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  padding: '8px 4px',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: 'var(--gold)',
                  color: '#110c08',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                Search Sarees →
              </button>
            </form>

            {/* Trending Quick Search Chips */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(201, 168, 76, 0.2)',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Trending:
              </span>
              {TRENDING_SEARCHES.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTrendingClick(tag)}
                  style={{
                    padding: '4px 12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    color: '#e0d8cc',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gold)';
                    e.currentTarget.style.color = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.color = '#e0d8cc';
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

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
                padding: '16px 36px',
                background: 'rgba(201, 168, 76, 0.15)',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
              }}
            >
              Explore Full Catalog →
            </Link>

            <Link
              href="/collections/1-of-1-heirlooms"
              style={{
                padding: '16px 32px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              padding: '32px 24px',
              background: 'rgba(17, 12, 8, 0.65)',
              border: '1px solid rgba(201, 168, 76, 0.25)',
              borderRadius: '12px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div>
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>🛡️</span>
              <strong style={{ display: 'block', color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                Silk Mark 100%
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Govt. certified purity</span>
            </div>

            <div>
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>🔒</span>
              <strong style={{ display: 'block', color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                1-of-1 Heirlooms
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>10-min uninterrupted cart hold</span>
            </div>

            <div>
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>📹</span>
              <strong style={{ display: 'block', color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                Recorded Packing
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>20s pre-shipment sealing video</span>
            </div>

            <div>
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '8px' }}>✈️</span>
              <strong style={{ display: 'block', color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                Insured Air Express
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>4-digit drop OTP security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Saree Showcase with Live Filter & Quickview */}
      <FeaturedShowcase />

      {/* 4 Geographical Craft Clusters */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            REGIONAL WEAVING PROVENANCE
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: '#fff', marginTop: '6px' }}>
            Four Sacred Craft Traditions
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginTop: '8px' }}>
            Direct collaborations with state-awarded master weaver cooperatives
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {CLUSTERS_PREVIEW.map((cluster) => (
            <Link
              key={cluster.name}
              href={`/categories/${cluster.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              style={{
                textDecoration: 'none',
                position: 'relative',
                height: '380px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(201, 168, 76, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '24px',
                background: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(17,12,8,0.95) 100%), url(${cluster.image}) center/cover no-repeat`,
                transition: 'transform 0.3s ease, border-color 0.3s ease',
              }}
            >
              <span
                style={{
                  alignSelf: 'flex-start',
                  padding: '4px 10px',
                  background: 'rgba(26, 20, 14, 0.85)',
                  border: '1px solid var(--gold)',
                  borderRadius: '4px',
                  color: 'var(--gold)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  marginBottom: 'auto',
                }}
              >
                {cluster.tag}
              </span>

              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#fff', margin: 0 }}>
                  {cluster.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#d4ccbf', marginTop: '6px' }}>
                  {cluster.craft}
                </p>
                <span style={{ fontSize: '0.78rem', color: 'var(--gold)', marginTop: '8px', display: 'inline-block', fontWeight: 600 }}>
                  Explore Cluster →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Curation Philosophy Banner */}
      <section
        style={{
          padding: '80px 24px',
          background: 'linear-gradient(180deg, #150f0a 0%, #110c08 100%)',
          borderTop: '1px solid rgba(201, 168, 76, 0.15)',
          borderBottom: '1px solid rgba(201, 168, 76, 0.15)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            THE SUTRAಧಾರ PROMISE
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#fff', margin: '12px 0 20px' }}>
            No Machine Imitations. Only Genuine Handloom.
          </h2>
          <p style={{ color: '#d4ccbf', lineHeight: 1.8, fontSize: '1rem', fontWeight: 300 }}>
            In an era flooded with powerloom polyester copies, Sutraಧಾರ exists as an unyielding fortress of authenticity. 
            Every single saree is woven thread-by-thread on traditional wooden pit looms, tested for pure zari purity, 
            and authenticated with Silk Mark India credentials.
          </p>
          <div style={{ marginTop: '32px' }}>
            <Link
              href="/authenticity"
              style={{
                padding: '14px 28px',
                background: 'rgba(201, 168, 76, 0.15)',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              Learn About Silk Mark Verification →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
