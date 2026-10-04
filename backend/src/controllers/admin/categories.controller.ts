import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth.middleware';
import {
  buildCategoryTree,
  flattenCategoryTree,
  validateCategoryHierarchy,
  getDescendantCategoryIds,
} from '../../utils/category-tree';

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
        _count: { select: { products: true, children: true } },
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
        childrenCount: updated._count.children,
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
        parent: true,
        children: {
          include: {
            _count: { select: { products: true, children: true } },
          },
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        },
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const allCategories = await prisma.category.findMany();
    const tree = buildCategoryTree(allCategories);
    const flat = flattenCategoryTree(tree);
    const enriched = flat.find((c) => c.id === category.id) || category;

    res.json({
      category: {
        ...category,
        level: (enriched as any).level ?? 0,
        breadcrumbs: (enriched as any).breadcrumbs ?? [],
        productCount: category._count.products,
        childrenCount: category._count.children,
        children: category.children.map((child) => ({
          ...child,
          productCount: child._count.products,
          childrenCount: child._count.children,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category details' });
  }
};

// POST /api/v1/admin/categories
export const createCategory = async (req: AuthRequest, res: Response) => {
  const { name, slug, description, region, image, parentId, isFeatured, displayOrder } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const cleanParentId = (parentId && typeof parentId === 'string' && parentId.trim()) ? parentId.trim() : null;

  try {
    const allCategories = await prisma.category.findMany();

    // 1. Hierarchy depth & cycle validation
    const validation = validateCategoryHierarchy(cleanParentId, null, allCategories);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // 2. Slug generation & uniqueness
    let generatedSlug = (slug && slug.trim()) ? slugify(slug) : slugify(name);
    
    // If child category, optionally prefix parent slug if name collision exists
    const existingSlug = await prisma.category.findUnique({
      where: { slug: generatedSlug },
    });

    if (existingSlug) {
      if (cleanParentId) {
        const parent = allCategories.find((c) => c.id === cleanParentId);
        if (parent) {
          generatedSlug = `${parent.slug}-${generatedSlug}`;
        }
      }
      // Recheck
      const collision = await prisma.category.findUnique({
        where: { slug: generatedSlug },
      });
      if (collision) {
        return res.status(400).json({ error: `A category with slug "${generatedSlug}" already exists.` });
      }
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        description: description?.trim() || null,
        region: region?.trim() || null,
        image: image?.trim() || null,
        parentId: cleanParentId,
        isFeatured: typeof isFeatured === 'boolean' ? isFeatured : false,
        displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
      },
      include: {
        parent: true,
        _count: { select: { products: true, children: true } },
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
          newValues: {
            name: category.name,
            slug: category.slug,
            parentId: category.parentId,
            level: validation.computedLevel,
          },
        },
      }).catch((e) => console.warn('Audit log write error:', e));
    }

    return res.status(201).json({
      success: true,
      message: `Category "${category.name}" created at Level ${validation.computedLevel}.`,
      category: {
        ...category,
        level: validation.computedLevel,
        productCount: 0,
        childrenCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create category.' });
  }
};

// PUT /api/v1/admin/categories/:id
export const updateCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, slug, description, region, image, parentId, isFeatured, displayOrder } = req.body;

  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const allCategories = await prisma.category.findMany();

    const targetParentId = parentId !== undefined
      ? (parentId && typeof parentId === 'string' && parentId.trim() ? parentId.trim() : null)
      : existing.parentId;

    // Validate hierarchy if parent is changing
    if (targetParentId !== existing.parentId) {
      const validation = validateCategoryHierarchy(targetParentId, id, allCategories);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }
    }

    const updatedSlug = slug ? slugify(slug) : (name ? slugify(name) : existing.slug);

    if (updatedSlug !== existing.slug) {
      const collision = await prisma.category.findUnique({ where: { slug: updatedSlug } });
      if (collision && collision.id !== id) {
        return res.status(400).json({ error: `Category slug "${updatedSlug}" is already taken.` });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(updatedSlug && { slug: updatedSlug }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(region !== undefined && { region: region?.trim() || null }),
        ...(image !== undefined && { image: image?.trim() || null }),
        ...(parentId !== undefined && { parentId: targetParentId }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      },
      include: {
        parent: true,
        _count: { select: { products: true, children: true } },
      },
    });

    if (req.user?.userId) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'CATEGORY_UPDATE',
          entityType: 'Category',
          entityId: id,
          oldValues: { name: existing.name, slug: existing.slug, parentId: existing.parentId },
          newValues: { name: updated.name, slug: updated.slug, parentId: updated.parentId },
        },
      }).catch((e) => console.warn('Audit log write error:', e));
    }

    return res.json({
      success: true,
      message: `Category "${updated.name}" updated successfully.`,
      category: {
        ...updated,
        productCount: updated._count.products,
        childrenCount: updated._count.children,
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
        children: true,
        _count: { select: { products: true, children: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    if (existing._count.children > 0) {
      return res.status(400).json({
        error: `Cannot delete category "${existing.name}" because it contains ${existing._count.children} child subcategory(ies). Please reassign or delete child categories first.`,
      });
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

// POST /api/v1/admin/categories/:id/subcategories (Backward-compatible adapter for adding child category)
export const createSubCategory = async (req: AuthRequest, res: Response) => {
  req.body.parentId = req.params.id;
  return createCategory(req, res);
};

// PUT /api/v1/admin/categories/subcategories/:subId (Backward-compatible adapter)
export const updateSubCategory = async (req: AuthRequest, res: Response) => {
  req.params.id = req.params.subId;
  return updateCategory(req, res);
};

// DELETE /api/v1/admin/categories/subcategories/:subId (Backward-compatible adapter)
export const deleteSubCategory = async (req: AuthRequest, res: Response) => {
  req.params.id = req.params.subId;
  return deleteCategory(req, res);
};
