'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { apiRequest } from '@/lib/api';
import { Product } from '../../../../../shared/types/index';

export default function PortalCatalogPage() {
  const { hasCapability, isAdmin } = usePermissions();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    sellingPrice: '',
    comparePrice: '',
    costPrice: '',
    stock: 1,
    isHeirloom1of1: true,
    fabric: 'Pure Katan Silk',
    zariType: 'Pure Gold Zari',
    craftRegion: 'Varanasi',
    weaveStyle: 'Kadhwa',
    silkMarkNumber: '',
    videoUrl: '',
    tags: 'Exclusive, Bridal',
    images: '/frames/ezgif-frame-240.jpg',
  });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest(`/products?search=${encodeURIComponent(search)}`);
      setProducts(res.products || []);
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/products', {
        method: 'POST',
        data: {
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()),
          images: formData.images.split(',').map((i) => i.trim()),
        },
      });
      setShowAddModal(false);
      fetchProducts();
      // Reset form
      setFormData({
        name: '',
        sku: '',
        description: '',
        sellingPrice: '',
        comparePrice: '',
        costPrice: '',
        stock: 1,
        isHeirloom1of1: true,
        fabric: 'Pure Katan Silk',
        zariType: 'Pure Gold Zari',
        craftRegion: 'Varanasi',
        weaveStyle: 'Kadhwa',
        silkMarkNumber: '',
        videoUrl: '',
        tags: 'Exclusive, Bridal',
        images: '/frames/ezgif-frame-240.jpg',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saree from the catalog?')) return;
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            INVENTORY MANAGEMENT
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>
            Saree Catalog
          </h1>
        </div>

        {hasCapability('products:create_edit') && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 20px',
              background: 'var(--gold)',
              border: 'none',
              borderRadius: '6px',
              color: '#110c08',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>+</span> Add New Saree
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          background: 'var(--bg-deep)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Search by Saree Name, SKU, or Craft Region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'rgba(10, 6, 2, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '0.88rem',
            outline: 'none',
          }}
        />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {products.length} Sarees Listed
        </span>
      </div>

      {/* Product Table */}
      <div
        style={{
          background: 'var(--bg-deep)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Saree</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>SKU</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Craft Region</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Selling Price</th>
              {hasCapability('finance:view') && (
                <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Cost Price 🔒</th>
              )}
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Stock</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  Loading catalog...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No sarees found matching your criteria.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={p.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                        alt={p.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div>
                        <p style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 500 }}>{p.name}</p>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{p.fabric} • {p.zariType}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--gold)' }}>
                    {p.sku}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#fff' }}>
                    {p.craftRegion}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                    ₹{p.sellingPrice.toLocaleString('en-IN')}
                  </td>
                  {hasCapability('finance:view') && (
                    <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#9ca3af' }}>
                      {p.costPrice ? `₹${p.costPrice.toLocaleString('en-IN')}` : '—'}
                    </td>
                  )}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: p.stock > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: p.stock > 0 ? '#4ade80' : '#f87171',
                      }}
                    >
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {p.isHeirloom1of1 ? (
                      <span style={{ fontSize: '0.72rem', padding: '3px 6px', background: 'rgba(201, 168, 76, 0.2)', color: 'var(--gold)', borderRadius: '4px', border: '1px solid var(--gold)' }}>
                        👑 1-of-1 Heirloom
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Standard Edition</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`/product/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', color: '#fff', fontSize: '0.75rem', textDecoration: 'none' }}
                      >
                        Preview ↗
                      </a>
                      {hasCapability('products:create_edit') && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{ padding: '4px 8px', background: 'rgba(220, 38, 38, 0.15)', border: 'none', borderRadius: '4px', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer' }}
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

      {/* Add Saree Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bg-deep)',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '12px',
              padding: '32px',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#fff' }}>
                Add Handloom Saree to Catalog
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Saree Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Varanasi Vintage Kadhwa Katan Silk Saree"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Craft Region *</label>
                  <select
                    value={formData.craftRegion}
                    onChange={(e) => setFormData({ ...formData, craftRegion: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value="Varanasi">Varanasi (Banarasi)</option>
                    <option value="Kanchipuram">Kanchipuram</option>
                    <option value="Yeola">Yeola (Paithani)</option>
                    <option value="Chanderi">Chanderi</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Fabric *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Katan Silk"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="38500"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Compare Price (₹)</label>
                  <input
                    type="number"
                    placeholder="45000"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                {hasCapability('finance:view') && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Cost Price (₹) 🔒</label>
                    <input
                      type="number"
                      placeholder="22000"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Zari Type</label>
                  <select
                    value={formData.zariType}
                    onChange={(e) => setFormData({ ...formData, zariType: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value="Pure Gold Zari">Pure Gold Zari</option>
                    <option value="Tested Zari">Tested Zari</option>
                    <option value="Antique Copper">Antique Copper</option>
                    <option value="Silver Zari">Silver Zari</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Silk Mark Cert #</label>
                  <input
                    type="text"
                    placeholder="SM-IN-2026-8891"
                    value={formData.silkMarkNumber}
                    onChange={(e) => setFormData({ ...formData, silkMarkNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isHeirloom1of1}
                    onChange={(e) => setFormData({ ...formData, isHeirloom1of1: e.target.checked })}
                  />
                  <span>👑 Tag as 1-of-1 Exclusive Heirloom (Never Repeated)</span>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px' }}>Craft Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe pit-loom weaving hours, motifs, and drape characteristics..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', background: 'var(--gold)', border: 'none', borderRadius: '6px', color: '#110c08', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Saree
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
