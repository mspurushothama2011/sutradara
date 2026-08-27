'use client';

import Link from 'next/link';

const CLUSTERS = [
  {
    id: 'varanasi',
    name: 'Varanasi (Banarasi)',
    state: 'Uttar Pradesh',
    image: '/frames/ezgif-frame-240.jpg',
    description: 'Famed for Kadhwa, Tanchoi, and Jangla weaves in pure mulberry silk with pure gold & silver zari.',
    keyTechniques: ['Kadhwa Weave', 'Zari Shikargah', 'Tanchoi Silk'],
    sareeCount: 14,
  },
  {
    id: 'kanchipuram',
    name: 'Kanchipuram',
    state: 'Tamil Nadu',
    image: '/frames/ezgif-frame-180.jpg',
    description: 'Renowned for 3-ply heavy mulberry silk with interlocking Korvai temple borders and petni pallus.',
    keyTechniques: ['Korvai Interlock', 'Tested Gold Zari', 'Temple Border'],
    sareeCount: 11,
  },
  {
    id: 'yeola',
    name: 'Yeola (Paithani)',
    state: 'Maharashtra',
    image: '/frames/ezgif-frame-150.jpg',
    description: 'The Queen of Silks featuring oblique square borders and handwoven kaleidoscope peacock pallus.',
    keyTechniques: ['Tapestry Weave', 'Peacock Pallu', 'Muniya Border'],
    sareeCount: 9,
  },
  {
    id: 'chanderi',
    name: 'Chanderi',
    state: 'Madhya Pradesh',
    image: '/frames/ezgif-frame-120.jpg',
    description: 'Featherlight tissue silks and sheer organza drapes woven with delicate gold meenakari butis.',
    keyTechniques: ['Tissue Weave', 'Meenakari Buti', 'Zari Border'],
    sareeCount: 8,
  },
];

export default function CategoriesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            GEOGRAPHICAL PROVENANCE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', color: '#fff', marginTop: '8px' }}>
            The Four Master Weaving Clusters
          </h1>
          <p style={{ maxWidth: '640px', margin: '12px auto 0', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
            Explore certified authentic handloom sarees directly categorized by India's most venerated artisanal craft centers.
          </p>
        </div>

        {/* Cluster Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          {CLUSTERS.map((cluster) => (
            <Link
              key={cluster.id}
              href={`/catalog?region=${encodeURIComponent(cluster.name.split(' ')[0])}`}
              style={{
                textDecoration: 'none',
                background: 'var(--bg-deep)',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
                <img
                  src={cluster.image}
                  alt={cluster.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '4px 10px',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid var(--gold)',
                    color: 'var(--gold)',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                  }}
                >
                  {cluster.sareeCount} Masterpieces Available
                </span>
              </div>

              <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {cluster.state}
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#fff', margin: '6px 0 12px' }}>
                    {cluster.name}
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    {cluster.description}
                  </p>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {cluster.keyTechniques.map((tech, idx) => (
                      <span key={idx} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px', color: 'var(--text-dim)' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 600 }}>
                    Explore →
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
