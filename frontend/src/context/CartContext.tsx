'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../../../../shared/types/index';

export interface BagItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  bagItems: BagItem[];
  addToBag: (product: Product, quantity?: number) => void;
  removeFromBag: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearBag: () => void;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sutradara_bag');
      if (stored) {
        setBagItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load bag from storage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('sutradara_bag', JSON.stringify(bagItems));
      window.dispatchEvent(new Event('bag-change'));
    } catch (e) {
      console.warn('Failed to save bag to storage:', e);
    }
  }, [bagItems, isInitialized]);

  const addToBag = (product: Product, quantity = 1) => {
    setBagItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        // If 1-of-1 heirloom, limit to 1
        const maxQty = product.isHeirloom1of1 ? 1 : Math.min(product.stock || 5, updated[existingIdx].quantity + quantity);
        updated[existingIdx].quantity = maxQty;
        return updated;
      }
      return [...prev, { product, quantity: product.isHeirloom1of1 ? 1 : quantity }];
    });
  };

  const removeFromBag = (productId: string) => {
    setBagItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromBag(productId);
      return;
    }
    setBagItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxQty = item.product.isHeirloom1of1 ? 1 : Math.min(item.product.stock || 5, quantity);
          return { ...item, quantity: maxQty };
        }
        return item;
      })
    );
  };

  const clearBag = () => {
    setBagItems([]);
    try {
      localStorage.removeItem('sutradara_bag');
    } catch (e) {}
  };

  const totalCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = bagItems.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        bagItems,
        addToBag,
        removeFromBag,
        updateQuantity,
        clearBag,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
