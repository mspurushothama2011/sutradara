'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Product } from '../../../../../shared/types/index';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('/frames/ezgif-frame-240.jpg');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function loadProduct() {
      try {
        setIsLoading(true);
        const res = await apiRequest(`/products/${slug}`);
        if (res.product) {
          setProduct(res.product);
          if (res.product.images?.length) {
            setActiveImage(res.product.images[0]);
          }
        }
      } catch (e) {
        console.error('Failed to load product:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
        <p style={{ letterSpacing: '0.2em' }}>AUTHENTICATING LOOM PROVENANCE...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', textAlign: 'center', padding: '120px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Saree Not Found</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>This specific heirloom piece may have been acquired or relocated.</p>
        <Link href="/catalog" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', background: 'var(--gold)', color: '#110c08', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
          ← Return to Curated Catalog
        </Link>
      </div>
    );
  }

  const isSoldOut = product.stock <= 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(17, 12, 8, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(201, 168, 76, 0.15)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link href="/catalog" style={{ color: 'var(--gold)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← Back to Catalog
        </Link>
        <Link href="/" style={{ textDecoration: 'none', textAlign: 'center' }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.3em', color: 'var(--gold)', display: 'block' }}>
            SUTRADARA
          </span>
        </Link>
        <Link href="/portal/login" style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textDecoration: 'none' }}>
          Staff Portal ↗
        </Link>
      </header>

      {/* Main Saree Details Layout */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Left Column: Visual Gallery */}
          <div>
            {/* Primary Featured View */}
            <div
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(201, 168, 76, 0.25)',
                background: '#0a0602',
                aspectRatio: '3/4',
                boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
              }}
            >
              <img
                src={activeImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {product.isHeirloom1of1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    padding: '6px 14px',
                    background: 'rgba(26, 20, 14, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--gold)',
                    borderRadius: '6px',
                    color: 'var(--gold)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                  }}
                >
                  👑 1-OF-1 UNREPEATABLE HEIRLOOM
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: activeImage === img ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.15)',
                      padding: 0,
                      background: '#000',
                      cursor: 'pointer',
                    }}
                  >
                    <img src={img} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Provenance & Purchase Box */}
          <div>
            {/* Cluster Provenance Tag */}
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              {product.craftRegion} LOOM CLUSTER • SKU: {product.sku}
            </span>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: '#fff', lineHeight: 1.25 }}>
              {product.name}
            </h1>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', margin: '20px 0 24px' }}>
              <span style={{ fontSize: '2rem', color: '#fff', fontWeight: 600 }}>
                ₹{product.sellingPrice.toLocaleString('en-IN')}
              </span>
              {product.comparePrice && (
                <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                  ₹{product.comparePrice.toLocaleString('en-IN')}
                </span>
              )}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                Inclusive of all taxes & nationwide insured shipping
              </span>
            </div>

            {/* 1-of-1 Heirloom Notice */}
            {product.isHeirloom1of1 && (
              <div
                style={{
                  background: 'rgba(201, 168, 76, 0.1)',
                  border: '1px solid rgba(201, 168, 76, 0.35)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                <h4 style={{ color: 'var(--gold)', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👑 Single-Piece Heritage Edition
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.5 }}>
                  This saree is an unrepeatable single piece woven on a master pit-loom. Once acquired, no identical duplicate will ever be produced.
                </p>
              </div>
            )}

            {/* Primary Action Button */}
            <div style={{ marginBottom: '32px' }}>
              {isSoldOut ? (
                <button
                  disabled
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    color: '#f87171',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'not-allowed',
                  }}
                >
                  Acquired / Sold Out
                </button>
              ) : (
                <button
                  onClick={() => alert(`Saree "${product.name}" added to bag! (Checkout active in Milestone 5)`)}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: 'var(--gold)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#110c08',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(201, 168, 76, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Acquire This Heirloom
                </button>
              )}
            </div>

            {/* Silk Mark Authentication Certificate Card */}
            {product.silkMarkNumber && (
              <div
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>🏅</span>
                <div>
                  <h4 style={{ fontSize: '0.88rem', color: '#4ade80', fontWeight: 600 }}>
                    Silk Mark Certified Pure Natural Silk
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Registration No: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{product.silkMarkNumber}</strong> (Silk Mark Organisation of India)
                  </p>
                </div>
              </div>
            )}

            {/* Weave Specifications Table */}
            <div
              style={{
                background: 'var(--bg-deep)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '24px',
              }}
            >
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Handloom Specifications
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.82rem' }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'var(--text-dim)' }}>Fabric</div>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>{product.fabric}</div>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'var(--text-dim)' }}>Zari Composition</div>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>{product.zariType}</div>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'var(--text-dim)' }}>Craft Region</div>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>{product.craftRegion}</div>
                <div style={{ padding: '12px 20px', color: 'var(--text-dim)' }}>Weave Technique</div>
                <div style={{ padding: '12px 20px', color: '#fff' }}>{product.weaveStyle || 'Traditional Pit Loom'}</div>
              </div>
            </div>

            {/* Craft Story */}
            <div style={{ lineHeight: 1.7, fontSize: '0.9rem', color: '#d1c7b7' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>
                Craft Provenance & Story
              </h3>
              <p>{product.description}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
