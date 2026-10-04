'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import { apiRequest } from '@/lib/api';
import { Product, Category } from '@/shared/types/index';
import MultiImageUpload from '@/components/admin/MultiImageUpload';
import BarcodeControl from '@/components/admin/BarcodeControl';

const FABRICS = [
  'Pure Katan Silk',
  '3-Ply Mulberry Silk',
  'Pure Paithani Silk',
  'Chanderi Silk',
  'Double Ikkat Pure Mulberry Silk',
  'Bishnupuri Murshidabad Silk',
  'Mysore Crepe Silk (Pure Gold Zari)',
  'Pure Wild Muga Silk',
  'Pure Tussar Georgette',
  'Organza Silk',
];

const ZARI_TYPES = [
  'Pure Gold Zari',
  '2G Tested Gold Zari',
  'Tested Gold Zari',
  'Antique Copper Zari',
  'Pure Silver Zari',
  'Tested Silver Zari',
  'Antique Metallic Thread',
];

const WEAVE_STYLES = [
  'Kadhwa (Hand-interlocked)',
  'Korvai (Interlocking Temple Border)',
  'Tapestry (Oblique Weave)',
  'Tanchoi Multi-Warp',
  'Jangla Shikargah',
  'Double Ikkat Warp & Weft Resists',
  'Swarnachari Gold Brocade',
  'Meenakari Butis',
  'Traditional Loom',
];

export default function PortalCatalogPage() {
  const { hasCapability, isAdmin } = usePermissions();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [formExpanded, setFormExpanded] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Top Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    sellingPrice: '',
    comparePrice: '',
    costPrice: '',
    stock: 1,
    isHeirloom1of1: true,
    isFeatured: false,
    isDealOfDay: false,
    fabric: 'Pure Katan Silk',
    zariType: 'Pure Gold Zari',
    craftRegion: 'Varanasi',
    weaveStyle: 'Kadhwa (Hand-interlocked)',
    silkMarkNumber: '',
    videoUrl: '',
    tags: 'Bridal, Heirloom, Pure Silk',
    images: [] as string[],
    // Procurement Vault
    weaverGuildName: '',
    weaverContact: '',
    invoiceRef: '',
    procurementNotes: '',
  });

  // Fetch Categories & Products
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [catsRes, prodsRes] = await Promise.all([
        apiRequest('/categories'),
        apiRequest(`/products?search=${encodeURIComponent(search)}`),
      ]);

      const catList: Category[] = catsRes.categories || [];
      setCategories(catList);
      setProducts(prodsRes.products || []);

      // Set default category if not selected
      if (!formData.categoryId && catList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          categoryId: catList[0].id,
          craftRegion: catList[0].region || prev.craftRegion,
        }));
      }
    } catch (e: any) {
      if (e?.status !== 401) {
        console.warn('Catalog load notice:', e?.message || e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Handle Category Change (Hierarchical Selection)
  const handleCategoryChange = (catId: string) => {
    const selected = categories.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      craftRegion: selected?.region || prev.craftRegion,
    }));
  };

  const activeCategory = categories.find((c) => c.id === formData.categoryId);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const res = await apiRequest('/products', {
        method: 'POST',
        data: {
          ...formData,
          sellingPrice: parseFloat(formData.sellingPrice),
          comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
          costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
          stock: parseInt(String(formData.stock), 10) || 1,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          images: formData.images.length > 0 ? formData.images : ['/frames/ezgif-frame-240.jpg'],
        },
      });

      setFeedback({
        type: 'success',
        message: `✨ Saree "${res.product?.name || formData.name}" successfully added to the PostgreSQL catalog!`,
      });

      // Reload products table
      const prodsRes = await apiRequest(`/products?search=${encodeURIComponent(search)}`);
      setProducts(prodsRes.products || []);

      // Reset form
      setFormData((prev) => ({
        ...prev,
        name: '',
        sku: '',
        description: '',
        sellingPrice: '',
        comparePrice: '',
        costPrice: '',
        stock: 1,
        silkMarkNumber: '',
        videoUrl: '',
        images: [],
        weaverGuildName: '',
        weaverContact: '',
        invoiceRef: '',
        procurementNotes: '',
      }));
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to add saree. Please check required fields.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the catalog?`)) return;
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: `Deleted "${name}" from catalog.` });
      const prodsRes = await apiRequest(`/products?search=${encodeURIComponent(search)}`);
      setProducts(prodsRes.products || []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete.' });
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
            CATALOG MANAGEMENT
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', marginTop: '4px' }}>
            Saree Catalog & Products
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            href="/portal/categories"
            style={{
              padding: '10px 18px',
              background: '#FFFFFF',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🏷️</span>
            <span>Manage Categories</span>
          </Link>

          {hasCapability('products:create_edit') && (
            <button
              onClick={() => setFormExpanded(!formExpanded)}
              style={{
                padding: '10px 20px',
                background: formExpanded ? 'rgba(179, 137, 56, 0.12)' : 'var(--gold)',
                border: '1px solid var(--gold)',
                borderRadius: '6px',
                color: formExpanded ? 'var(--gold-dark, #8A6418)' : '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(179, 137, 56, 0.2)',
              }}
            >
              <span>{formExpanded ? '▲ Collapse Intake Form' : '+ Add New Saree'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '0.88rem',
            background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: feedback.type === 'success' ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
            color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 600,
          }}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 👑 PROMINENT TOP FORM: Add New Saree */}
      {hasCapability('products:create_edit') && formExpanded && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(179, 137, 56, 0.25)',
            borderRadius: '12px',
            padding: '32px',
            marginBottom: '36px',
            boxShadow: '0 8px 30px rgba(26, 19, 13, 0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(179, 137, 56, 0.18)', paddingBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
                PRODUCT ENTRY
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)', marginTop: '2px' }}>
                Add New Saree
              </h2>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', background: 'var(--bg-deep)', border: '1px solid rgba(179,137,56,0.15)', padding: '6px 12px', borderRadius: '4px', fontWeight: 500 }}>
              Live Inventory
            </span>
          </div>

          <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Row 1: Hierarchical Category & Title */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              {/* Hierarchical Category Selector */}
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Hierarchical Category / Weave Placement *
                  </label>
                  {activeCategory && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700 }}>
                      📍 {activeCategory.breadcrumbs && activeCategory.breadcrumbs.length > 0 ? activeCategory.breadcrumbs.map((b) => b.name).join(' > ') : activeCategory.name} [Tier {activeCategory.level ?? 0}]
                    </span>
                  )}
                </div>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  {categories.map((c) => {
                    const level = c.level ?? 0;
                    const prefix = level === 0 ? '👑 ' : level === 1 ? '  🌿 ' : level === 2 ? '    🍃 ' : '      ✨ ';
                    const breadcrumbText = c.breadcrumbs && c.breadcrumbs.length > 0
                      ? c.breadcrumbs.map((b) => b.name).join(' > ')
                      : c.name;
                    return (
                      <option key={c.id} value={c.id}>
                        {prefix}{breadcrumbText} {c.region ? `(${c.region})` : ''} [Tier {level}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Saree Title */}
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Saree Title / Heirloom Name *
                  </label>
                  {formData.name && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600 }}>
                      ⚡ Auto URL: /product/{formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Varanasi Royal Kadhwa Pure Katan Silk Saree"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Row 2: Specifications */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
              {/* SKU / Barcode (Auto-generate, Type, or Scan) */}
              <div>
                <BarcodeControl
                  value={formData.sku}
                  onChange={(sku) => setFormData({ ...formData, sku })}
                  craftRegion={formData.craftRegion}
                  categoryName={activeCategory?.name}
                  fabric={formData.fabric}
                />
              </div>

              {/* Craft Region */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Craft Region / Loom Cluster *
                </label>
                <input
                  type="text"
                  required
                  value={formData.craftRegion}
                  onChange={(e) => setFormData({ ...formData, craftRegion: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Fabric */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Fabric & Purity *
                </label>
                <select
                  required
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  {FABRICS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zari Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Zari Classification *
                </label>
                <select
                  required
                  value={formData.zariType}
                  onChange={(e) => setFormData({ ...formData, zariType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  {ZARI_TYPES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weave Style */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Weave Style / Technique
                </label>
                <select
                  value={formData.weaveStyle}
                  onChange={(e) => setFormData({ ...formData, weaveStyle: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  {WEAVE_STYLES.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Pricing & Silk Mark Certification */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px' }}>
              {/* Selling Price */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="38500"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.4)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Compare Price */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  MSRP / Strike Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="45000"
                  value={formData.comparePrice}
                  onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.25)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Cost Price */}
              {hasCapability('finance:view') && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    🔒 Wholesale Cost (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="22000"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#FFFBEB',
                      border: '1px solid rgba(217, 119, 6, 0.4)',
                      borderRadius: '6px',
                      color: '#92400e',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* Stock Count */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Initial Stock Count *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 1 })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Silk Mark Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Silk Mark Hologram #
                </label>
                <input
                  type="text"
                  placeholder="SM-IN-2026-8891"
                  value={formData.silkMarkNumber}
                  onChange={(e) => setFormData({ ...formData, silkMarkNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Row 4: Attributes & Checkboxes */}
            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', padding: '14px 18px', background: 'var(--bg-deep)', borderRadius: '8px', border: '1px solid rgba(179, 137, 56, 0.15)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isHeirloom1of1}
                  onChange={(e) => setFormData({ ...formData, isHeirloom1of1: e.target.checked })}
                />
                <span>👑 1-of-1 Single Piece Unrepeatable Heirloom</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <span>⭐ Showcase on Homepage Hero</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isDealOfDay}
                  onChange={(e) => setFormData({ ...formData, isDealOfDay: e.target.checked })}
                />
                <span>🏷️ Feature in Deal of the Day Banner</span>
              </label>
            </div>

            {/* Row 5: Description & Photos Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Artisan Provenance & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the weave history, pit loom hours, zari purity, and motifs..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FAF8F5',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <MultiImageUpload
                  value={formData.images}
                  onChange={(newImages) => setFormData({ ...formData, images: newImages })}
                  label="Product Saree Photos (Multiple Images)"
                  helperText="Upload multiple high-resolution photos of the saree. The first photo is the primary cover."
                  maxFiles={10}
                />
              </div>
            </div>

            {/* Row 6: Supplier & Cost Records (Admin Only) */}
            {hasCapability('finance:view') && (
              <div style={{ padding: '18px', background: '#FFFBEB', border: '1px dashed rgba(217, 119, 6, 0.35)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                  🔒 Supplier & Cost Records (Admin Only)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <input
                    type="text"
                    placeholder="Weaver Guild / Master Artisan Name"
                    value={formData.weaverGuildName}
                    onChange={(e) => setFormData({ ...formData, weaverGuildName: e.target.value })}
                    style={{ padding: '10px 14px', background: '#FFFFFF', border: '1px solid rgba(217, 119, 6, 0.3)', borderRadius: '4px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Weaver Phone / Loom Master Contact"
                    value={formData.weaverContact}
                    onChange={(e) => setFormData({ ...formData, weaverContact: e.target.value })}
                    style={{ padding: '10px 14px', background: '#FFFFFF', border: '1px solid rgba(217, 119, 6, 0.3)', borderRadius: '4px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Invoice Ref (e.g. INV-VAR-8812)"
                    value={formData.invoiceRef}
                    onChange={(e) => setFormData({ ...formData, invoiceRef: e.target.value })}
                    style={{ padding: '10px 14px', background: '#FFFFFF', border: '1px solid rgba(217, 119, 6, 0.3)', borderRadius: '4px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '14px 28px',
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(179, 137, 56, 0.35)',
                }}
              >
                {isSubmitting ? 'Saving to Database...' : '👑 Save Master Craft Saree to PostgreSQL'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(179, 137, 56, 0.22)',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          boxShadow: '0 2px 10px rgba(26, 19, 13, 0.03)',
        }}
      >
        <input
          type="text"
          placeholder="Search by Saree Name, SKU, Craft Cluster, or Fabric..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '280px',
            padding: '10px 14px',
            background: '#FAF8F5',
            border: '1px solid rgba(179, 137, 56, 0.25)',
            borderRadius: '6px',
            color: 'var(--text)',
            fontSize: '0.88rem',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          <span>
            Showing <strong style={{ color: 'var(--gold)' }}>{products.length}</strong> Sarees in PostgreSQL
          </span>
        </div>
      </div>

      {/* Saree Catalog Table */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(179, 137, 56, 0.22)',
          borderRadius: '8px',
          overflowX: 'auto',
          boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '960px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid rgba(179, 137, 56, 0.18)' }}>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, textTransform: 'uppercase' }}>Piece & Image</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, textTransform: 'uppercase' }}>SKU</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, textTransform: 'uppercase' }}>Category & Sub-Category</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, textTransform: 'uppercase' }}>Selling Price</th>
              {hasCapability('finance:view') && (
                <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>Wholesale 🔒</th>
              )}
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, textTransform: 'uppercase' }}>Stock</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 700, textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  Loading sarees from PostgreSQL...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No sarees found matching your criteria. Use the top intake form above to add your first piece!
                </td>
              </tr>
            ) : (
              products.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(179, 137, 56, 0.12)' }}>
                  {/* Saree & Thumbnail */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={p.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(179, 137, 56, 0.25)' }}
                      />
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text)', fontSize: '0.88rem' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{p.fabric} • {p.zariType}</span>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td style={{ padding: '14px 18px', fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 700 }}>
                    {p.sku}
                  </td>

                  {/* Category & SubCategory */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ display: 'inline-block', fontSize: '0.75rem', background: 'rgba(179, 137, 56, 0.12)', color: 'var(--gold-dark, #8A6418)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(179, 137, 56, 0.25)', fontWeight: 600 }}>
                      {p.category?.name || p.craftRegion}
                    </span>
                    {p.subCategory?.name && (
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        ↳ {p.subCategory.name}
                      </span>
                    )}
                  </td>

                  {/* Selling Price */}
                  <td style={{ padding: '14px 18px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>
                    ₹{p.sellingPrice?.toLocaleString('en-IN')}
                  </td>

                  {/* Cost Price */}
                  {hasCapability('finance:view') && (
                    <td style={{ padding: '14px 18px', fontSize: '0.88rem', color: '#92400e', fontWeight: 700, fontFamily: 'monospace' }}>
                      {p.costPrice ? `₹${p.costPrice?.toLocaleString('en-IN')}` : '-'}
                    </td>
                  )}

                  {/* Stock */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: p.stock > 0 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: p.stock > 0 ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {p.stock > 0 ? `${p.stock} in Vault` : 'Sold Out'}
                    </span>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '14px 18px' }}>
                    {p.isHeirloom1of1 ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold-dark, #8A6418)', background: 'rgba(179, 137, 56, 0.12)', padding: '2px 6px', borderRadius: '3px', border: '1px solid rgba(179, 137, 56, 0.25)', fontWeight: 600 }}>
                        👑 1-of-1
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Batch</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`/product/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: '4px 10px',
                          background: 'var(--bg-deep)',
                          border: '1px solid rgba(179, 137, 56, 0.25)',
                          borderRadius: '4px',
                          color: 'var(--text)',
                          textDecoration: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        View ↗
                      </a>
                      {hasCapability('products:create_edit') && (
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '4px',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
