'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Product } from '../../../../shared/types/index';
import DealCountdownBanner from '@/components/storefront/DealCountdownBanner';

const CRAFT_REGIONS = ['All Clusters', 'Varanasi', 'Kanchipuram', 'Yeola', 'Chanderi'];
const ZARI_TYPES = ['All Zari', 'Pure Gold Zari', 'Tested Zari', 'Antique Copper', 'Silver Zari'];

export default function StorefrontCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCluster, setSelectedCluster] = useState('All Clusters');
  const [selectedZari, setSelectedZari] = useState('All Zari');
  const [onlyHeirloom, setOnlyHeirloom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      {/* Top Deal Countdown Banner */}
      <DealCountdownBanner />

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
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.3em', color: 'var(--gold)', display: 'block' }}>
            SUTRADARA
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff' }}>
            The Handloom Sanctuary
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/catalog" style={{ color: 'var(--gold)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
            Curated Sarees
          </Link>
          <Link href="/portal/login" style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textDecoration: 'none' }}>
            Staff Portal ↗
          </Link>
        </div>
      </header>

      {/* Catalog Hero Banner */}
      <section
        style={{
          padding: '48px 32px 32px',
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

          {/* Facet Selectors */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {/* Cluster Selector */}
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              style={{
                padding: '10px 14px',
                background: 'rgba(10, 6, 2, 0.8)',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                borderRadius: '6px',
                color: 'var(--gold)',
                fontSize: '0.85rem',
              }}
            >
              {CRAFT_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* Zari Selector */}
            <select
              value={selectedZari}
              onChange={(e) => setSelectedZari(e.target.value)}
              style={{
                padding: '10px 14px',
                background: 'rgba(10, 6, 2, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            >
              {ZARI_TYPES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>

            {/* 1-of-1 Heirloom Checkbox */}
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
                        👑 1-of-1 HEIRLOOM
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
                        ✓ Silk Mark Certified
                      </span>
                    )}

                    {/* Sold Out Overlay */}
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
                            padding: '6px 16px',
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Saree Metadata */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {p.craftRegion} • {p.fabric}
                      </span>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.15rem',
                          color: '#fff',
                          marginTop: '6px',
                          lineHeight: 1.4,
                        }}
                      >
                        {p.name}
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        {p.zariType} {p.weaveStyle ? `• ${p.weaveStyle}` : ''}
                      </p>
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <span style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600 }}>
                          ₹{p.sellingPrice.toLocaleString('en-IN')}
                        </span>
                        {p.comparePrice && (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textDecoration: 'line-through', marginLeft: '8px' }}>
                            ₹{p.comparePrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>View Details →</span>
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
