'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/api';

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
        background: 'transparent',
        padding: '100px 32px 120px',
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid rgba(179, 137, 56, 0.15)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
        {/* Section Header */}
        <span
          style={{
            fontSize: '0.78rem',
            letterSpacing: '0.3em',
            color: 'var(--gold)',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '12px',
            fontWeight: 700,
          }}
        >
          THE HERITAGE VAULT
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            color: 'var(--text)',
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
            fontSize: '1rem',
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
              className="glass-card-luxury"
              style={{
                textDecoration: 'none',
                borderRadius: '3px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', height: '380px', background: '#F4EFEA', overflow: 'hidden' }}>
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
                      padding: '5px 10px',
                      background: '#1A130D',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #D4AF37',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '2px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Award size={12} color="#D4AF37" />
                    <span>1-of-1 Heirloom</span>
                  </span>
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    padding: '5px 10px',
                    background: '#145A52',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <CheckCircle2 size={12} />
                  <span>Silk Mark</span>
                </span>
              </div>

              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                    {saree.craftRegion || saree.region} • {saree.fabric}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text)', margin: '8px 0 4px' }}>
                    {saree.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{saree.zariType || saree.zari}</p>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(179, 137, 56, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.3rem', color: 'var(--text)', fontWeight: 700 }}>
                    ₹{Number(saree.sellingPrice || saree.price).toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <span>View Piece</span>
                    <ArrowRight size={13} />
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
              fontSize: '0.82rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '3px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              background: 'var(--gold)',
              color: '#1a130d',
              boxShadow: '0 4px 16px rgba(179, 137, 56, 0.25)',
            }}
          >
            <span>Explore Complete Treasury</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
