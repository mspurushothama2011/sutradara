'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Product } from '../../../../shared/types/index';
import LandingNavbar from '@/components/landing/LandingNavbar';

const CRAFT_REGIONS = [
  'All Clusters',
  'Varanasi',
  'Kanchipuram',
  'Yeola',
  'Chanderi',
  'Patan',
  'Bishnupur',
  'Mysore',
  'Bhagalpur',
];
const ZARI_TYPES = ['All Zari', 'Pure Gold Zari', 'Tested Gold Zari', 'Antique Copper Zari', 'Silver Zari'];

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams?.get('craftRegion') || searchParams?.get('region') || 'All Clusters';
  const initialZari = searchParams?.get('zariType') || 'All Zari';
  const initialHeirloom = searchParams?.get('isHeirloom1of1') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCluster, setSelectedCluster] = useState(initialRegion);
  const [selectedZari, setSelectedZari] = useState(initialZari);
  const [onlyHeirloom, setOnlyHeirloom] = useState(initialHeirloom);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync if URL search params change
  useEffect(() => {
    const r = searchParams?.get('craftRegion') || searchParams?.get('region');
    if (r && CRAFT_REGIONS.includes(r)) {
      setSelectedCluster(r);
    }
  }, [searchParams]);

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      let query = '/products?';
      if (selectedCluster !== 'All Clusters') query += `craftRegion=${encodeURIComponent(selectedCluster)}&`;
      if (selectedZari !== 'All Zari') query += `zariType=${encodeURIComponent(selectedZari)}&`;
      if (onlyHeirloom) query += `isHeirloom1of1=true&`;
      if (searchQuery) query += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await apiRequest(query);
      setProducts(res.products || []);
    } catch (e) {
      console.error('Failed to load catalog:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCluster, selectedZari, onlyHeirloom, searchQuery]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      {/* Catalog Hero Banner */}
      <section
        style={{
          padding: '120px 32px 32px',
          maxWidth: '1300px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>
          MASTER WEAVER CURATION
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            color: '#fff',
            marginTop: '8px',
            fontWeight: 400,
          }}
        >
          Unrepeatable Heirlooms & Rare Silks
        </h1>
        <p style={{ maxWidth: '640px', margin: '12px auto 0', fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          Direct provenance from the looms of Varanasi, Kanchipuram, Yeola, and Chanderi. Every saree is Silk Mark certified.
        </p>
      </section>

      {/* Filter Toolbar */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 32px 32px' }}>
        <div
          style={{
            background: 'var(--bg-deep)',
            border: '1px solid rgba(201, 168, 76, 0.2)',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search weaves, motifs, clusters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '10px 16px',
              minWidth: '260px',
              background: 'rgba(10, 6, 2, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />

          {/* Select Dropdowns */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Cluster Filter */}
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              style={{
                padding: '10px 16px',
                background: 'rgba(10, 6, 2, 0.6)',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                borderRadius: '6px',
                color: 'var(--gold)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {CRAFT_REGIONS.map((r) => (
                <option key={r} value={r} style={{ background: '#1a140e', color: '#fff' }}>
                  {r}
                </option>
              ))}
            </select>

            {/* Zari Type Filter */}
            <select
              value={selectedZari}
              onChange={(e) => setSelectedZari(e.target.value)}
              style={{
                padding: '10px 16px',
                background: 'rgba(10, 6, 2, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {ZARI_TYPES.map((z) => (
                <option key={z} value={z} style={{ background: '#1a140e', color: '#fff' }}>
                  {z}
                </option>
              ))}
            </select>

            {/* Heirloom Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: onlyHeirloom ? 'rgba(201, 168, 76, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: onlyHeirloom ? '1px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: onlyHeirloom ? 'var(--gold)' : 'var(--text-dim)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={onlyHeirloom}
                onChange={(e) => setOnlyHeirloom(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              👑 1-of-1 Heirloom Only
            </label>
          </div>
        </div>
      </section>

      {/* Saree Grid */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 32px 80px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--gold)' }}>
            <p style={{ letterSpacing: '0.2em' }}>CURATING AVAILABLE WEAVES...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'var(--bg-deep)', borderRadius: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff' }}>No Sarees Matched Your Filter</h3>
            <p style={{ color: 'var(--text-dim)', marginTop: '6px', fontSize: '0.88rem' }}>
              Try loosening your filters or resetting the cluster search.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '28px',
            }}
          >
            {products.map((p) => {
              const isSoldOut = p.stock <= 0;
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  style={{
                    textDecoration: 'none',
                    background: 'var(--bg-deep)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Image Container */}
                  <div style={{ position: 'relative', height: '360px', overflow: 'hidden', background: '#0a0602' }}>
                    <img
                      src={p.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                      alt={p.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: isSoldOut ? 'grayscale(80%)' : 'none',
                        transition: 'transform 0.4s ease',
                      }}
                    />

                    {/* 1-of-1 Badge */}
                    {p.isHeirloom1of1 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          padding: '4px 10px',
                          background: 'rgba(26, 20, 14, 0.85)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid var(--gold)',
                          color: 'var(--gold)',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          borderRadius: '4px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        👑 1-OF-1 HEIRLOOM
                      </span>
                    )}

                    {/* Silk Mark Indicator */}
                    {p.silkMarkNumber && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          padding: '4px 8px',
                          background: 'rgba(0, 0, 0, 0.75)',
                          color: '#4ade80',
                          fontSize: '0.65rem',
                          borderRadius: '4px',
                          border: '1px solid rgba(74, 222, 128, 0.4)',
                        }}
                      >
                        ✓ Silk Mark
                      </span>
                    )}

                    {/* Stock status overlay */}
                    {isSoldOut && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0, 0, 0, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span
                          style={{
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            padding: '6px 14px',
                            borderRadius: '4px',
                          }}
                        >
                          ACQUIRED
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                          {p.craftRegion}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {p.fabric}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.05rem',
                          color: '#fff',
                          lineHeight: 1.4,
                          margin: '4px 0 8px',
                          fontWeight: 400,
                        }}
                      >
                        {p.name}
                      </h3>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
                        {p.zariType} {p.weaveStyle ? `• ${p.weaveStyle}` : ''}
                      </p>
                    </div>

                    {/* Price and Action */}
                    <div
                      style={{
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff' }}>
                          ₹{p.sellingPrice.toLocaleString('en-IN')}
                        </span>
                        {p.comparePrice && (
                          <span
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--text-dim)',
                              textDecoration: 'line-through',
                              marginLeft: '8px',
                            }}
                          >
                            ₹{p.comparePrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 500 }}>
                        {p.isHeirloom1of1 ? 'View Heirloom →' : 'Details →'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function StorefrontCatalogPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
      <CatalogContent />
    </Suspense>
  );
}
