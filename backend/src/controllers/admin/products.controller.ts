import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth.middleware';
import { Product } from '../../../../shared/types/index';

const prisma = new PrismaClient();

function sanitizeProductForUser(product: any, canViewFinance: boolean): any {
  const p = { ...product };
  if (!canViewFinance) {
    delete p.costPrice;
    delete p.procurement;
  }
  return p;
}

export async function listProducts(req: AuthRequest, res: Response) {
  const { fabric, craftRegion, zariType, isHeirloom1of1, minPrice, maxPrice, search, inStockOnly, categoryId, subCategoryId } = req.query;
  const canViewFinance = req.user?.role === 'ADMIN' || (req.user?.capabilities || []).includes('finance:view');

  try {
    const where: any = {};
    if (fabric) where.fabric = String(fabric);
    if (craftRegion) where.craftRegion = String(craftRegion);
    if (zariType) where.zariType = String(zariType);
    if (isHeirloom1of1 === 'true') where.isHeirloom1of1 = true;
    if (inStockOnly === 'true') where.stock = { gt: 0 };
    if (categoryId) where.categoryId = String(categoryId);
    if (subCategoryId) where.subCategoryId = String(subCategoryId);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { sku: { contains: String(search), mode: 'insensitive' } },
        { craftRegion: { contains: String(search), mode: 'insensitive' } },
        { fabric: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(String(minPrice));
      if (maxPrice) where.sellingPrice.lte = parseFloat(String(maxPrice));
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true, region: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
        procurement: canViewFinance,
      },
      orderBy: { createdAt: 'desc' },
    });

    const sanitized = products.map((p) => sanitizeProductForUser(p, canViewFinance));
    return res.json({ products: sanitized, count: sanitized.length });
  } catch (error) {
    console.error('List products error:', error);
    return res.status(500).json({ error: 'Failed to fetch products from database.' });
  }
}

export async function getProduct(req: AuthRequest, res: Response) {
  const { idOrSlug } = req.params;
  const canViewFinance = req.user?.role === 'ADMIN' || (req.user?.capabilities || []).includes('finance:view');

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }, { sku: idOrSlug }],
      },
      include: {
        category: true,
        subCategory: true,
        procurement: canViewFinance,
      },
    });

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
    categoryId,
    subCategoryId,
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
    isFeatured = false,
    isDealOfDay = false,
    dealExpiresAt,
    tags = [],
    images = [],
    weaverGuildName,
    weaverContact,
    invoiceRef,
    procurementNotes,
  } = req.body;

  if (!name || !sellingPrice || !fabric || !craftRegion) {
    return res.status(400).json({ error: 'Name, selling price, fabric, and craft region are required.' });
  }

  const generatedSku = sku || `SUT-${craftRegion.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const generatedSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  try {
    const parsedSellingPrice = parseFloat(sellingPrice);
    const parsedCostPrice = costPrice ? parseFloat(costPrice) : undefined;
    const parsedComparePrice = comparePrice ? parseFloat(comparePrice) : undefined;
    const parsedStock = parseInt(stock, 10) || 1;

    const formattedImages = Array.isArray(images) && images.length > 0
      ? images
      : ['/frames/ezgif-frame-240.jpg'];
    const formattedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const product = await prisma.product.create({
      data: {
        name,
        sku: generatedSku,
        slug: generatedSlug,
        description: description || `${name} - Handcrafted authentic heritage weave from ${craftRegion}.`,
        categoryId: categoryId || undefined,
        subCategoryId: subCategoryId || undefined,
        sellingPrice: parsedSellingPrice,
        comparePrice: parsedComparePrice,
        costPrice: parsedCostPrice,
        stock: parsedStock,
        isHeirloom1of1: Boolean(isHeirloom1of1),
        fabric,
        zariType: zariType || 'Tested Gold Zari',
        craftRegion,
        weaveStyle: weaveStyle || 'Traditional Loom',
        silkMarkNumber: silkMarkNumber || undefined,
        videoUrl: videoUrl || undefined,
        isFeatured: Boolean(isFeatured),
        isDealOfDay: Boolean(isDealOfDay),
        dealExpiresAt: dealExpiresAt ? new Date(dealExpiresAt) : undefined,
        tags: formattedTags,
        images: formattedImages,
        procurement: (weaverGuildName || parsedCostPrice) ? {
          create: {
            costPrice: parsedCostPrice || (parsedSellingPrice * 0.55),
            weaverGuildName: weaverGuildName || `${craftRegion} Traditional Weaver Guild`,
            weaverContact: weaverContact || '+91 98765 00000',
            procurementDate: new Date(),
            invoiceRef: invoiceRef || `INV-SUT-${Date.now().toString().slice(-6)}`,
            notes: procurementNotes || 'Verified authentic loom provenance.',
          },
        } : undefined,
      },
      include: {
        category: true,
        subCategory: true,
        procurement: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Master Craft Saree added to PostgreSQL catalog successfully.',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'Database failed to create product.' });
  }
}

export async function overrideStock(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { stock, delta } = req.body;

  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    let newStock = existing.stock;
    if (typeof stock === 'number') {
      newStock = Math.max(0, stock);
    } else if (typeof delta === 'number') {
      newStock = Math.max(0, existing.stock + delta);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });

    return res.json({
      message: 'Stock updated successfully',
      productId: id,
      oldStock: existing.stock,
      newStock: updated.stock,
      isOutOfStock: updated.stock === 0,
    });
  } catch (error) {
    console.error('Stock override error:', error);
    return res.status(500).json({ error: 'Failed to update stock.' });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    await prisma.product.delete({ where: { id } });
    return res.json({ message: 'Product deleted successfully', productId: id });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
}
