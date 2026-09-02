'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  image?: string;
  subCategories?: SubCategory[];
}

const FALLBACK_CLUSTERS = [
  {
    id: 'varanasi',
    name: 'Banarasi Heritage',
    region: 'Varanasi',
    image: '/frames/ezgif-frame-240.jpg',
    description: 'Famed for Kadhwa, Tanchoi, and Jangla weaves in pure mulberry silk with pure gold & silver zari.',
    subCategories: [
      { id: '1', name: 'Kadhwa Pure Katan Silk', slug: 'kadhwa-pure-katan-silk' },
      { id: '2', name: 'Tanchoi & Jamdani Brocade', slug: 'tanchoi-jamdani-brocade' },
      { id: '3', name: 'Jangla Shikargah (Gold Zari)', slug: 'jangla-shikargah-gold-zari' },
    ],
  },
  {
    id: 'kanchipuram',
    name: 'Kanjivaram Heritage',
    region: 'Kanchipuram',
    image: '/frames/ezgif-frame-180.jpg',
    description: 'Renowned for 3-ply heavy mulberry silk with interlocking Korvai temple borders and petni pallus.',
    subCategories: [
      { id: '4', name: 'Korvai Interlocking Temple Border', slug: 'korvai-temple-border' },
      { id: '5', name: 'Heavy Bridal 3-Ply Mulberry Silk', slug: 'bridal-3ply-mulberry-silk' },
      { id: '6', name: 'Classic Petni & Contrast Pallu', slug: 'classic-petni-contrast-pallu' },
    ],
  },
  {
    id: 'yeola',
    name: 'Paithani Heritage',
    region: 'Yeola',
    image: '/frames/ezgif-frame-150.jpg',
    description: 'The Queen of Silks featuring oblique square borders and handwoven kaleidoscope peacock pallus.',
    subCategories: [
      { id: '7', name: 'Muniya & Oblique Border', slug: 'muniya-oblique-border' },
      { id: '8', name: 'Handwoven Peacock Pallu', slug: 'handwoven-peacock-pallu' },
      { id: '9', name: 'Pure Tapestry Zari Weave', slug: 'pure-tapestry-zari-weave' },
    ],
  },
  {
    id: 'chanderi',
    name: 'Chanderi Heritage',
    region: 'Chanderi',
    image: '/frames/ezgif-frame-120.jpg',
    description: 'Featherlight tissue silks and sheer organza drapes woven with delicate gold meenakari butis.',
    subCategories: [
      { id: '10', name: 'Featherlight Tissue & Organza', slug: 'featherlight-tissue-organza' },
      { id: '11', name: 'Gold & Silver Meenakari Butis', slug: 'gold-silver-meenakari-butis' },
      { id: '12', name: 'Classic Chanderi Katan Silk', slug: 'classic-chanderi-katan-silk' },
    ],
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CLUSTERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await apiRequest('/categories');
        if (res && res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        }
      } catch (e) {
        console.error('Failed to load categories from DB:', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

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
            Explore certified authentic handloom sarees directly categorized by India&apos;s most venerated artisanal craft centers.
          </p>
        </div>

        {/* Cluster Grid from Live PostgreSQL Database */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          {categories.map((cluster) => (
            <Link
              key={cluster.id}
              href={`/catalog?craftRegion=${encodeURIComponent(cluster.region)}`}
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
                  src={cluster.image || '/frames/ezgif-frame-240.jpg'}
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
                  {cluster.subCategories?.length || 3} Weave Specializations
                </span>
              </div>

              <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    {cluster.region}
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
                    {cluster.subCategories?.map((sub) => (
                      <span key={sub.id} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px', color: 'var(--text-dim)' }}>
                        {sub.name}
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
