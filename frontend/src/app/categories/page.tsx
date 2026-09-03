'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import LandingNavbar from '@/components/landing/LandingNavbar';

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
];

export default function CraftCategoriesPage() {
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      <div style={{ paddingTop: '120px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            GEOGRAPHICAL PROVENANCE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', color: '#fff', marginTop: '8px' }}>
            Master Weaving Clusters
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
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img
                  src={cluster.image || '/frames/ezgif-frame-240.jpg'}
                  alt={cluster.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    padding: '4px 12px',
                    background: 'rgba(26, 20, 14, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--gold)',
                    color: 'var(--gold)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '4px',
                    letterSpacing: '0.05em',
                  }}
                >
                  {cluster.region} CLUSTER
                </span>
              </div>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff' }}>
                    {cluster.name}
                  </h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '8px', lineHeight: 1.5 }}>
                    {cluster.description}
                  </p>

                  {/* SubCategory Pills (Enforced Max 3) */}
                  {cluster.subCategories && cluster.subCategories.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                      {cluster.subCategories.slice(0, 3).map((sub) => (
                        <span
                          key={sub.id}
                          style={{
                            fontSize: '0.72rem',
                            padding: '3px 8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            color: '#e0d8cc',
                          }}
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>
                    Explore Cluster Weaves →
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Silk Mark Certified
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
