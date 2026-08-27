import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { Product } from '../../../shared/types/index';

const prisma = new PrismaClient();

// Initial in-memory demo sarees for instant development
let MEMORY_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'BAN-KAT-001',
    name: 'Varanasi Royal Kadhwa Pure Katan Silk Saree',
    slug: 'varanasi-royal-kadhwa-pure-katan-silk-saree',
    description:
      'An unrepeatable masterpiece handwoven on a traditional pit loom in Varanasi over 320 craft hours. Features authentic pure gold zari floral jaal with a rich crimson pallu and Silk Mark certification.',
    sellingPrice: 38500,
    comparePrice: 45000,
    costPrice: 22000,
    stock: 1,
    isHeirloom1of1: true,
    fabric: 'Pure Katan Silk',
    zariType: 'Pure Gold Zari',
    craftRegion: 'Varanasi',
    weaveStyle: 'Kadhwa',
    silkMarkNumber: 'SM-IN-2026-8891',
    videoUrl: 'https://assets.sutradara.in/videos/ban-kat-001-drape.mp4',
    isFeatured: true,
    isDealOfDay: false,
    tags: ['Diwali', 'Bridal', 'Exclusive'],
    images: [
      '/frames/ezgif-frame-240.jpg',
      '/frames/ezgif-frame-120.jpg',
      '/frames/ezgif-frame-001.jpg',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    sku: 'KAN-SIL-002',
    name: 'Kanchipuram Temple Border Korvai Silk Saree',
    slug: 'kanchipuram-temple-border-korvai-silk-saree',
    description:
      'Generational Korvai interlocking weave with traditional peacock motifs in 2G Tested Gold Zari. Contrast emerald green border on deep ruby red silk body.',
    sellingPrice: 42000,
    comparePrice: 48000,
    costPrice: 26000,
    stock: 2,
    isHeirloom1of1: false,
    fabric: 'Kanjivaram Silk',
    zariType: 'Tested Zari',
    craftRegion: 'Kanchipuram',
    weaveStyle: 'Korvai',
    silkMarkNumber: 'SM-IN-2026-9102',
    videoUrl: 'https://assets.sutradara.in/videos/kan-sil-002-drape.mp4',
    isFeatured: true,
    isDealOfDay: true,
    dealExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    tags: ['Bridal', 'Wedding', 'Temple Border'],
    images: [
      '/frames/ezgif-frame-180.jpg',
      '/frames/ezgif-frame-120.jpg',
      '/frames/ezgif-frame-060.jpg',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    sku: 'PAI-MAH-003',
    name: 'Yeola Muniya Border Pure Paithani Silk Saree',
    slug: 'yeola-muniya-border-pure-paithani-silk-saree',
    description:
      'Classic Yeola handwoven Paithani with authentic parrot (Muniya) border in antique zari and rich peacock kaleidoscope pallu on royal purple mulberry silk.',
    sellingPrice: 34500,
    comparePrice: 39000,
    costPrice: 19500,
    stock: 1,
    isHeirloom1of1: true,
    fabric: 'Paithani Silk',
    zariType: 'Antique Copper',
    craftRegion: 'Yeola',
    weaveStyle: 'Tapestry',
    silkMarkNumber: 'SM-IN-2026-7734',
    isFeatured: false,
    isDealOfDay: false,
    tags: ['Festive', 'Heritage', 'Paithani'],
    images: [
      '/frames/ezgif-frame-150.jpg',
      '/frames/ezgif-frame-090.jpg',
      '/frames/ezgif-frame-030.jpg',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-004',
    sku: 'CHA-ORG-004',
    name: 'Chanderi Handspun Tissue Silk Saree',
    slug: 'chanderi-handspun-tissue-silk-saree',
    description:
      'Ethereal featherlight Chanderi tissue silk woven with silver zari meenakari floral butis. Translucent drape ideal for summer evening soirees and festivities.',
    sellingPrice: 18500,
    comparePrice: 22000,
    costPrice: 11000,
    stock: 4,
    isHeirloom1of1: false,
    fabric: 'Chanderi Silk',
    zariType: 'Silver Zari',
    craftRegion: 'Chanderi',
    weaveStyle: 'Eknali',
    silkMarkNumber: 'SM-IN-2026-6411',
    isFeatured: false,
    isDealOfDay: false,
    tags: ['Festive', 'Pastel', 'Summer Light'],
    images: [
      '/frames/ezgif-frame-080.jpg',
      '/frames/ezgif-frame-040.jpg',
      '/frames/ezgif-frame-010.jpg',
    ],
    createdAt: new Date().toISOString(),
  },
];

function sanitizeProductForUser(product: any, canViewFinance: boolean): Product {
  const p = { ...product };
  if (!canViewFinance) {
    delete p.costPrice;
  }
  return p;
}

export async function listProducts(req: AuthRequest, res: Response) {
  const { fabric, craftRegion, zariType, isHeirloom1of1, minPrice, maxPrice, search, inStockOnly } = req.query;
  const canViewFinance = req.user?.role === 'ADMIN' || (req.user?.capabilities || []).includes('finance:view');

  try {
    let products: any[] = [];

    // Query database if connected, else fallback to memory
    try {
      const where: any = {};
      if (fabric) where.fabric = String(fabric);
      if (craftRegion) where.craftRegion = String(craftRegion);
      if (zariType) where.zariType = String(zariType);
      if (isHeirloom1of1 === 'true') where.isHeirloom1of1 = true;
      if (inStockOnly === 'true') where.stock = { gt: 0 };
      if (search) {
        where.OR = [
          { name: { contains: String(search), mode: 'insensitive' } },
          { sku: { contains: String(search), mode: 'insensitive' } },
          { craftRegion: { contains: String(search), mode: 'insensitive' } },
        ];
      }
      if (minPrice || maxPrice) {
        where.sellingPrice = {};
        if (minPrice) where.sellingPrice.gte = parseFloat(String(minPrice));
        if (maxPrice) where.sellingPrice.lte = parseFloat(String(maxPrice));
      }

      products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
    } catch (e) {
      // Memory fallback
      products = MEMORY_PRODUCTS.filter((p) => {
        if (fabric && p.fabric !== fabric) return false;
        if (craftRegion && p.craftRegion !== craftRegion) return false;
        if (zariType && p.zariType !== zariType) return false;
        if (isHeirloom1of1 === 'true' && !p.isHeirloom1of1) return false;
        if (inStockOnly === 'true' && p.stock <= 0) return false;
        if (minPrice && p.sellingPrice < parseFloat(String(minPrice))) return false;
        if (maxPrice && p.sellingPrice > parseFloat(String(maxPrice))) return false;
        if (search) {
          const s = String(search).toLowerCase();
          const matches =
            p.name.toLowerCase().includes(s) ||
            p.sku.toLowerCase().includes(s) ||
            p.craftRegion.toLowerCase().includes(s);
          if (!matches) return false;
        }
        return true;
      });
    }

    if (products.length === 0 && !fabric && !craftRegion && !search) {
      products = MEMORY_PRODUCTS;
    }

    const sanitized = products.map((p) => sanitizeProductForUser(p, canViewFinance));
    return res.json({ products: sanitized, count: sanitized.length });
  } catch (error) {
    console.error('List products error:', error);
    return res.status(500).json({ error: 'Failed to fetch products.' });
  }
}

export async function getProduct(req: AuthRequest, res: Response) {
  const { idOrSlug } = req.params;
  const canViewFinance = req.user?.role === 'ADMIN' || (req.user?.capabilities || []).includes('finance:view');

  try {
    let product: any = null;

    try {
      product = await prisma.product.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }, { sku: idOrSlug }],
        },
      });
    } catch (e) {
      product = MEMORY_PRODUCTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug || p.sku === idOrSlug);
    }

    if (!product) {
      product = MEMORY_PRODUCTS.find((p) => p.id === idOrSlug || p.slug === idOrSlug || p.sku === idOrSlug);
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    return res.json({ product: sanitizeProductForUser(product, canViewFinance) });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ error: 'Failed to fetch product.' });
  }
}

export async function createProduct(req: AuthRequest, res: Response) {
  const {
    name,
    sku,
    description,
    sellingPrice,
    comparePrice,
    costPrice,
    stock = 1,
    isHeirloom1of1 = false,
    fabric,
    zariType,
    craftRegion,
    weaveStyle,
    silkMarkNumber,
    videoUrl,
    tags = [],
    images = [],
  } = req.body;

  if (!name || !sellingPrice || !fabric || !craftRegion) {
    return res.status(400).json({ error: 'Name, selling price, fabric, and craft region are required.' });
  }

  const generatedSku = sku || `SUT-${craftRegion.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const generatedSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    sku: generatedSku,
    name,
    slug: `${generatedSlug}-${Date.now().toString().slice(-4)}`,
    description: description || '',
    sellingPrice: parseFloat(sellingPrice),
    comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
    costPrice: costPrice ? parseFloat(costPrice) : undefined,
    stock: parseInt(stock, 10),
    isHeirloom1of1: Boolean(isHeirloom1of1),
    fabric,
    zariType: zariType || 'Tested Zari',
    craftRegion,
    weaveStyle: weaveStyle || 'Traditional Loom',
    silkMarkNumber: silkMarkNumber || undefined,
    videoUrl: videoUrl || undefined,
    isFeatured: false,
    isDealOfDay: false,
    tags: Array.isArray(tags) ? tags : [tags],
    images: Array.isArray(images) && images.length > 0 ? images : ['/frames/ezgif-frame-240.jpg'],
    createdAt: new Date().toISOString(),
  };

  try {
    try {
      await prisma.product.create({ data: newProduct as any });
    } catch (e) {
      MEMORY_PRODUCTS.unshift(newProduct);
    }

    return res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'Failed to create product.' });
  }
}

export async function overrideStock(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { stock, delta } = req.body;

  try {
    let productIndex = MEMORY_PRODUCTS.findIndex((p) => p.id === id || p.sku === id);

    let currentStock = 1;
    if (productIndex !== -1) {
      currentStock = MEMORY_PRODUCTS[productIndex].stock;
    }

    let newStock = currentStock;
    if (typeof stock === 'number') {
      newStock = Math.max(0, stock);
    } else if (typeof delta === 'number') {
      newStock = Math.max(0, currentStock + delta);
    }

    if (productIndex !== -1) {
      MEMORY_PRODUCTS[productIndex].stock = newStock;
    }

    try {
      await prisma.product.update({
        where: { id },
        data: { stock: newStock },
      });
    } catch (e) {
      // Handled in memory fallback
    }

    return res.json({
      message: 'Stock updated successfully',
      productId: id,
      oldStock: currentStock,
      newStock,
      isOutOfStock: newStock === 0,
    });
  } catch (error) {
    console.error('Stock override error:', error);
    return res.status(500).json({ error: 'Failed to update stock.' });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    MEMORY_PRODUCTS = MEMORY_PRODUCTS.filter((p) => p.id !== id && p.sku !== id);

    try {
      await prisma.product.delete({ where: { id } });
    } catch (e) {
      // Memory fallback
    }

    return res.json({ message: 'Product deleted successfully', productId: id });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
}
