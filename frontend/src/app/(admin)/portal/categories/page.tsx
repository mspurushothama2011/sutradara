'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Category, CategoryTreeNode } from '@/shared/types/index';
import SingleImageUpload from '@/components/admin/SingleImageUpload';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const LEVEL_CONFIG = [
  { level: 0, label: 'Root Cluster', badgeBg: 'rgba(179, 137, 56, 0.15)', badgeColor: 'var(--gold)', icon: '👑' },
  { level: 1, label: 'Subcategory', badgeBg: 'rgba(20, 90, 82, 0.12)', badgeColor: '#145A52', icon: '🌿' },
  { level: 2, label: 'Sub-subcategory', badgeBg: 'rgba(140, 29, 47, 0.12)', badgeColor: '#8C1D2F', icon: '🍃' },
  { level: 3, label: 'Sub-sub-subcategory', badgeBg: 'rgba(88, 28, 135, 0.12)', badgeColor: '#6B21A8', icon: '✨' },
];

export default function AdminCategoriesPage() {
  const { hasCapability, isAdmin } = usePermissions();
  const canEdit = isAdmin || hasCapability('products:create_edit');

  const [categories, setCategories] = useState<Category[]>([]);
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Unified Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<string>('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);

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
        if (data.tree) {
          setTree(data.tree);
          // Auto-expand all root nodes by default
          const defaultExpanded: Record<string, boolean> = {};
          data.tree.forEach((node: CategoryTreeNode) => {
            defaultExpanded[node.id] = true;
          });
          setExpandedNodes((prev) => ({ ...defaultExpanded, ...prev }));
        }
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
    setTimeout(() => setToastMessage(null), 4500);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    categories.forEach((c) => {
      all[c.id] = true;
    });
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes({});
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

  const handleOpenCreateModal = (parentCategory?: Category) => {
    setEditingCategory(null);
    setParentId(parentCategory ? parentCategory.id : '');
    setName('');
    setSlug('');
    setRegion(parentCategory?.region || '');
    setDescription('');
    setImage('');
    setIsFeatured(false);
    setDisplayOrder(0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setParentId(cat.parentId || '');
    setName(cat.name);
    setSlug(cat.slug);
    setRegion(cat.region || '');
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setIsFeatured(Boolean(cat.isFeatured));
    setDisplayOrder(cat.displayOrder || 0);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      showToast('error', 'Category Name is required.');
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem('sutradara_token') || '';
    const payload: any = {
      name: name.trim(),
      slug: slug.trim() || generateSlug(name),
      parentId: parentId ? parentId.trim() : null,
      region: region?.trim() || null,
      description: description?.trim() || null,
      image: image?.trim() || null,
      isFeatured,
      displayOrder: Number(displayOrder) || 0,
    };

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
        setIsModalOpen(false);
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
    const hasProducts = (cat.productCount || 0) > 0;
    const hasChildren = (cat.children?.length || 0) > 0;

    if (hasProducts) {
      showToast(
        'error',
        `Cannot delete "${cat.name}" because ${cat.productCount} saree(s) are attached directly to it. Reassign products first.`
      );
      return;
    }

    if (hasChildren) {
      showToast(
        'error',
        `Cannot delete "${cat.name}" because it has ${cat.children?.length} child subcategory(ies). Delete or reassign child subcategories first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
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

  // Regions for filter
  const regions = Array.from(new Set(categories.map((c) => c.region).filter(Boolean))) as string[];

  // Eligible parent categories for the dropdown in modal (exclude editing category & any Level 3 nodes)
  const eligibleParents = useMemo(() => {
    return categories.filter((c) => {
      if (editingCategory && c.id === editingCategory.id) return false;
      const level = c.level ?? 0;
      return level < 3; // Max depth is 3, so a parent can only be level 0, 1, or 2
    });
  }, [categories, editingCategory]);

  // Hierarchical display label for parent dropdown
  const getCategoryPathLabel = (cat: Category) => {
    if (cat.breadcrumbs && cat.breadcrumbs.length > 0) {
      return `${'—'.repeat(cat.level ?? 0)} ${cat.breadcrumbs.map((b) => b.name).join(' > ')} [Level ${cat.level ?? 0}]`;
    }
    return `${'—'.repeat(cat.level ?? 0)} ${cat.name} [Level ${cat.level ?? 0}]`;
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: CategoryTreeNode, depth = 0) => {
    const isExpanded = Boolean(expandedNodes[node.id]);
    const hasChildren = node.children && node.children.length > 0;
    const levelMeta = LEVEL_CONFIG[Math.min(node.level, 3)];

    const matchesSearch =
      !searchQuery ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.region && node.region.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRegion = selectedRegion === 'ALL' || node.region === selectedRegion;

    return (
      <div key={node.id} style={{ marginBottom: '8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: depth === 0 ? '#FFFFFF' : depth === 1 ? '#FAF8F5' : depth === 2 ? '#F5F2EC' : '#EFECE6',
            borderRadius: '8px',
            border: `1px solid ${depth === 0 ? 'rgba(179, 137, 56, 0.25)' : 'rgba(179, 137, 56, 0.15)'}`,
            marginLeft: `${depth * 28}px`,
            position: 'relative',
            boxShadow: depth === 0 ? '0 2px 8px rgba(0,0,0,0.03)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          {/* Connector Line for nested nodes */}
          {depth > 0 && (
            <div
              style={{
                position: 'absolute',
                left: '-18px',
                top: '50%',
                width: '16px',
                height: '1px',
                background: 'rgba(179, 137, 56, 0.4)',
              }}
            />
          )}

          {/* Left Column: Expand Button, Badge, Name & Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  border: '1px solid rgba(179, 137, 56, 0.3)',
                  background: isExpanded ? 'var(--gold)' : '#FFFFFF',
                  color: isExpanded ? '#FFFFFF' : 'var(--gold)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  padding: 0,
                }}
                title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            ) : (
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-dim)',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                }}
              >
                •
              </span>
            )}

            {/* Level Tier Badge */}
            <span
              style={{
                padding: '3px 8px',
                background: levelMeta.badgeBg,
                color: levelMeta.badgeColor,
                fontSize: '0.68rem',
                borderRadius: '4px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {levelMeta.icon} TIER {node.level}: {levelMeta.label}
            </span>

            {/* Thumbnail / Icon */}
            {node.image ? (
              <img
                src={node.image}
                alt={node.name}
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid rgba(179, 137, 56, 0.3)',
                  flexShrink: 0,
                }}
              />
            ) : null}

            {/* Name, Slug, Region */}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: depth === 0 ? '0.96rem' : '0.88rem', color: 'var(--text)' }}>
                  {node.name}
                </strong>
                {node.isFeatured && (
                  <span
                    style={{
                      padding: '2px 6px',
                      background: '#FEF3C7',
                      color: '#92400E',
                      fontSize: '0.66rem',
                      borderRadius: '4px',
                      fontWeight: 700,
                    }}
                  >
                    ⭐ SPOTLIGHT
                  </span>
                )}
                {node.region && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    📍 {node.region}
                  </span>
                )}
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                  /{node.slug}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Saree Counts & Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  padding: '3px 8px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(179, 137, 56, 0.25)',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
                title="Direct products tagged to this category"
              >
                {node.productCount} pcs
              </span>

              {hasChildren && node.totalDescendantProductCount !== node.productCount && (
                <span
                  style={{
                    padding: '3px 8px',
                    background: 'rgba(20, 90, 82, 0.08)',
                    border: '1px solid rgba(20, 90, 82, 0.25)',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#145A52',
                  }}
                  title="Total products including all descendant subcategories"
                >
                  Σ {node.totalDescendantProductCount} total
                </span>
              )}
            </div>

            {canEdit && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Add Child Subcategory button (up to Level 3 max) */}
                {node.level < 3 ? (
                  <button
                    onClick={() => handleOpenCreateModal(node)}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(179, 137, 56, 0.12)',
                      color: 'var(--gold)',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title={`Add Level ${node.level + 1} child subcategory under ${node.name}`}
                  >
                    <span>+</span>
                    <span>Add Child</span>
                  </button>
                ) : (
                  <span
                    style={{
                      padding: '4px 8px',
                      background: '#F3F4F6',
                      color: '#9CA3AF',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                    }}
                    title="Max hierarchy depth reached (Level 3 max)"
                  >
                    Max Depth
                  </span>
                )}

                {/* Spotlight Toggle */}
                {depth === 0 && (
                  <button
                    onClick={() => handleToggleFeatured(node)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      padding: '4px',
                      opacity: node.isFeatured ? 1 : 0.4,
                    }}
                    title={node.isFeatured ? 'Featured on homepage spotlight' : 'Set as homepage spotlight'}
                  >
                    ⭐
                  </button>
                )}

                {/* Edit Category */}
                <button
                  onClick={() => handleOpenEditModal(node)}
                  style={{
                    padding: '4px 8px',
                    background: '#FFFFFF',
                    border: '1px solid rgba(179, 137, 56, 0.25)',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    color: 'var(--text)',
                  }}
                  title="Edit category details"
                >
                  ✏️ Edit
                </button>

                {/* Delete Category */}
                <button
                  onClick={() => handleDeleteCategory(node)}
                  style={{
                    padding: '4px 8px',
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    color: '#DC2626',
                  }}
                  title="Delete category"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recursive Child Nodes */}
        {hasChildren && isExpanded && (
          <div style={{ marginTop: '6px' }}>
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalProducts = categories.reduce((acc, c) => acc + (c.productCount || 0), 0);
  const rootCount = tree.length;
  const subcategoryCount = categories.filter((c) => (c.level ?? 0) > 0).length;

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
              HIERARCHICAL CATEGORIES & WEAVES
            </span>
            <span style={{ padding: '2px 8px', background: 'rgba(179, 137, 56, 0.12)', color: 'var(--gold)', fontSize: '0.68rem', borderRadius: '12px', fontWeight: 700 }}>
              4 TIERS (ROOT → SUB → SUB-SUB → SUB-SUB-SUB)
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', margin: 0, fontWeight: 700 }}>
            Saree Category Hierarchy & Weave Tree
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
            Manage arbitrary sibling branching (up to 10+ subcategories per node) across 4 hierarchical tiers.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => handleOpenCreateModal()}
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
            }}
          >
            <span>✨</span>
            <span>+ Add Root Category</span>
          </button>
        )}
      </div>

      {/* KPI Overview Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Root Craft Clusters
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', fontWeight: 700, marginTop: '4px' }}>
            {rootCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Level 0 Root Nodes</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Nested Subcategories
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)', fontWeight: 700, marginTop: '4px' }}>
            {subcategoryCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Levels 1, 2, and 3</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Total Saree Inventory
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#145A52', fontWeight: 700, marginTop: '4px' }}>
            {totalProducts}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Catalogued across all tiers</span>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Weaving Regions
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#8C1D2F', fontWeight: 700, marginTop: '4px' }}>
            {regions.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Geographical Clusters</span>
        </div>
      </div>

      {/* Tier Explanation Guide Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(179, 137, 56, 0.06) 0%, rgba(20, 90, 82, 0.04) 100%)',
          border: '1px solid rgba(179, 137, 56, 0.25)',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.06em' }}>
            HIERARCHY DEPTH TIERS:
          </span>
          {LEVEL_CONFIG.map((tier) => (
            <div key={tier.level} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  padding: '2px 8px',
                  background: tier.badgeBg,
                  color: tier.badgeColor,
                  fontSize: '0.72rem',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}
              >
                Tier {tier.level}: {tier.label}
              </span>
              {tier.level < 3 && <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>→</span>}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={expandAll}
            style={{
              padding: '6px 12px',
              background: '#FFFFFF',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--text)',
            }}
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            style={{
              padding: '6px 12px',
              background: '#FFFFFF',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--text)',
            }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search hierarchy by category name, slug, weave technique..."
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

      {/* Tree Explorer View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gold)' }}>
          <p style={{ letterSpacing: '0.15em', fontWeight: 600 }}>LOADING HIERARCHICAL TREE...</p>
        </div>
      ) : tree.length === 0 ? (
        <div style={{ background: '#FFFFFF', padding: '48px', borderRadius: '10px', border: '1px solid rgba(179, 137, 56, 0.22)', textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>🏷️</span>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', margin: '0 0 8px', fontSize: '1.2rem' }}>
            No Categories Found
          </h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 20px' }}>
            Create your first root saree category to begin constructing the 4-tier weave hierarchy.
          </p>
          {canEdit && (
            <button
              onClick={() => handleOpenCreateModal()}
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
              + Add Root Category
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid rgba(179, 137, 56, 0.22)',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)',
          }}
        >
          {tree.map((rootNode) => renderTreeNode(rootNode, 0))}
        </div>
      )}

      {/* Modal: Create / Edit Category Node */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px 32px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '0.12em', fontWeight: 700 }}>
                  {editingCategory ? 'EDIT CATEGORY NODE' : 'ADD CATEGORY NODE'}
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)', margin: '4px 0 0', fontWeight: 700 }}>
                  {editingCategory ? `Edit "${editingCategory.name}"` : 'Create New Category'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-dim)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Parent Category Hierarchy Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                  Parent Category (Hierarchy Position)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    background: '#FAF8F5',
                    color: 'var(--text)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                >
                  <option value="">👑 [Root Level 0] — Main Craft Cluster</option>
                  {eligibleParents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {getCategoryPathLabel(p)}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  Selecting a parent places this category directly under it. Max depth is 3 subcategory levels (4 total tiers).
                </span>
              </div>

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kadhwa Pure Katan Silk, Oblique Border, Gold Zari"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(generateSlug(e.target.value));
                    }
                  }}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(179, 137, 56, 0.3)',
                    background: '#FAF8F5',
                    color: 'var(--text)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Slug & Region Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. kadhwa-pure-katan"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      background: '#FAF8F5',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                    Craft Region / Origin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Varanasi, Uttar Pradesh"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      background: '#FAF8F5',
                      color: 'var(--text)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the weave heritage, loom techniques, or specialized zari characteristics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
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

              {/* Image Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                  Representative Cover Image
                </label>
                <SingleImageUpload
                  value={image}
                  onChange={(url) => setImage(url)}
                />
              </div>

              {/* Display Order & Featured */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#FAF8F5', borderRadius: '8px', border: '1px solid rgba(179, 137, 56, 0.2)' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      style={{ accentColor: 'var(--gold)', transform: 'scale(1.15)' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                      Feature in Homepage Spotlight (Root only)
                    </span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Display Order:</span>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: '60px',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(179, 137, 56, 0.3)',
                      background: '#FFFFFF',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    background: '#F3F4F6',
                    color: 'var(--text)',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
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
                    background: 'linear-gradient(135deg, var(--gold) 0%, #8E6822 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(179, 137, 56, 0.3)',
                  }}
                >
                  {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
