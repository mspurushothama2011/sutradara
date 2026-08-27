'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Product } from '../../../../shared/types/index';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick search keywords
  const popularKeywords = ['Kadhwa', 'Varanasi', 'Korvai', 'Paithani', 'Gold Zari', '1-of-1'];

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest('/products');
        setProducts(res.products || []);
        setFilteredProducts(res.products || []);
      } catch (e) {
        console.error('Failed to load products for search:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }

    const q = query.toLowerCase();
    const matches = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.craftRegion.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.zariType.toLowerCase().includes(q) ||
        (p.weaveStyle && p.weaveStyle.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
    setFilteredProducts(matches);
  }, [query, products]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff', padding: '60px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Search Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            INSTANT ARCHIVE SEARCH
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', color: '#fff', marginTop: '6px' }}>
            Find Your Masterpiece
          </h1>
        </div>

        {/* Search Input Bar */}
        <div style={{ maxWidth: '680px', margin: '0 auto 32px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by cluster (Varanasi, Yeola), weave (Kadhwa, Korvai), or Zari..."
              suppressHydrationWarning
              style={{
                width: '100%',
                padding: '18px 24px',
                paddingRight: '60px',
                background: 'var(--bg-deep)',
                border: '2px solid var(--gold)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1.05rem',
                outline: 'none',
                boxShadow: '0 8px 32px rgba(201, 168, 76, 0.2)',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute',
                  right: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Popular Tag Suggestions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Trending:</span>
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => setQuery(kw)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  color: query === kw ? 'var(--gold)' : 'var(--text-cream)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '32px' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>
            Showing <strong>{filteredProducts.length}</strong> matching handloom sarees
          </p>
          <Link href="/catalog" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '0.82rem' }}>
            View Full Catalog →
          </Link>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>Searching handloom vault...</p>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-deep)', borderRadius: '12px' }}>
            <p style={{ fontSize: '1.1rem', color: '#fff' }}>No sarees matched &quot;{query}&quot;</p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '6px' }}>Try searching by region (e.g. Varanasi, Kanchipuram) or fabric (e.g. Katan Silk).</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '28px' }}>
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                style={{
                  textDecoration: 'none',
                  background: 'var(--bg-deep)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease',
                }}
              >
                <div style={{ position: 'relative', height: '300px', background: '#0a0602' }}>
                  <img
                    src={product.images[0] || '/frames/ezgif-frame-240.jpg'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {product.isHeirloom1of1 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        padding: '3px 8px',
                        background: 'rgba(26, 20, 14, 0.9)',
                        border: '1px solid var(--gold)',
                        color: 'var(--gold)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        borderRadius: '4px',
                      }}
                    >
                      👑 1-of-1 Heirloom
                    </span>
                  )}
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {product.craftRegion} • {product.fabric}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: '#fff', margin: '6px 0' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{product.zariType}</p>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>
                      ₹{product.sellingPrice.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>View Specs →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
