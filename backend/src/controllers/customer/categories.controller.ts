import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/customer/categories
export const listCategories = async (req: Request, res: Response) => {
  try {
    const { featured } = req.query;

    const whereClause: any = {};
    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        subCategories: true,
        products: {
          take: 4,
          select: {
            id: true,
            name: true,
            images: true,
            sellingPrice: true,
            slug: true,
            zariType: true,
            fabric: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
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
