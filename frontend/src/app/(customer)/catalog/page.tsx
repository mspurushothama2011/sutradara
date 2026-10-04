'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Award, CheckCircle2, X } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { Product, Category } from '@/shared/types/index';
import LandingNavbar from '@/components/customer/landing/LandingNavbar';

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
  'Assam',
];

const ZARI_TYPES = ['All Zari', 'Pure Gold Zari', 'Tested Gold Zari', 'Antique Copper Zari', 'Silver Zari'];

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams?.get('craftRegion') || searchParams?.get('region') || 'All Clusters';
  const initialCategory = searchParams?.get('category') || '';
  const initialZari = searchParams?.get('zariType') || 'All Zari';
  const initialHeirloom = searchParams?.get('isHeirloom1of1') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCluster, setSelectedCluster] = useState(initialRegion);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedZari, setSelectedZari] = useState(initialZari);
  const [onlyHeirloom, setOnlyHeirloom] = useState(initialHeirloom);
  const [searchQuery, setSearchQuery] = useState('');

  // Load Categories for hierarchical selector
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiRequest('/categories');
        if (res && res.categories) {
          setCategories(res.categories);
        }
      } catch (e) {
        console.warn('Failed to load categories for catalog filter:', e);
      }
    }
    loadCategories();
  }, []);

  // Sync if URL search params change
  useEffect(() => {
    const r = searchParams?.get('craftRegion') || searchParams?.get('region');
    if (r && CRAFT_REGIONS.includes(r)) {
      setSelectedCluster(r);
    }
    const cat = searchParams?.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
  }, [selectedCategory, categories]);

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      let query = '/products?';
      if (selectedCategory) query += `category=${encodeURIComponent(selectedCategory)}&`;
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
  }, [selectedCluster, selectedCategory, selectedZari, onlyHeirloom, searchQuery]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      {/* Catalog Hero Banner */}
      <section
        style={{
          padding: '120px 32px 24px',
          maxWidth: '1300px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
          MASTER WEAVER CURATION
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            color: 'var(--text)',
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
            background: '#ffffff',
            border: '1px solid rgba(179, 137, 56, 0.25)',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(45, 25, 8, 0.04)',
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
              minWidth: '240px',
              background: '#FAF8F5',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />

          {/* Select Dropdowns */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Hierarchical Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '10px 14px',
                background: '#FAF8F5',
                border: '1px solid rgba(179, 137, 56, 0.35)',
                borderRadius: '6px',
                color: 'var(--gold-dark, #8c6818)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '260px',
              }}
            >
              <option value="">All Weave Categories ({categories.length})</option>
              {categories.map((c) => {
                const level = c.level ?? 0;
                const prefix = level === 0 ? '👑 ' : level === 1 ? '  🌿 ' : level === 2 ? '    🍃 ' : '      ✨ ';
                return (
                  <option key={c.id} value={c.slug}>
                    {prefix}{c.name} {c.region ? `(${c.region})` : ''}
                  </option>
                );
              })}
            </select>

            {/* Cluster Filter */}
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              style={{
                padding: '10px 14px',
                background: '#FAF8F5',
                border: '1px solid rgba(179, 137, 56, 0.35)',
                borderRadius: '6px',
                color: 'var(--text)',
                fontWeight: 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {CRAFT_REGIONS.map((r) => (
                <option key={r} value={r} style={{ background: '#ffffff', color: '#1a130d' }}>
                  {r}
                </option>
              ))}
            </select>

            {/* Zari Type Filter */}
            <select
              value={selectedZari}
              onChange={(e) => setSelectedZari(e.target.value)}
              style={{
                padding: '10px 14px',
                background: '#FAF8F5',
                border: '1px solid rgba(179, 137, 56, 0.35)',
                borderRadius: '6px',
                color: 'var(--text)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {ZARI_TYPES.map((z) => (
                <option key={z} value={z} style={{ background: '#ffffff', color: '#1a130d' }}>
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
                background: onlyHeirloom ? 'rgba(179, 137, 56, 0.15)' : '#FAF8F5',
                border: onlyHeirloom ? '1px solid var(--gold)' : '1px solid rgba(179, 137, 56, 0.25)',
                borderRadius: '3px',
                color: onlyHeirloom ? 'var(--gold-dark, #8c6818)' : 'var(--text-dim)',
                fontWeight: onlyHeirloom ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                userSelect: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <input
                type="checkbox"
                checked={onlyHeirloom}
                onChange={(e) => setOnlyHeirloom(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <Award size={13} color="var(--gold)" />
              <span>1-of-1 Heirloom Only</span>
            </label>
          </div>
        </div>

        {/* Active Breadcrumb / Filter Tag Banner */}
        {activeCategoryObj && (
          <div
            style={{
              marginTop: '14px',
              padding: '10px 16px',
              background: 'rgba(179, 137, 56, 0.08)',
              border: '1px solid var(--gold)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                ACTIVE HIERARCHY FILTER:
              </span>
              {activeCategoryObj.breadcrumbs && activeCategoryObj.breadcrumbs.length > 0 ? (
                activeCategoryObj.breadcrumbs.map((b, idx) => (
                  <span key={b.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>
                    <span>{b.name}</span>
                    {idx < (activeCategoryObj.breadcrumbs?.length ?? 1) - 1 && <span style={{ color: 'var(--text-dim)' }}>›</span>}
                  </span>
                ))
              ) : (
                <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{activeCategoryObj.name}</strong>
              )}
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                (Includes all child subcategories)
              </span>
            </div>

            <button
              onClick={() => setSelectedCategory('')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                background: '#FFFFFF',
                border: '1px solid rgba(179, 137, 56, 0.3)',
                borderRadius: '4px',
                color: 'var(--text-dim)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <X size={12} />
              <span>Clear Filter</span>
            </button>
          </div>
        )}
      </section>

      {/* Saree Grid */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 32px 80px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--gold)' }}>
            <p style={{ letterSpacing: '0.2em', fontWeight: 600 }}>CURATING AVAILABLE WEAVES...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: '#ffffff', border: '1px solid rgba(179, 137, 56, 0.2)', borderRadius: '3px', boxShadow: '0 4px 20px rgba(45, 25, 8, 0.04)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)' }}>No Sarees Matched Your Filter</h3>
            <p style={{ color: 'var(--text-dim)', marginTop: '6px', fontSize: '0.88rem' }}>
              Try loosening your category filter or resetting the cluster search.
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
                    background: '#ffffff',
                    border: '1px solid rgba(179, 137, 56, 0.22)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                    boxShadow: '0 6px 20px rgba(45, 25, 8, 0.05)',
                  }}
                >
                  {/* Image Container */}
                  <div style={{ position: 'relative', height: '360px', overflow: 'hidden', background: '#F4EFEA' }}>
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
                        <span>1-OF-1 HEIRLOOM</span>
                      </span>
                    )}

                    {/* Silk Mark Indicator */}
                    {p.silkMarkNumber && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          padding: '5px 8px',
                          background: '#145A52',
                          color: '#ffffff',
                          fontSize: '0.68rem',
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
                        <span style={{ fontSize: '0.72rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                          {p.category?.name || p.craftRegion}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {p.fabric}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.05rem',
                          color: 'var(--text)',
                          lineHeight: 1.4,
                          margin: '4px 0 8px',
                          fontWeight: 600,
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
                        borderTop: '1px solid rgba(179, 137, 56, 0.15)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
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

                      <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }}>
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
