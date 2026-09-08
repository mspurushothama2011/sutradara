import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  overrideStock,
  deleteProduct,
} from '../../controllers/admin/products.controller';
import { requireAuth, requireCapability } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', listProducts);
router.get('/:idOrSlug', getProduct);
router.post('/', requireAuth, requireCapability('products:create_edit'), createProduct);
router.patch('/:id/stock', requireAuth, requireCapability('inventory:quick_update'), overrideStock);
router.delete('/:id', requireAuth, requireCapability('products:create_edit'), deleteProduct);

export default router;
