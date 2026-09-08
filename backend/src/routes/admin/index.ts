import { Router } from 'express';
import authRoutes from './auth.routes';
import productsRoutes from './products.routes';
import ordersRoutes from './orders.routes';
import marketingRoutes from './marketing.routes';
import staffRoutes from './staff.routes';
import auditRoutes from './audit.routes';
import categoriesRoutes from './categories.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/marketing', marketingRoutes);
router.use('/staff', staffRoutes);
router.use('/audit', auditRoutes);
router.use('/categories', categoriesRoutes);

export default router;
