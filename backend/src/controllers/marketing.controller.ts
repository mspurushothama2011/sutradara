import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { Coupon } from '../../../shared/types/index';

const prisma = new PrismaClient();

// In-memory demo coupons & active deals
let MEMORY_COUPONS: Coupon[] = [
  {
    id: 'coup-001',
    code: 'VIRASAT10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 25000,
    maxDiscount: 5000,
    usageLimit: 100,
    usedCount: 14,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coup-002',
    code: 'FIRSTHEIRLOOM',
    discountType: 'FLAT',
    discountValue: 2500,
    minOrderValue: 30000,
    usageLimit: 50,
    usedCount: 8,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

let ACTIVE_DEAL = {
  id: 'deal-001',
  productId: 'prod-002',
  productName: 'Kanchipuram Temple Border Korvai Silk Saree',
  originalPrice: 42000,
  dealPrice: 35700, // 15% off
  discountPercent: 15,
  expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
  bannerText: '✨ Deal of the Day: Generational Korvai Handloom at 15% Festive Privilege',
  isActive: true,
};

export async function listCoupons(req: AuthRequest, res: Response) {
  try {
    let coupons: any[] = [];
    try {
      coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    } catch (e) {
      coupons = MEMORY_COUPONS;
    }
    if (coupons.length === 0) coupons = MEMORY_COUPONS;
    return res.json({ coupons });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
}

export async function createCoupon(req: AuthRequest, res: Response) {
  const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, validUntil } = req.body;

  if (!code || !discountValue) {
    return res.status(400).json({ error: 'Coupon code and discount value are required.' });
  }

  const newCoupon: Coupon = {
    id: `coup-${Date.now()}`,
    code: code.toUpperCase().trim(),
    discountType: discountType || 'PERCENTAGE',
    discountValue: parseFloat(discountValue),
    minOrderValue: minOrderValue ? parseFloat(minOrderValue) : undefined,
    maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
    usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
    usedCount: 0,
    validFrom: new Date().toISOString(),
    validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  try {
    try {
      await prisma.coupon.create({ data: newCoupon as any });
    } catch (e) {
      MEMORY_COUPONS.unshift(newCoupon);
    }
    return res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create coupon.' });
  }
}

export async function validateCoupon(req: Request, res: Response) {
  const { code, cartTotal } = req.body;

  if (!code || typeof cartTotal !== 'number') {
    return res.status(400).json({ error: 'Code and cart total are required.' });
  }

  const coupon = MEMORY_COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);

  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or inactive coupon code.' });
  }

  if (new Date(coupon.validUntil) < new Date()) {
    return res.status(400).json({ error: 'Coupon has expired.' });
  }

  if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
    return res.status(400).json({
      error: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required for this coupon.`,
    });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return res.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountAmount,
    finalTotal,
  });
}

export async function getActiveDeal(req: Request, res: Response) {
  return res.json({ deal: ACTIVE_DEAL });
}

export async function updateActiveDeal(req: AuthRequest, res: Response) {
  const { productId, productName, originalPrice, dealPrice, discountPercent, expiresAt, bannerText } = req.body;

  ACTIVE_DEAL = {
    ...ACTIVE_DEAL,
    productId: productId || ACTIVE_DEAL.productId,
    productName: productName || ACTIVE_DEAL.productName,
    originalPrice: originalPrice || ACTIVE_DEAL.originalPrice,
    dealPrice: dealPrice || ACTIVE_DEAL.dealPrice,
    discountPercent: discountPercent || ACTIVE_DEAL.discountPercent,
    expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    bannerText: bannerText || ACTIVE_DEAL.bannerText,
  };

  return res.json({ message: 'Active deal updated successfully', deal: ACTIVE_DEAL });
}
