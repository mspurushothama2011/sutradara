import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth.middleware';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// GET /api/v1/admin/categories
export const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { products: true, subCategories: true },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    const formatted = categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
      subCategoriesCount: cat._count.subCategories,
      subCategories: cat.subCategories.map((sub) => ({
        ...sub,
        productCount: sub._count.products,
      })),
    }));

    res.json({ categories: formatted, count: formatted.length });
  } catch (error) {
    console.error('Failed to list categories from database:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
};

// PATCH /api/v1/admin/categories/:id/featured
export const toggleFeaturedCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isFeatured, displayOrder } = req.body;

  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const nextFeatured = typeof isFeatured === 'boolean' ? isFeatured : !existing.isFeatured;
    const nextOrder = typeof displayOrder === 'number' ? displayOrder : existing.displayOrder;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        isFeatured: nextFeatured,
        displayOrder: nextOrder,
      },
      include: {
        subCategories: true,
        _count: { select: { products: true } },
      },
    });

    if (req.user?.userId) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'CATEGORY_TOGGLE_FEATURED',
          entityType: 'Category',
          entityId: id,
          oldValues: { isFeatured: existing.isFeatured, displayOrder: existing.displayOrder },
          newValues: { isFeatured: updated.isFeatured, displayOrder: updated.displayOrder },
        },
      }).catch((e) => console.warn('Audit log write error:', e));
    }

    return res.json({
      success: true,
      message: `Category "${updated.name}" is ${updated.isFeatured ? 'now featured in Homepage Spotlight' : 'removed from Homepage Spotlight'}.`,
      category: {
        ...updated,
        productCount: updated._count.products,
      },
    });
  } catch (error: any) {
    console.error('Toggle featured category error:', error);
    return res.status(500).json({ error: error.message || 'Failed to toggle category spotlight.' });
  }
};

// GET /api/v1/admin/categories/:idOrSlug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        subCategories: {
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      category: {
        ...category,
        productCount: category._count.products,
        subCategories: category.subCategories.map((sub) => ({
          ...sub,
          productCount: sub._count.products,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category details' });
  }
};

// POST /api/v1/admin/categories
export const createCategory = async (req: AuthRequest, res: Response) => {
  const { name, slug, description, region, image, subCategories, isFeatured, displayOrder } = req.body;

  if (!name || !region) {
    return res.status(400).json({ error: 'Category name and craft region are required.' });
  }

  const generatedSlug = (slug && slug.trim()) ? slugify(slug) : slugify(name);

  try {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug: generatedSlug }],
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'A category with this name or slug already exists.' });
    }

    const subCategoryCreates = Array.isArray(subCategories)
      ? subCategories
          .filter((sub: any) => typeof sub === 'string' ? sub.trim() : sub?.name?.trim())
          .map((sub: any) => {
            const subName = typeof sub === 'string' ? sub.trim() : sub.name.trim();
            const subSlug = (typeof sub === 'object' && sub.slug) ? slugify(sub.slug) : `${generatedSlug}-${slugify(subName)}`;
            const subDesc = typeof sub === 'object' ? sub.description : undefined;
            return {
              name: subName,
              slug: subSlug,
              description: subDesc,
            };
          })
      : [];

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        description: description?.trim() || null,
        region: region.trim(),
        image: image?.trim() || null,
        isFeatured: typeof isFeatured === 'boolean' ? isFeatured : false,
        displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
        subCategories: {
          create: subCategoryCreates,
        },
      },
      include: {
        subCategories: true,
      },
    });

    // Record audit log
    if (req.user?.userId) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'CATEGORY_CREATE',
          entityType: 'Category',
          entityId: category.id,
          newValues: { name: category.name, slug: category.slug, region: category.region, isFeatured: category.isFeatured },
        },
      }).catch((e) => console.warn('Audit log write error:', e));
    }

    return res.status(201).json({
      success: true,
      message: `Category "${category.name}" created successfully.`,
      category,
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create category.' });
  }
};

// PUT /api/v1/admin/categories/:id
export const updateCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, slug, description, region, image, isFeatured, displayOrder } = req.body;

  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const updatedSlug = slug ? slugify(slug) : (name ? slugify(name) : existing.slug);

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(updatedSlug && { slug: updatedSlug }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(region && { region: region.trim() }),
        ...(image !== undefined && { image: image?.trim() || null }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      },
      include: {
        subCategories: true,
        _count: { select: { products: true } },
      },
    });

    if (req.user?.userId) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'CATEGORY_UPDATE',
          entityType: 'Category',
          entityId: id,
          oldValues: { name: existing.name, slug: existing.slug },
          newValues: { name: updated.name, slug: updated.slug },
        },
      }).catch((e) => console.warn('Audit log write error:', e));
    }

    return res.json({
      success: true,
      message: `Category "${updated.name}" updated successfully.`,
      category: {
        ...updated,
        productCount: updated._count.products,
      },
    });
  } catch (error: any) {
    console.error('Update category error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update category.' });
  }
};

// DELETE /api/v1/admin/categories/:id
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    if (existing._count.products > 0) {
      return res.status(400).json({
        error: `Cannot delete category "${existing.name}" because it contains ${existing._count.products} catalogued product(s). Please reassign or remove products first.`,
      });
    }

    await prisma.category.delete({ where: { id } });

    if (req.user?.userId) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'CATEGORY_DELETE',
          entityType: 'Category',
          entityId: id,
          oldValues: { name: existing.name, slug: existing.slug },
        },
      }).catch((e) => console.warn('Audit log write error:', e));
    }

    return res.json({
      success: true,
      message: `Category "${existing.name}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete category.' });
  }
};

// POST /api/v1/admin/categories/:id/subcategories
export const createSubCategory = async (req: AuthRequest, res: Response) => {
  const { id: categoryId } = req.params;
  const { name, slug, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Subcategory name is required.' });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { subCategories: true },
    });

    if (!category) {
      return res.status(404).json({ error: 'Parent Category not found.' });
    }

    const generatedSlug = slug ? slugify(slug) : `${category.slug}-${slugify(name)}`;

    const existingSub = await prisma.subCategory.findFirst({
      where: {
        categoryId,
        OR: [{ name: name.trim() }, { slug: generatedSlug }],
      },
    });

    if (existingSub) {
      return res.status(400).json({ error: 'A subcategory with this name or slug already exists under this category.' });
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        categoryId,
        name: name.trim(),
        slug: generatedSlug,
        description: description?.trim() || null,
      },
    });

    if (req.user?.userId) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'SUBCATEGORY_CREATE',
          entityType: 'SubCategory',
          entityId: subCategory.id,
          newValues: { name: subCategory.name, slug: subCategory.slug, categoryId },
        },
      }).catch((e) => console.warn('Audit log write error:', e));
    }

    return res.status(201).json({
      success: true,
      message: `Subcategory "${subCategory.name}" added to ${category.name}.`,
      subCategory: {
        ...subCategory,
        productCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Create subcategory error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create subcategory.' });
  }
};

// PUT /api/v1/admin/categories/subcategories/:subId
export const updateSubCategory = async (req: AuthRequest, res: Response) => {
  const { subId } = req.params;
  const { name, slug, description } = req.body;

  try {
    const existing = await prisma.subCategory.findUnique({
      where: { id: subId },
      include: { category: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Subcategory not found.' });
    }

    const updatedSlug = slug ? slugify(slug) : (name ? `${existing.category.slug}-${slugify(name)}` : existing.slug);

    const updated = await prisma.subCategory.update({
      where: { id: subId },
      data: {
        ...(name && { name: name.trim() }),
        ...(updatedSlug && { slug: updatedSlug }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (req.user?.userId) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'SUBCATEGORY_UPDATE',
          entityType: 'SubCategory',
          entityId: subId,
          oldValues: { name: existing.name, slug: existing.slug },
          newValues: { name: updated.name, slug: updated.slug },
        },
      }).catch((e) => console.warn('Audit log write error:', e));
    }

    return res.json({
      success: true,
      message: `Subcategory "${updated.name}" updated successfully.`,
      subCategory: {
        ...updated,
        productCount: updated._count.products,
      },
    });
  } catch (error: any) {
    console.error('Update subcategory error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update subcategory.' });
  }
};

// DELETE /api/v1/admin/categories/subcategories/:subId
export const deleteSubCategory = async (req: AuthRequest, res: Response) => {
  const { subId } = req.params;

  try {
    const existing = await prisma.subCategory.findUnique({
      where: { id: subId },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Subcategory not found.' });
    }

    if (existing._count.products > 0) {
      return res.status(400).json({
        error: `Cannot delete subcategory "${existing.name}" because it has ${existing._count.products} associated product(s). Please reassign or delete the products first.`,
      });
    }

    await prisma.subCategory.delete({ where: { id: subId } });

    if (req.user?.userId) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'SUBCATEGORY_DELETE',
          entityType: 'SubCategory',
          entityId: subId,
          oldValues: { name: existing.name, slug: existing.slug },
        },
      }).catch((e) => console.warn('Audit log write error:', e));
    }

    return res.json({
      success: true,
      message: `Subcategory "${existing.name}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Delete subcategory error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete subcategory.' });
  }
};
