import { Router } from 'express';
import { listCategories, getCategoryBySlug } from '../../controllers/admin/categories.controller';

const router = Router();

router.get('/', listCategories);
router.get('/:slug', getCategoryBySlug);

export default router;
