'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Category, SubCategory } from '@/shared/types/index';
import SingleImageUpload from '@/components/admin/SingleImageUpload';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function AdminCategoriesPage() {
  const { hasCapability, isAdmin } = usePermissions();
  const canEdit = isAdmin || hasCapability('products:create_edit');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catRegion, setCatRegion] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catIsFeatured, setCatIsFeatured] = useState(false);
  const [catDisplayOrder, setCatDisplayOrder] = useState(0);
  const [initialSubCats, setInitialSubCats] = useState<string[]>(['']);

  // SubCategory Modal State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');
  const [subDescription, setSubDescription] = useState('');

  // UI status feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/categories`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sutradara_token') || ''}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.categories) {
        setCategories(data.categories);
      } else {
        showToast('error', data.error || 'Failed to fetch categories');
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
      showToast('error', 'Network error while fetching categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleToggleFeatured = async (cat: Category) => {
    try {
      const res = await fetch(`${API_BASE}/admin/categories/${cat.id}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sutradara_token') || ''}`,
        },
        body: JSON.stringify({ isFeatured: !cat.isFeatured }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message || 'Homepage spotlight updated.');
        fetchCategories();
      } else {
        showToast('error', data.error || 'Failed to update category spotlight.');
      }
    } catch (err) {
      showToast('error', 'Network error while updating category spotlight.');
    }
  };

  const handleOpenCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatSlug(cat.slug);
      setCatRegion(cat.region);
      setCatDescription(cat.description || '');
      setCatImage(cat.image || '');
      setCatIsFeatured(Boolean(cat.isFeatured));
      setCatDisplayOrder(cat.displayOrder || 0);
      setInitialSubCats([]);
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatSlug('');
      setCatRegion('');
      setCatDescription('');
      setCatImage('');
      setCatIsFeatured(false);
      setCatDisplayOrder(0);
      setInitialSubCats(['']);
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catRegion) {
      showToast('error', 'Category Name and Craft Region are required.');
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem('sutradara_token') || '';
    const payload: any = {
      name: catName,
      slug: catSlug || generateSlug(catName),
      region: catRegion,
      description: catDescription,
      image: catImage || null,
      isFeatured: catIsFeatured,
      displayOrder: catDisplayOrder,
    };

    if (!editingCategory) {
      payload.subCategories = initialSubCats.filter((s) => s.trim().length > 0);
    }

    try {
      const url = editingCategory
        ? `${API_BASE}/admin/categories/${editingCategory.id}`
        : `${API_BASE}/admin/categories`;
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message || 'Category saved successfully.');
        setIsCatModalOpen(false);
        fetchCategories();
      } else {
        showToast('error', data.error || 'Failed to save category.');
      }
    } catch (err) {
      showToast('error', 'Network error while saving category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if ((cat.productCount || 0) > 0) {
      showToast(
        'error',
        `Cannot delete "${cat.name}" because ${cat.productCount} saree(s) are attached to it. Please reassign or remove products first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete "${cat.name}" and all its subcategories?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/categories/${cat.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sutradara_token') || ''}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message || 'Category deleted.');
        fetchCategories();
      } else {
        showToast('error', data.error || 'Failed to delete category.');
      }
    } catch (err) {
      showToast('error', 'Network error while deleting category.');
    }
  };

  const handleOpenSubModal = (cat: Category, sub?: SubCategory) => {
    setTargetCategory(cat);
    if (sub) {
      setEditingSubCategory(sub);
      setSubName(sub.name);
      setSubSlug(sub.slug);
      setSubDescription(sub.description || '');
    } else {
      setEditingSubCategory(null);
      setSubName('');
      setSubSlug('');
      setSubDescription('');
    }
    setIsSubModalOpen(true);
  };

  const handleSaveSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !targetCategory) {
      showToast('error', 'Subcategory name is required.');
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem('sutradara_token') || '';
    const payload = {
      name: subName,
      slug: subSlug || `${targetCategory.slug}-${generateSlug(subName)}`,
      description: subDescription,
    };

    try {
      const url = editingSubCategory
        ? `${API_BASE}/admin/categories/subcategories/${editingSubCategory.id}`
        : `${API_BASE}/admin/categories/${targetCategory.id}/subcategories`;
      const method = editingSubCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message || 'Subcategory saved.');
        setIsSubModalOpen(false);
        fetchCategories();
      } else {
        showToast('error', data.error || 'Failed to save subcategory.');
      }
    } catch (err) {
      showToast('error', 'Network error while saving subcategory.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubCategory = async (sub: SubCategory) => {
    if ((sub.productCount || 0) > 0) {
      showToast(
        'error',
        `Cannot delete "${sub.name}" because ${sub.productCount} saree(s) are assigned to it. Reassign products first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete subcategory "${sub.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/categories/subcategories/${sub.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sutradara_token') || ''}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', data.message || 'Subcategory deleted.');
        fetchCategories();
      } else {
        showToast('error', data.error || 'Failed to delete subcategory.');
      }
    } catch (err) {
      showToast('error', 'Network error while deleting subcategory.');
    }
  };

  // Filtered categories
  const regions = Array.from(new Set(categories.map((c) => c.region))).filter(Boolean);
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.subCategories && c.subCategories.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesRegion = selectedRegion === 'ALL' || c.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const totalSubCategories = categories.reduce((acc, c) => acc + (c.subCategories?.length || 0), 0);
  const totalProducts = categories.reduce((acc, c) => acc + (c.productCount || 0), 0);

  return (
    <div style={{ padding: '36px 40px', background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            padding: '14px 22px',
            borderRadius: '8px',
            background: toastMessage.type === 'success' ? '#065F46' : '#991B1B',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.88rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            zIndex: 1100,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toastMessage.type === 'success' ? '✓ ' : '✕ '} {toastMessage.text}
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.2em', fontWeight: 700 }}>
              CATEGORIES &amp; WEAVES
            </span>
            <span style={{ padding: '2px 8px', background: 'rgba(179, 137, 56, 0.12)', color: 'var(--gold)', fontSize: '0.68rem', borderRadius: '12px', fontWeight: 700 }}>
              STOREFRONT SYNCED
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', margin: 0, fontWeight: 700 }}>
            Saree Categories &amp; Sub-Categories
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
            Manage saree categories, regional origin, and weave styles.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => handleOpenCatModal()}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, var(--gold) 0%, #8E6822 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(179, 137, 56, 0.35)',
              transition: 'transform 0.2s ease',
            }}
          >
            <span>✨</span>
            <span>+ Add New Category</span>
          </button>
        )}
      </div>

      {/* KPI Overview Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Total Categories
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', fontWeight: 700, marginTop: '4px' }}>
            {categories.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Active Categories</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Sub-Categories
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)', fontWeight: 700, marginTop: '4px' }}>
            {totalSubCategories}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Avg. {(totalSubCategories / (categories.length || 1)).toFixed(1)} per category</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Total Sarees
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#145A52', fontWeight: 700, marginTop: '4px' }}>
            {totalProducts}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Across all categories</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)', boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Origin States
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#8C1D2F', fontWeight: 700, marginTop: '4px' }}>
            {regions.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Weaving Regions</span>
        </div>
      </div>

      {/* 🌟 Homepage Top 4 Spotlight Selection Strip */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(179, 137, 56, 0.08) 0%, rgba(20, 90, 82, 0.05) 100%)',
          border: '1.5px solid var(--gold)',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '28px',
          boxShadow: '0 4px 20px rgba(179, 137, 56, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>⭐</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text)', margin: 0, fontWeight: 700 }}>
                Homepage Top 4 Spotlight Grid
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '0.84rem' }}>
              Choose which 4 saree categories appear in the prominent 2x2 luxury card showcase on the customer homepage.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                padding: '6px 14px',
                background: categories.filter((c) => c.isFeatured).length === 4 ? '#059669' : 'var(--gold)',
                color: '#ffffff',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {categories.filter((c) => c.isFeatured).length} / 4 Categories Active
            </span>
          </div>
        </div>

        {/* Spotlight Active Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {categories
            .filter((c) => c.isFeatured)
            .slice(0, 4)
            .map((cat, idx) => (
              <div
                key={cat.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--gold)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(179, 137, 56, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--gold)',
                      color: '#ffffff',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cat.name}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      📍 {cat.region}
                    </span>
                  </div>
                </div>

                {canEdit && (
                  <button
                    onClick={() => handleToggleFeatured(cat)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      padding: '4px',
                    }}
                    title="Remove from Homepage Spotlight"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>
            ))}

          {categories.filter((c) => c.isFeatured).length < 4 && (
            <div
              style={{
                border: '1.5px dashed rgba(179, 137, 56, 0.4)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dim)',
                fontSize: '0.8rem',
                fontStyle: 'italic',
              }}
            >
              Click ⭐ on any category below to fill slot {categories.filter((c) => c.isFeatured).length + 1}
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by category, region, sub-weave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              background: '#FAF8F5',
              color: 'var(--text)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Region:</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              background: '#FAF8F5',
              color: 'var(--text)',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Regions ({categories.length})</option>
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gold)' }}>
          <p style={{ letterSpacing: '0.15em', fontWeight: 600 }}>LOADING CATEGORIES...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div style={{ background: '#FFFFFF', padding: '48px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)', textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>🏷️</span>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', margin: '0 0 8px', fontSize: '1.2rem' }}>
            No Categories Found
          </h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 20px' }}>
            {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first saree category to organize products.'}
          </p>
          {canEdit && !searchQuery && (
            <button
              onClick={() => handleOpenCatModal()}
              style={{
                padding: '10px 20px',
                background: 'var(--gold)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Add Category
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid rgba(179, 137, 56, 0.22)',
                boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Category Header Card */}
              <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(179, 137, 56, 0.12)', background: 'linear-gradient(180deg, #FAF8F5 0%, #FFFFFF 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        style={{
                          width: '46px',
                          height: '46px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid rgba(179, 137, 56, 0.3)',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '8px',
                          background: 'rgba(179, 137, 56, 0.1)',
                          border: '1px solid rgba(179, 137, 56, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          flexShrink: 0,
                        }}
                      >
                        🏷️
                      </div>
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ padding: '2px 8px', background: 'rgba(179, 137, 56, 0.14)', color: 'var(--gold)', fontSize: '0.7rem', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                          📍 {cat.region}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                          /{cat.slug}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', margin: 0, fontWeight: 700 }}>
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', display: 'block' }}>
                      {cat.productCount || 0}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Sarees
                    </span>
                  </div>
                </div>

                {cat.description && (
                  <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Subcategories Area */}
              <div style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Sub-Categories ({cat.subCategories?.length || 0})
                  </span>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenSubModal(cat)}
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(179, 137, 56, 0.1)',
                        color: 'var(--gold)',
                        border: '1px solid rgba(179, 137, 56, 0.25)',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      + Add Sub-Category
                    </button>
                  )}
                </div>

                {cat.subCategories && cat.subCategories.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {cat.subCategories.map((sub) => (
                      <div
                        key={sub.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#FAF8F5',
                          borderRadius: '6px',
                          border: '1px solid rgba(179, 137, 56, 0.14)',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', display: 'block' }}>
                            {sub.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                            {sub.slug}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ padding: '2px 6px', background: '#FFFFFF', border: '1px solid rgba(179, 137, 56, 0.2)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                            {sub.productCount || 0} pcs
                          </span>

                          {canEdit && (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => handleOpenSubModal(cat, sub)}
                                title="Edit Sub-Category"
                                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.78rem', padding: '2px' }}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteSubCategory(sub)}
                                title="Delete Sub-Category"
                                style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '0.78rem', padding: '2px' }}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '16px', background: '#FAF8F5', borderRadius: '6px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem', marginBottom: '16px' }}>
                    No sub-categories defined yet.
                  </div>
                )}

                {/* Card Actions Footer */}
                {canEdit && (
                  <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(179, 137, 56, 0.12)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleToggleFeatured(cat)}
                      style={{
                        padding: '6px 12px',
                        background: cat.isFeatured ? 'rgba(179, 137, 56, 0.12)' : '#FFFFFF',
                        border: `1px solid ${cat.isFeatured ? 'var(--gold)' : 'rgba(179, 137, 56, 0.3)'}`,
                        color: cat.isFeatured ? 'var(--gold-dark)' : 'var(--text)',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Toggle Homepage Spotlight"
                    >
                      <span>{cat.isFeatured ? '⭐ Spotlight Active' : '☆ Add to Spotlight'}</span>
                    </button>
                    <button
                      onClick={() => handleOpenCatModal(cat)}
                      style={{
                        padding: '6px 12px',
                        background: '#FFFFFF',
                        border: '1px solid rgba(179, 137, 56, 0.3)',
                        color: 'var(--text)',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      style={{
                        padding: '6px 12px',
                        background: '#FFFFFF',
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        color: '#DC2626',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal (Create / Edit) */}
      {isCatModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(26, 19, 13, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid rgba(179, 137, 56, 0.35)',
              padding: '28px 32px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
              color: 'var(--text)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)', margin: 0, fontWeight: 700 }}>
                {editingCategory ? `Edit Category: ${editingCategory.name}` : '✨ Add Saree Category'}
              </h2>
              <button
                onClick={() => setIsCatModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kanchipuram Silk"
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value);
                      setCatSlug(generateSlug(e.target.value));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      background: '#FAF8F5',
                      color: 'var(--text)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        URL Slug *
                      </label>
                      <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600 }}>
                        ⚡ Auto-generated
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. kanjivaram-silk"
                      value={catSlug}
                      onChange={(e) => setCatSlug(generateSlug(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid rgba(179, 137, 56, 0.3)',
                        background: '#FAF8F5',
                        color: 'var(--text)',
                        fontSize: '0.88rem',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                      Region / State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tamil Nadu"
                      value={catRegion}
                      onChange={(e) => setCatRegion(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid rgba(179, 137, 56, 0.3)',
                        background: '#FAF8F5',
                        color: 'var(--text)',
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <SingleImageUpload
                    value={catImage}
                    onChange={(url) => setCatImage(url)}
                    label="Category Image / Banner (Single Image)"
                    helperText="Upload a craft cluster or weave banner photo (JPG, PNG, WEBP)."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Description &amp; Highlights
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the saree weave, origin, fabric details..."
                    value={catDescription}
                    onChange={(e) => setCatDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      background: '#FAF8F5',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Homepage Spotlight Toggle */}
                <div
                  style={{
                    background: '#FAF8F5',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(179, 137, 56, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'block' }}>
                      ⭐ Homepage Top 4 Spotlight
                    </strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      Feature in the 2x2 luxury card showcase on the customer storefront homepage.
                    </span>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={catIsFeatured}
                      onChange={(e) => setCatIsFeatured(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: catIsFeatured ? 'var(--gold)' : '#D1D5DB',
                        borderRadius: '24px',
                        transition: '0.3s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '18px',
                          width: '18px',
                          left: catIsFeatured ? '22px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#ffffff',
                          borderRadius: '50%',
                          transition: '0.3s',
                        }}
                      />
                    </span>
                  </label>
                </div>

                {!editingCategory && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        Sub-Categories (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={() => setInitialSubCats([...initialSubCats, ''])}
                        style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        + Add Another
                      </button>
                    </div>
                    {initialSubCats.map((sub, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          placeholder={`e.g. ${index === 0 ? 'Traditional Korvai' : index === 1 ? 'Pure Zari Bridal' : 'Checks Pattern'}`}
                          value={sub}
                          onChange={(e) => {
                            const updated = [...initialSubCats];
                            updated[index] = e.target.value;
                            setInitialSubCats(updated);
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(179, 137, 56, 0.3)',
                            background: '#FAF8F5',
                            color: 'var(--text)',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                        {initialSubCats.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setInitialSubCats(initialSubCats.filter((_, i) => i !== index))}
                            style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '1rem', padding: '0 6px' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCatModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      color: 'var(--text)',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                      padding: '10px 22px',
                      background: 'var(--gold)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(179, 137, 56, 0.35)',
                    }}
                  >
                    {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SubCategory Modal (Create / Edit) */}
      {isSubModalOpen && targetCategory && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(26, 19, 13, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid rgba(179, 137, 56, 0.35)',
              padding: '28px 32px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
              color: 'var(--text)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  CATEGORY: {targetCategory.name}
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text)', margin: '2px 0 0', fontWeight: 700 }}>
                  {editingSubCategory ? `Edit Sub-Category: ${editingSubCategory.name}` : '+ Add Sub-Category'}
                </h2>
              </div>
              <button
                onClick={() => setIsSubModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubCategory}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Sub-Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traditional Korvai"
                    value={subName}
                    onChange={(e) => {
                      setSubName(e.target.value);
                      setSubSlug(`${targetCategory.slug}-${generateSlug(e.target.value)}`);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      background: '#FAF8F5',
                      color: 'var(--text)',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      Sub-Category URL Slug
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 600 }}>
                      ⚡ Auto-generated
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. kanjivaram-traditional-korvai"
                    value={subSlug}
                    onChange={(e) => setSubSlug(generateSlug(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      background: '#FAF8F5',
                      color: 'var(--text)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key features, zari details, pattern notes..."
                    value={subDescription}
                    onChange={(e) => setSubDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      background: '#FAF8F5',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSubModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      color: 'var(--text)',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                      padding: '10px 22px',
                      background: 'var(--gold)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(179, 137, 56, 0.35)',
                    }}
                  >
                    {isSaving ? 'Saving...' : editingSubCategory ? 'Update Sub-Category' : 'Add Sub-Category'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
