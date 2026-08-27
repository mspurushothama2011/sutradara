'use client';

import Link from 'next/link';

const FEATURED_SAREES = [
  {
    id: 'prod-001',
    name: 'Varanasi Royal Kadhwa Pure Katan Silk',
    slug: 'varanasi-royal-kadhwa-pure-katan-silk-saree',
    region: 'Varanasi',
    fabric: 'Pure Katan Silk',
    zari: 'Pure Gold Zari',
    price: 38500,
    isHeirloom: true,
    image: '/frames/ezgif-frame-240.jpg',
  },
  {
    id: 'prod-002',
    name: 'Kanchipuram Temple Border Korvai Silk',
    slug: 'kanchipuram-temple-border-korvai-silk-saree',
    region: 'Kanchipuram',
    fabric: 'Kanjivaram Silk',
    zari: 'Tested Gold Zari',
    price: 42000,
    isHeirloom: false,
    image: '/frames/ezgif-frame-180.jpg',
  },
  {
    id: 'prod-003',
    name: 'Yeola Muniya Border Tapestry Paithani',
    slug: 'yeola-muniya-border-pure-paithani-silk-saree',
    region: 'Yeola',
    fabric: 'Paithani Silk',
    zari: 'Antique Copper Zari',
    price: 34500,
    isHeirloom: true,
    image: '/frames/ezgif-frame-150.jpg',
  },
];

export default function FeaturedShowcase() {
  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #110c08 0%, #1a140e 50%, #0d0906 100%)',
        padding: '100px 32px 120px',
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid rgba(201, 168, 76, 0.25)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
        {/* Section Header */}
        <span
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.3em',
            color: 'var(--gold)',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '12px',
          }}
        >
          STEP INSIDE THE SANCTUARY
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            color: '#fff',
            fontWeight: 400,
            lineHeight: 1.2,
          }}
        >
          Living Heritage. Woven Once.
        </h2>
        <p
          style={{
            maxWidth: '680px',
            margin: '16px auto 56px',
            fontSize: '1.05rem',
            color: 'var(--text-dim)',
            lineHeight: 1.7,
          }}
        >
          Direct provenance from the generational pit-looms of Varanasi, Kanchipuram, Yeola, and Chanderi.
          Every thread is Silk Mark verified and preserved for eternity.
        </p>

        {/* 3 Featured Saree Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            marginBottom: '64px',
            textAlign: 'left',
          }}
        >
          {FEATURED_SAREES.map((saree) => (
            <Link
              key={saree.id}
              href={`/product/${saree.slug}`}
              style={{
                textDecoration: 'none',
                background: 'var(--bg-deep)',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ position: 'relative', height: '380px', background: '#0a0602', overflow: 'hidden' }}>
                <img
                  src={saree.image}
                  alt={saree.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {saree.isHeirloom && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      padding: '4px 10px',
                      background: 'rgba(26, 20, 14, 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid var(--gold)',
                      color: 'var(--gold)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                    }}
                  >
                    👑 1-OF-1 HEIRLOOM
                  </span>
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    padding: '4px 8px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#4ade80',
                    fontSize: '0.68rem',
                    borderRadius: '4px',
                  }}
                >
                  ✓ Silk Mark
                </span>
              </div>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {saree.region} • {saree.fabric}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', margin: '8px 0 4px' }}>
                    {saree.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{saree.zari}</p>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 600 }}>
                    ₹{saree.price.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 500 }}>
                    View Heirloom →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Catchy Grand Entrance CTA Banner */}
        <div
          style={{
            background: 'radial-gradient(ellipse at center, rgba(201, 168, 76, 0.25) 0%, rgba(26, 20, 14, 0.9) 100%)',
            border: '2px solid var(--gold)',
            borderRadius: '16px',
            padding: '56px 32px',
            boxShadow: '0 32px 80px rgba(0, 0, 0, 0.8)',
            maxWidth: '960px',
            margin: '0 auto',
          }}
        >
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            2026 MASTER CURATION
          </span>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              color: '#fff',
              marginTop: '10px',
              marginBottom: '16px',
            }}
          >
            Ready to Discover Your Heirloom?
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#e0d8cc', maxWidth: '580px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Browse authentic handwoven Banarasi, Kanjivaram, Paithani, and Chanderi sarees with live stock availability and insured delivery.
          </p>

          <Link
            href="/catalog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '18px 40px',
              background: 'var(--gold)',
              color: '#110c08',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              boxShadow: '0 12px 32px rgba(201, 168, 76, 0.4)',
              transition: 'all 0.3s ease',
            }}
          >
            <span>Explore All Curated Sarees</span>
            <span style={{ fontSize: '1.2rem' }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
