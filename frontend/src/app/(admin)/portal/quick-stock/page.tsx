'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { apiRequest } from '@/lib/api';
import { Product } from '@/shared/types/index';

export default function FloorQuickStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LOW_STOCK' | 'SOLD_OUT' | 'IN_STOCK'>('ALL');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<{ [productId: string]: string }>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest(`/products?search=${encodeURIComponent(search)}`);
      const prods: Product[] = res.products || [];
      setProducts(prods);

      // Initialize editing stock map
      const stockMap: { [id: string]: string } = {};
      prods.forEach((p) => {
        stockMap[p.id] = String(p.stock);
      });
      setEditingStock(stockMap);
    } catch (e) {
      console.error('Quick stock fetch failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  // Hardware USB/Bluetooth Barcode Scanner Keystroke Listener
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter' && barcodeBuffer.length > 2) {
        setSearch(barcodeBuffer.trim());
        setFeedbackMessage(`📷 Barcode Scanned: "${barcodeBuffer.trim()}"`);
        setTimeout(() => setFeedbackMessage(null), 3000);
        barcodeBuffer = '';
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update Stock in PostgreSQL
  const handleStockUpdate = async (productId: string, newStock: number, name: string) => {
    const validatedStock = Math.max(0, Math.floor(newStock));

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: validatedStock } : p))
    );
    setEditingStock((prev) => ({ ...prev, [productId]: String(validatedStock) }));

    try {
      await apiRequest(`/products/${productId}/stock`, {
        method: 'PATCH',
        data: { stock: validatedStock },
      });
      setFeedbackMessage(`✓ Stock for "${name}" updated to ${validatedStock} in PostgreSQL`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (e: any) {
      alert('Failed to update stock: ' + e.message);
      fetchProducts();
    }
  };

  const handleDirectInputChange = (productId: string, val: string) => {
    setEditingStock((prev) => ({ ...prev, [productId]: val }));
  };

  const handleDirectInputSubmit = (productId: string, name: string) => {
    const val = parseInt(editingStock[productId] || '0', 10);
    if (!isNaN(val)) {
      handleStockUpdate(productId, val, name);
    }
  };

  // Stock Metrics
  const soldOutCount = products.filter((p) => p.stock <= 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 2).length;
  const healthyStockCount = products.filter((p) => p.stock > 2).length;

  // Filtered & Sorted Products (Low stock shown at top by default)
  const displayProducts = useMemo(() => {
    let list = [...products];

    if (activeFilter === 'SOLD_OUT') {
      list = list.filter((p) => p.stock <= 0);
    } else if (activeFilter === 'LOW_STOCK') {
      list = list.filter((p) => p.stock > 0 && p.stock <= 2);
    } else if (activeFilter === 'IN_STOCK') {
      list = list.filter((p) => p.stock > 0);
    }

    // Sort: Sold out first, then low stock (1-2), then healthy stock
    return list.sort((a, b) => a.stock - b.stock);
  }, [products, activeFilter]);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Floor Mode Header */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(179, 137, 56, 0.25)',
          borderRadius: '12px',
          padding: '24px 28px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 16px rgba(26, 19, 13, 0.03)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
            ⚡ FLOOR & WAREHOUSE STOCK ADJUSTER
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text)', marginTop: '4px' }}>
            Floor Stock & Inventory Manager
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Direct number typing + instant barcode & scanner integration with PostgreSQL
          </p>
        </div>
      </div>

      {/* 🚨 Low Stock & Priority Stock Alert Bar at Top */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        {/* Low Stock Alert Pill */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
          style={{
            padding: '16px 20px',
            background: activeFilter === 'LOW_STOCK' ? '#FEF3C7' : '#FFFFFF',
            border: activeFilter === 'LOW_STOCK' ? '2px solid #D97706' : '1px solid rgba(217, 119, 6, 0.3)',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(26, 19, 13, 0.03)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#92400E', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
              ⚠️ Low Stock Priority (≤ 2)
            </span>
            <strong style={{ fontSize: '1.4rem', color: '#B45309', marginTop: '2px', display: 'block' }}>
              {lowStockCount} Sarees
            </strong>
          </div>
          <span style={{ fontSize: '1.5rem' }}>⏳</span>
        </div>

        {/* Sold Out Pill */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'SOLD_OUT' ? 'ALL' : 'SOLD_OUT')}
          style={{
            padding: '16px 20px',
            background: activeFilter === 'SOLD_OUT' ? '#FEE2E2' : '#FFFFFF',
            border: activeFilter === 'SOLD_OUT' ? '2px solid #DC2626' : '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(26, 19, 13, 0.03)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#991B1B', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
              🔴 Sold Out (0 in Vault)
            </span>
            <strong style={{ fontSize: '1.4rem', color: '#DC2626', marginTop: '2px', display: 'block' }}>
              {soldOutCount} Sarees
            </strong>
          </div>
          <span style={{ fontSize: '1.5rem' }}>🚫</span>
        </div>

        {/* Healthy Stock Pill */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'IN_STOCK' ? 'ALL' : 'IN_STOCK')}
          style={{
            padding: '16px 20px',
            background: activeFilter === 'IN_STOCK' ? '#DCFCE7' : '#FFFFFF',
            border: activeFilter === 'IN_STOCK' ? '2px solid #16A34A' : '1px solid rgba(22, 163, 74, 0.3)',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(26, 19, 13, 0.03)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#166534', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
              🟢 Healthy Stock (3+)
            </span>
            <strong style={{ fontSize: '1.4rem', color: '#15803D', marginTop: '2px', display: 'block' }}>
              {healthyStockCount} Sarees
            </strong>
          </div>
          <span style={{ fontSize: '1.5rem' }}>📦</span>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          style={{
            padding: '12px 18px',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            borderRadius: '8px',
            color: '#15803d',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          {feedbackMessage}
        </div>
      )}

      {/* Fast Search & Active Filter Bar */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="🔍 Scan SKU barcode or type saree name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              paddingRight: '48px',
              background: '#FFFFFF',
              border: '2px solid rgba(179, 137, 56, 0.35)',
              borderRadius: '10px',
              color: 'var(--text)',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 2px 10px rgba(26, 19, 13, 0.03)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {activeFilter !== 'ALL' && (
          <button
            onClick={() => setActiveFilter('ALL')}
            style={{
              padding: '12px 18px',
              background: '#FFFFFF',
              border: '1px solid rgba(179, 137, 56, 0.3)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear Filter (Showing All)
          </button>
        )}
      </div>

      {/* Saree Fast Touch & Direct Edit Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>Loading floor stock from database...</p>
        ) : displayProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>No sarees matching your criteria.</p>
        ) : (
          displayProducts.map((p) => {
            const isOut = p.stock <= 0;
            const isLow = p.stock > 0 && p.stock <= 2;
            const currentEditingValue = editingStock[p.id] !== undefined ? editingStock[p.id] : String(p.stock);

            return (
              <div
                key={p.id}
                style={{
                  background: isOut
                    ? '#FFF5F5'
                    : isLow
                    ? '#FFFBEB'
                    : '#FFFFFF',
                  border: isOut
                    ? '1px solid rgba(220, 38, 38, 0.35)'
                    : isLow
                    ? '1px solid rgba(217, 119, 6, 0.35)'
                    : '1px solid rgba(179, 137, 56, 0.22)',
                  borderRadius: '12px',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  flexWrap: 'wrap',
                  boxShadow: '0 2px 10px rgba(26, 19, 13, 0.03)',
                }}
              >
                {/* Left: Thumbnail & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px', flex: 1 }}>
                  <img
                    src={p.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                    alt={p.name}
                    style={{ width: '58px', height: '58px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(179, 137, 56, 0.25)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--gold-dark, #8A6418)', fontWeight: 700 }}>
                        {p.sku}
                      </span>
                      {p.isHeirloom1of1 && (
                        <span style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(179, 137, 56, 0.12)', color: 'var(--gold-dark, #8A6418)', borderRadius: '4px', border: '1px solid rgba(179, 137, 56, 0.25)', fontWeight: 600 }}>
                          👑 1-of-1
                        </span>
                      )}
                      {isOut ? (
                        <span style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(220, 38, 38, 0.12)', color: '#dc2626', borderRadius: '4px', border: '1px solid rgba(220, 38, 38, 0.3)', fontWeight: 700 }}>
                          SOLD OUT
                        </span>
                      ) : isLow ? (
                        <span style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(217, 119, 6, 0.12)', color: '#b45309', borderRadius: '4px', border: '1px solid rgba(217, 119, 6, 0.3)', fontWeight: 700 }}>
                          LOW STOCK (≤2)
                        </span>
                      ) : null}
                    </div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text)', margin: '4px 0 2px', fontWeight: 700 }}>{p.name}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {p.craftRegion} • {p.fabric} • ₹{p.sellingPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Right: Direct Number Input + Stepper Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Direct Number Input Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                      TYPE DIRECT QTY
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        min="0"
                        value={currentEditingValue}
                        onChange={(e) => handleDirectInputChange(p.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleDirectInputSubmit(p.id, p.name);
                          }
                        }}
                        style={{
                          width: '74px',
                          padding: '8px 10px',
                          textAlign: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          background: '#FAF8F5',
                          border: isOut
                            ? '2px solid #dc2626'
                            : isLow
                            ? '2px solid #d97706'
                            : '2px solid var(--gold)',
                          color: isOut ? '#dc2626' : isLow ? '#b45309' : '#15803d',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => handleDirectInputSubmit(p.id, p.name)}
                        title="Save Stock Count"
                        style={{
                          padding: '8px 14px',
                          background: 'var(--gold)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(179, 137, 56, 0.3)',
                        }}
                      >
                        Set
                      </button>
                    </div>
                  </div>

                  {/* Quick Stepper Buttons */}
                  <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                    <button
                      onClick={() => handleStockUpdate(p.id, p.stock - 1, p.name)}
                      disabled={p.stock <= 0}
                      title="Decrease by 1"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: '#FAF8F5',
                        border: '1px solid rgba(179, 137, 56, 0.3)',
                        color: 'var(--text)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        cursor: p.stock <= 0 ? 'not-allowed' : 'pointer',
                        opacity: p.stock <= 0 ? 0.3 : 1,
                      }}
                    >
                      -
                    </button>

                    <button
                      onClick={() => handleStockUpdate(p.id, p.stock + 1, p.name)}
                      title="Increase by 1"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: 'rgba(179, 137, 56, 0.12)',
                        border: '1px solid var(--gold)',
                        color: 'var(--gold-dark, #8A6418)',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Fast Action Buttons: Sold Out & Quick Restock */}
                  <div style={{ marginLeft: '4px' }}>
                    {p.stock > 0 ? (
                      <button
                        onClick={() => handleStockUpdate(p.id, 0, p.name)}
                        style={{
                          padding: '10px 14px',
                          background: 'rgba(220, 38, 38, 0.1)',
                          border: '1px solid rgba(220, 38, 38, 0.3)',
                          borderRadius: '8px',
                          color: '#dc2626',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Mark Sold Out
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStockUpdate(p.id, 1, p.name)}
                        style={{
                          padding: '10px 14px',
                          background: 'rgba(34, 197, 94, 0.12)',
                          border: '1px solid rgba(34, 197, 94, 0.35)',
                          borderRadius: '8px',
                          color: '#15803d',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Restock (1)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
