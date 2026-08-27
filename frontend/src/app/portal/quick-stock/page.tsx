'use client';

import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/api';
import { Product } from '../../../../../shared/types/index';

export default function FloorQuickStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest(`/products?search=${encodeURIComponent(search)}`);
      setProducts(res.products || []);
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
      // Barcode scanners type very rapidly (< 50ms per key) and finish with 'Enter'
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

  const handleStockUpdate = async (productId: string, newStock: number, name: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );

    try {
      await apiRequest(`/products/${productId}/stock`, {
        method: 'PATCH',
        data: { stock: Math.max(0, newStock) },
      });
      setFeedbackMessage(`✓ Updated "${name}" stock to ${newStock}`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (e: any) {
      alert('Failed to update stock: ' + e.message);
      fetchProducts();
    }
  };

  const simulateCameraScan = (sku: string) => {
    setIsCameraActive(true);
    setTimeout(() => {
      setSearch(sku);
      setIsCameraActive(false);
      setFeedbackMessage(`📷 Camera Scanned SKU: "${sku}"`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    }, 800);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Floor Mode Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.2) 0%, rgba(26, 20, 14, 0.8) 100%)',
          border: '1px solid rgba(201, 168, 76, 0.35)',
          borderRadius: '12px',
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            ⚡ FLOOR &amp; WAREHOUSE SCANNER MODE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#fff', marginTop: '4px' }}>
            Quick-Stock Adjuster
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Ready for Bluetooth/USB barcode scanners and mobile camera scanning
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => simulateCameraScan('BAN-KAT-001')}
            style={{
              padding: '10px 16px',
              background: isCameraActive ? 'rgba(74, 222, 128, 0.3)' : 'rgba(201, 168, 76, 0.2)',
              border: '1px solid var(--gold)',
              borderRadius: '8px',
              color: 'var(--gold)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isCameraActive ? 'Scanning...' : '📸 Scan Banarasi SKU'}
          </button>
          <button
            onClick={() => simulateCameraScan('KAN-KOR-002')}
            style={{
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            📸 Scan Kanjivaram SKU
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(34, 197, 94, 0.2)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: '8px',
            color: '#4ade80',
            fontSize: '0.88rem',
            fontWeight: 500,
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          {feedbackMessage}
        </div>
      )}

      {/* Fast Search Input */}
      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="🔍 Scan SKU barcode or type saree name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          suppressHydrationWarning
          style={{
            width: '100%',
            padding: '16px 20px',
            paddingRight: '48px',
            background: 'var(--bg-deep)',
            border: '2px solid rgba(201, 168, 76, 0.4)',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '1.1rem',
            outline: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
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
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Saree Fast Touch Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>Loading floor stock...</p>
        ) : products.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}>No sarees matching SKU or name.</p>
        ) : (
          products.map((p) => {
            const isOut = p.stock <= 0;
            return (
              <div
                key={p.id}
                style={{
                  background: isOut ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-deep)',
                  border: isOut ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <img
                    src={p.images?.[0] || '/frames/ezgif-frame-240.jpg'}
                    alt={p.name}
                    style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 600 }}>
                        {p.sku}
                      </span>
                      {p.isHeirloom1of1 && (
                        <span style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'rgba(201, 168, 76, 0.2)', color: 'var(--gold)', borderRadius: '4px' }}>
                          👑 1-of-1
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1rem', color: '#fff', margin: '4px 0 2px' }}>{p.name}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      {p.craftRegion} • {p.fabric} • ₹{p.sellingPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      textAlign: 'center',
                      minWidth: '70px',
                      padding: '8px 12px',
                      background: isOut ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.15)',
                      border: isOut ? '1px solid #ef4444' : '1px solid #22c55e',
                      borderRadius: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: isOut ? '#fca5a5' : '#86efac', display: 'block' }}>
                      STOCK
                    </span>
                    <strong style={{ fontSize: '1.4rem', color: isOut ? '#f87171' : '#4ade80' }}>
                      {p.stock}
                    </strong>
                  </div>

                  <button
                    onClick={() => handleStockUpdate(p.id, p.stock - 1, p.name)}
                    disabled={p.stock <= 0}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      cursor: p.stock <= 0 ? 'not-allowed' : 'pointer',
                      opacity: p.stock <= 0 ? 0.3 : 1,
                    }}
                  >
                    -
                  </button>

                  <button
                    onClick={() => handleStockUpdate(p.id, p.stock + 1, p.name)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      background: 'rgba(201, 168, 76, 0.2)',
                      border: '1px solid var(--gold)',
                      color: 'var(--gold)',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>

                  {p.stock > 0 ? (
                    <button
                      onClick={() => handleStockUpdate(p.id, 0, p.name)}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(220, 38, 38, 0.15)',
                        border: '1px solid rgba(220, 38, 38, 0.35)',
                        borderRadius: '8px',
                        color: '#f87171',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Sold Out
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStockUpdate(p.id, 1, p.name)}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        borderRadius: '8px',
                        color: '#4ade80',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Restock (1)
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
