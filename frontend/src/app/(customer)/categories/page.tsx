'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import LandingNavbar from '@/components/customer/landing/LandingNavbar';
import { CategoryTreeNode } from '@/shared/types/index';

const LEVEL_CONFIG = [
  { level: 0, label: 'Root Cluster', badgeBg: 'rgba(179, 137, 56, 0.15)', badgeColor: 'var(--gold)' },
  { level: 1, label: 'Subcategory', badgeBg: 'rgba(20, 90, 82, 0.12)', badgeColor: '#145A52' },
  { level: 2, label: 'Sub-subcategory', badgeBg: 'rgba(140, 29, 47, 0.12)', badgeColor: '#8C1D2F' },
  { level: 3, label: 'Sub-sub-subcategory', badgeBg: 'rgba(88, 28, 135, 0.12)', badgeColor: '#6B21A8' },
];

export default function CraftCategoriesPage() {
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await apiRequest('/categories');
        if (res && res.tree && res.tree.length > 0) {
          setTree(res.tree);
        } else if (res && res.categories) {
          setTree(res.categories);
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Universal Storefront Navigation */}
      <LandingNavbar />

      <div style={{ paddingTop: '120px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '1300px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.22em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>
            AUTHENTIC WEAVE HIERARCHY
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', color: 'var(--text)', marginTop: '8px' }}>
            Saree Categories & Weave Clusters
          </h1>
          <p style={{ maxWidth: '680px', margin: '12px auto 0', color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Explore certified authentic handloom pure silk sarees by weaving craft clusters, traditional techniques, and specialized border motifs.
          </p>
        </div>

        {/* Tree Explorer View */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gold)' }}>
            <p style={{ letterSpacing: '0.2em', fontWeight: 600 }}>CURATING WEAVE CLUSTERS...</p>
          </div>
        ) : tree.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(179, 137, 56, 0.2)' }}>
            <p style={{ color: 'var(--text-dim)' }}>No craft categories available currently.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
            {tree.map((cluster) => (
              <div
                key={cluster.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(179, 137, 56, 0.22)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(26, 19, 13, 0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Cluster Header Image */}
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <img
                    src={cluster.image || '/frames/ezgif-frame-240.jpg'}
                    alt={cluster.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
                    }}
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
                      fontWeight: 700,
                      borderRadius: '4px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    📍 {cluster.region || 'Heritage'} Cluster
                  </span>

                  <span
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      padding: '3px 10px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--text)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                    }}
                  >
                    Σ {cluster.totalDescendantProductCount || cluster.productCount || 0} Sarees
                  </span>
                </div>

                {/* Cluster Body */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)', margin: 0, fontWeight: 700 }}>
                      {cluster.name}
                    </h3>

                    {cluster.description && (
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '8px', lineHeight: 1.5 }}>
                        {cluster.description}
                      </p>
                    )}

                    {/* Subcategories (Level 1, 2, 3) */}
                    {cluster.children && cluster.children.length > 0 && (
                      <div style={{ marginTop: '18px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          Specialized Weaves & Styles:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                          {cluster.children.map((sub) => (
                            <div key={sub.id} style={{ background: '#FAF8F5', borderRadius: '6px', padding: '8px 12px', border: '1px solid rgba(179, 137, 56, 0.15)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Link
                                  href={`/catalog?category=${encodeURIComponent(sub.slug)}`}
                                  style={{
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    color: 'var(--text)',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <span>🌿</span>
                                  <span style={{ textDecoration: 'underline' }}>{sub.name}</span>
                                </Link>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                                  {sub.totalDescendantProductCount || sub.productCount || 0} pcs
                                </span>
                              </div>

                              {/* Nested Sub-subcategories (Level 2) */}
                              {sub.children && sub.children.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', paddingLeft: '16px' }}>
                                  {sub.children.map((subsub) => (
                                    <Link
                                      key={subsub.id}
                                      href={`/catalog?category=${encodeURIComponent(subsub.slug)}`}
                                      style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 8px',
                                        background: '#FFFFFF',
                                        border: '1px solid rgba(179, 137, 56, 0.2)',
                                        borderRadius: '3px',
                                        color: '#145A52',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                      }}
                                    >
                                      🍃 {subsub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: '20px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(179, 137, 56, 0.15)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Link
                      href={`/catalog?category=${encodeURIComponent(cluster.slug)}`}
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--gold)',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      Explore All {cluster.name} Sarees →
                    </Link>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      Silk Mark Certified
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
