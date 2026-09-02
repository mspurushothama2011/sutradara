'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Product } from '../../../../shared/types/index';

const FALLBACK_SAREES = [
  {
    id: 'prod-001',
    name: 'Varanasi Royal Kadhwa Pure Katan Silk',
    slug: 'varanasi-royal-kadhwa-pure-katan-silk-saree',
    craftRegion: 'Varanasi',
    fabric: 'Pure Katan Silk',
    zariType: 'Pure Gold Zari',
    sellingPrice: 38500,
    isHeirloom1of1: true,
    images: ['/frames/ezgif-frame-240.jpg'],
  },
  {
    id: 'prod-002',
    name: 'Kanchipuram Temple Border Korvai Silk',
    slug: 'kanchipuram-temple-border-korvai-silk-saree',
    craftRegion: 'Kanchipuram',
    fabric: 'Kanjivaram Silk',
    zariType: 'Tested Gold Zari',
    sellingPrice: 42000,
    isHeirloom1of1: false,
    images: ['/frames/ezgif-frame-180.jpg'],
  },
  {
    id: 'prod-003',
    name: 'Yeola Muniya Border Tapestry Paithani',
    slug: 'yeola-muniya-border-pure-paithani-silk-saree',
    craftRegion: 'Yeola',
    fabric: 'Paithani Silk',
    zariType: 'Antique Copper Zari',
    sellingPrice: 34500,
    isHeirloom1of1: true,
    images: ['/frames/ezgif-frame-150.jpg'],
  },
];

export default function FeaturedShowcase() {
  const [sarees, setSarees] = useState<any[]>(FALLBACK_SAREES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await apiRequest('/products?isFeatured=true');
        if (res && res.products && res.products.length > 0) {
          setSarees(res.products.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured sarees from DB:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeatured();
  }, []);

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

        {/* 3 Featured Saree Cards from Database */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            marginBottom: '64px',
            textAlign: 'left',
          }}
        >
          {sarees.map((saree) => (
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
                  src={saree.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                  alt={saree.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {saree.isHeirloom1of1 && (
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
                    {saree.craftRegion || saree.region} • {saree.fabric}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', margin: '8px 0 4px' }}>
                    {saree.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{saree.zariType || saree.zari}</p>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 600 }}>
                    ₹{Number(saree.sellingPrice || saree.price).toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 500 }}>
                    View Heirloom →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Action Button to Full Catalog */}
        <div>
          <Link
            href="/catalog"
            className="gold-btn"
            style={{
              padding: '16px 40px',
              fontSize: '0.95rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            Explore Complete Treasury ({sarees.length > 3 ? '5+' : 'All'} Sarees) →
          </Link>
        </div>
      </div>
    </section>
  );
}
