'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { apiRequest } from '@/lib/api';
import { Product } from '@/shared/types/index';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  region: string;
  subCategories: { id: string; name: string; slug: string; description?: string }[];
}

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
  const [categories, setCategories] = useState<CategoryItem[]>([]);
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
    images: '/frames/ezgif-frame-240.jpg',
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

      const catList: CategoryItem[] = catsRes.categories || [];
      setCategories(catList);
      setProducts(prodsRes.products || []);

      // Set default category if not selected
      if (!formData.categoryId && catList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          categoryId: catList[0].id,
          subCategoryId: catList[0].subCategories?.[0]?.id || '',
          craftRegion: catList[0].region,
        }));
      }
    } catch (e) {
      console.error('Failed to fetch catalog data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Handle Category Change (Cascading SubCategories)
  const handleCategoryChange = (catId: string) => {
    const selected = categories.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      subCategoryId: selected?.subCategories?.[0]?.id || '',
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
          images: formData.images.split(',').map((i) => i.trim()).filter(Boolean),
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            INVENTORY &amp; CRAFT ARCHITECTURE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>
            Saree Catalog &amp; Master Intake
          </h1>
        </div>

        {hasCapability('products:create_edit') && (
          <button
            onClick={() => setFormExpanded(!formExpanded)}
            style={{
              padding: '10px 18px',
              background: formExpanded ? 'rgba(201, 168, 76, 0.15)' : 'var(--gold)',
              border: '1px solid var(--gold)',
              borderRadius: '6px',
              color: formExpanded ? 'var(--gold)' : '#110c08',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{formExpanded ? '▲ Collapse Intake Form' : '+ Add New Saree (Top Form)'}</span>
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '0.88rem',
            background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: feedback.type === 'success' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            color: feedback.type === 'success' ? '#86efac' : '#fca5a5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 👑 PROMINENT TOP FORM: Add New Master Craft Saree */}
      {hasCapability('products:create_edit') && formExpanded && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(26, 20, 14, 0.95) 0%, rgba(17, 12, 8, 0.98) 100%)',
            border: '1px solid rgba(201, 168, 76, 0.35)',
            borderRadius: '12px',
            padding: '32px',
            marginBottom: '36px',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                DIRECT LOOM ENTRY
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#fff', marginTop: '2px' }}>
                Add New Master Craft Saree
              </h2>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '4px' }}>
              Connected to PostgreSQL Database
            </span>
          </div>

          <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Row 1: Craft Cluster & Weave Taxonomy */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              {/* Category (Craft Cluster) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Craft Cluster Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#110c08',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* SubCategory (Weave Specialization) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Weave Sub-Category *
                </label>
                <select
                  required
                  value={formData.subCategoryId}
                  onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#110c08',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
                  }}
                >
                  {activeCategory?.subCategories?.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Saree Title */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Saree Title / Heirloom Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Varanasi Royal Kadhwa Pure Katan Silk Saree"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#110c08',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
                  }}
                />
              </div>
            </div>

            {/* Row 2: Specifications */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
              {/* SKU */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  SKU (Auto or Custom)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BAN-KAT-009"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#110c08',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              {/* Craft Region */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
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
                    background: '#110c08',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              {/* Fabric */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Fabric &amp; Purity *
                </label>
                <select
                  required
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#110c08',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Zari Classification *
                </label>
                <select
                  required
                  value={formData.zariType}
                  onChange={(e) => setFormData({ ...formData, zariType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#110c08',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Weave Style / Technique
                </label>
                <select
                  value={formData.weaveStyle}
                  onChange={(e) => setFormData({ ...formData, weaveStyle: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#110c08',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
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
                    background: '#110c08',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    fontWeight: 600,
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
                    background: '#110c08',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              {/* Cost Price */}
              {hasCapability('finance:view') && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
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
                      background: '#110c08',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '6px',
                      color: '#fde68a',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                    }}
                  />
                </div>
              )}

              {/* Stock Count */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
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
                    background: '#110c08',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              {/* Silk Mark Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
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
                    background: '#110c08',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.88rem',
                  }}
                />
              </div>
            </div>

            {/* Row 4: Attributes & Checkboxes */}
            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', padding: '14px 18px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isHeirloom1of1}
                  onChange={(e) => setFormData({ ...formData, isHeirloom1of1: e.target.checked })}
                />
                <span>👑 1-of-1 Single Piece Unrepeatable Heirloom</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <span>⭐ Showcase on Homepage Hero</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isDealOfDay}
                  onChange={(e) => setFormData({ ...formData, isDealOfDay: e.target.checked })}
                />
                <span>🏷️ Feature in Deal of the Day Banner</span>
              </label>
            </div>

            {/* Row 5: Description & Image URLs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Artisan Provenance &amp; Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the weave history, pit loom hours, zari purity, and motifs..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#110c08',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Image URLs (Comma-separated)
                </label>
                <textarea
                  rows={3}
                  placeholder="/frames/ezgif-frame-240.jpg, /frames/ezgif-frame-120.jpg"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#110c08',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            {/* Row 6: Confidential Wholesale Procurement Vault */}
            {hasCapability('finance:view') && (
              <div style={{ padding: '18px', background: 'rgba(201, 168, 76, 0.05)', border: '1px dashed rgba(201, 168, 76, 0.3)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                  🔒 CONFIDENTIAL WHOLESALE PROCUREMENT VAULT (1:1 WEAVER GUILD RECORD)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <input
                    type="text"
                    placeholder="Weaver Guild / Master Artisan Name"
                    value={formData.weaverGuildName}
                    onChange={(e) => setFormData({ ...formData, weaverGuildName: e.target.value })}
                    style={{ padding: '8px 12px', background: '#110c08', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Weaver Phone / Loom Master Contact"
                    value={formData.weaverContact}
                    onChange={(e) => setFormData({ ...formData, weaverContact: e.target.value })}
                    style={{ padding: '8px 12px', background: '#110c08', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontSize: '0.82rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Invoice Ref (e.g. INV-VAR-8812)"
                    value={formData.invoiceRef}
                    onChange={(e) => setFormData({ ...formData, invoiceRef: e.target.value })}
                    style={{ padding: '8px 12px', background: '#110c08', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontSize: '0.82rem' }}
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
                  color: '#110c08',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(201, 168, 76, 0.4)',
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
          background: 'var(--bg-deep)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
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
            background: 'rgba(10, 6, 2, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: '#fff',
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
          background: 'var(--bg-deep)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '960px' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Piece &amp; Image</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>SKU</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Category &amp; Sub-Category</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Selling Price</th>
              {hasCapability('finance:view') && (
                <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase' }}>Wholesale 🔒</th>
              )}
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Stock</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Actions</th>
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
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  {/* Saree & Thumbnail */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={p.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <div>
                        <strong style={{ display: 'block', color: '#fff', fontSize: '0.88rem' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{p.fabric} • {p.zariType}</span>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td style={{ padding: '14px 18px', fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--gold)' }}>
                    {p.sku}
                  </td>

                  {/* Category & SubCategory */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ display: 'inline-block', fontSize: '0.75rem', background: 'rgba(201, 168, 76, 0.15)', color: 'var(--gold)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(201, 168, 76, 0.3)' }}>
                      {p.category?.name || p.craftRegion}
                    </span>
                    {p.subCategory?.name && (
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        ↳ {p.subCategory.name}
                      </span>
                    )}
                  </td>

                  {/* Selling Price */}
                  <td style={{ padding: '14px 18px', fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
                    ₹{p.sellingPrice?.toLocaleString('en-IN')}
                  </td>

                  {/* Cost Price */}
                  {hasCapability('finance:view') && (
                    <td style={{ padding: '14px 18px', fontSize: '0.88rem', color: '#fde68a', fontFamily: 'monospace' }}>
                      {p.costPrice ? `₹${p.costPrice?.toLocaleString('en-IN')}` : '—'}
                    </td>
                  )}

                  {/* Stock */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: p.stock > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: p.stock > 0 ? '#4ade80' : '#f87171',
                      }}
                    >
                      {p.stock > 0 ? `${p.stock} in Vault` : 'Sold Out'}
                    </span>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '14px 18px' }}>
                    {p.isHeirloom1of1 ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold)', background: 'rgba(201, 168, 76, 0.1)', padding: '2px 6px', borderRadius: '3px', border: '1px solid rgba(201,168,76,0.2)' }}>
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
                          padding: '4px 8px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '4px',
                          color: '#fff',
                          textDecoration: 'none',
                          fontSize: '0.75rem',
                        }}
                      >
                        View ↗
                      </a>
                      {hasCapability('products:create_edit') && (
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          style={{
                            padding: '4px 8px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '4px',
                            color: '#f87171',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
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
