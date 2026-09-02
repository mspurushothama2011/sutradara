import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/categories (List all craft clusters and their subcategories from PostgreSQL)
export const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({ categories, count: categories.length });
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
        subCategories: true,
        products: {
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
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Craft cluster not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Failed to get category:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
};
