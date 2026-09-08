import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/customer/categories
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

// GET /api/v1/customer/categories/:slug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        subCategories: true,
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category details' });
  }
};
