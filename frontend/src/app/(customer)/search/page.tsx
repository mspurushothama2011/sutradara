'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Product } from '@/shared/types/index';
import LandingNavbar from '@/components/customer/landing/LandingNavbar';
import Footer from '@/components/shared/ui/Footer';
import { Search, X, Award, ArrowRight } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick search keywords
  const popularKeywords = ['Kadhwa', 'Varanasi', 'Korvai', 'Paithani', 'Gold Zari', '1-of-1', 'Chanderi', 'Bridal'];

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

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

    const q = query.toLowerCase().trim();
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '110px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
      <LandingNavbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Search Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
            AUTHENTIC WEAVE ARCHIVE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--text)', marginTop: '6px' }}>
            Search Masterpieces
          </h1>
        </div>

        {/* Search Input Bar */}
        <div style={{ maxWidth: '720px', margin: '0 auto 32px' }}>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search size={18} strokeWidth={1.5} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by cluster (Varanasi, Yeola), weave (Kadhwa, Korvai), or zari..."
              autoFocus
              style={{
                width: '100%',
                padding: '16px 50px 16px 52px',
                background: '#ffffff',
                border: '1px solid rgba(179, 137, 56, 0.4)',
                borderRadius: '3px',
                color: 'var(--text)',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)',
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
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Popular Tag Suggestions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Curated Weaves:</span>
            {popularKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => setQuery(kw)}
                style={{
                  background: query.toLowerCase() === kw.toLowerCase() ? 'var(--gold)' : '#ffffff',
                  border: query.toLowerCase() === kw.toLowerCase() ? '1px solid var(--gold)' : '1px solid rgba(179, 137, 56, 0.25)',
                  borderRadius: '3px',
                  padding: '5px 14px',
                  color: query.toLowerCase() === kw.toLowerCase() ? '#ffffff' : 'var(--text-dim)',
                  fontSize: '0.78rem',
                  fontWeight: query.toLowerCase() === kw.toLowerCase() ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(26, 19, 13, 0.03)',
                }}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(179, 137, 56, 0.15)', paddingBottom: '16px', marginBottom: '32px' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>
            Showing <strong>{filteredProducts.length}</strong> authenticated handloom sarees
          </p>
          <Link href="/catalog" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            View Full Catalog <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>Searching handloom vault...</p>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', background: '#ffffff', borderRadius: '3px', border: '1px solid rgba(179, 137, 56, 0.25)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.04)' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text)', fontWeight: 600 }}>No sarees matched &quot;{query}&quot;</p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '6px' }}>
              Try searching by cluster (such as Varanasi or Kanchipuram) or weave technique (such as Kadhwa or Korvai).
            </p>
            <button
              onClick={() => setQuery('')}
              style={{
                marginTop: '16px',
                padding: '8px 20px',
                background: 'var(--gold)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '3px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '28px' }}>
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                style={{
                  textDecoration: 'none',
                  background: '#ffffff',
                  border: '1px solid rgba(179, 137, 56, 0.22)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 4px 16px rgba(26, 19, 13, 0.05)',
                }}
              >
                <div style={{ position: 'relative', height: '300px', background: '#F4EFEA' }}>
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
                        background: 'rgba(26, 20, 14, 0.92)',
                        border: '1px solid var(--gold)',
                        color: 'var(--gold)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        borderRadius: '2px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Award size={12} strokeWidth={1.5} color="var(--gold)" /> 1-of-1 Heirloom
                    </span>
                  )}
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      {product.craftRegion} • {product.fabric}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--text)', margin: '6px 0' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{product.zariType}</p>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(179, 137, 56, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>
                      ₹{product.sellingPrice.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      View Specs <ArrowRight size={12} strokeWidth={1.5} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Search Sanctuary...</div>}>
      <SearchContent />
    </Suspense>
  );
}
