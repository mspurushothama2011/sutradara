import { Router } from 'express';
import authRoutes from './auth.routes';
import ordersRoutes from './orders.routes';
import catalogRoutes from './catalog.routes';
import categoriesRoutes from './categories.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/orders', ordersRoutes);
router.use('/catalog', catalogRoutes);
router.use('/products', catalogRoutes);
router.use('/categories', categoriesRoutes);

export default router;
