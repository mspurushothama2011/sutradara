import { Router } from 'express';
import { listProducts, getProductBySlug } from '../../controllers/customer/catalog.controller';

const router = Router();

router.get('/', listProducts);
router.get('/:slug', getProductBySlug);

export default router;
