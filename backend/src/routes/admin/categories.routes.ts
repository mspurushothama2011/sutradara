import { Router } from 'express';
import {
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleFeaturedCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../../controllers/admin/categories.controller';
import { requireAuth, requireCapability } from '../../middleware/auth.middleware';

const router = Router();

// Category Routes
router.get('/', listCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', requireAuth, requireCapability('products:create_edit'), createCategory);
router.put('/:id', requireAuth, requireCapability('products:create_edit'), updateCategory);
router.patch('/:id/featured', requireAuth, requireCapability('products:create_edit'), toggleFeaturedCategory);
router.delete('/:id', requireAuth, requireCapability('products:create_edit'), deleteCategory);

// SubCategory Routes
router.post('/:id/subcategories', requireAuth, requireCapability('products:create_edit'), createSubCategory);
router.put('/subcategories/:subId', requireAuth, requireCapability('products:create_edit'), updateSubCategory);
router.delete('/subcategories/:subId', requireAuth, requireCapability('products:create_edit'), deleteSubCategory);

export default router;
