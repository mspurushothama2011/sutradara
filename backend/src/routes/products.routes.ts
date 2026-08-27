import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  overrideStock,
  deleteProduct,
} from '../controllers/products.controller';
import { requireAuth, requireCapability } from '../middleware/auth.middleware';

const router = Router();

// Public / Protected list and get
router.get('/', listProducts);
router.get('/:idOrSlug', getProduct);

// Protected mutation routes
router.post('/', requireAuth, requireCapability('products:create_edit'), createProduct);
router.patch('/:id/stock', requireAuth, requireCapability('inventory:quick_update'), overrideStock);
router.delete('/:id', requireAuth, requireCapability('products:create_edit'), deleteProduct);

export default router;
