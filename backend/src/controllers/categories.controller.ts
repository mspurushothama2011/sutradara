import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  buildCategoryTree,
  flattenCategoryTree,
  getDescendantCategoryIds,
} from '../utils/category-tree';

const prisma = new PrismaClient();

// GET /api/v1/categories (List all craft clusters in hierarchical tree and flattened format)
export const listCategories = async (req: Request, res: Response) => {
  try {
    const rawCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true, children: true },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    const tree = buildCategoryTree(rawCategories);
    const flatCategories = flattenCategoryTree(tree);

    res.json({
      categories: flatCategories,
      tree,
      count: flatCategories.length,
    });
  } catch (error) {
    console.error('Failed to list categories from database:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
};

// GET /api/v1/categories/:slug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Craft cluster not found' });
    }

    const allCategories = await prisma.category.findMany();
    const tree = buildCategoryTree(allCategories);
    const flat = flattenCategoryTree(tree);
    const enriched = flat.find((c) => c.id === category.id) || category;

    // Retrieve products belonging to this category OR any of its descendants
    const descendantIds = getDescendantCategoryIds(category.id, allCategories);
    const targetCategoryIds = [category.id, ...descendantIds];

    const products = await prisma.product.findMany({
      where: {
        categoryId: { in: targetCategoryIds },
      },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        sellingPrice: true,
        comparePrice: true,
        fabric: true,
        zariType: true,
        craftRegion: true,
        isHeirloom1of1: true,
        stock: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      category: {
        ...category,
        level: (enriched as any).level ?? 0,
        breadcrumbs: (enriched as any).breadcrumbs ?? [],
        totalDescendantProductCount: products.length,
        products,
      },
    });
  } catch (error) {
    console.error('Failed to get category:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
};
