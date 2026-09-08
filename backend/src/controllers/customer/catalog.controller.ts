import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function sanitizeProductForCustomer(product: any): any {
  const p = { ...product };
  delete p.costPrice;
  delete p.procurement;
  return p;
}

/**
 * Customer Public Saree Catalog
 */
export async function listProducts(req: Request, res: Response) {
  const { fabric, craftRegion, zariType, isHeirloom1of1, minPrice, maxPrice, search, inStockOnly, categoryId, subCategoryId } = req.query;

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
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        subCategory: true,
      },
    });

    const sanitized = products.map((p) => sanitizeProductForCustomer(p));
    return res.json({ products: sanitized, count: sanitized.length });
  } catch (error) {
    console.error('List products error:', error);
    return res.status(500).json({ error: 'Failed to retrieve products' });
  }
}

/**
 * Customer Saree Details by Slug
 */
export async function getProductBySlug(req: Request, res: Response) {
  const { slug } = req.params;

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug },
          { sku: slug },
        ],
      },
      include: {
        category: true,
        subCategory: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product: sanitizeProductForCustomer(product) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch product details' });
  }
}
