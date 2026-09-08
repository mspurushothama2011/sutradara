import { Router } from 'express';
import { listCategories, getCategoryBySlug } from '../../controllers/customer/categories.controller';

const router = Router();

router.get('/', listCategories);
router.get('/:slug', getCategoryBySlug);

export default router;
