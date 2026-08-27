import { Router } from 'express';
import {
  createOrder,
  getOrderTracking,
  listAllOrders,
  updateDispatch,
} from '../controllers/orders.controller';
import { requireAuth, requireCapability } from '../middleware/auth.middleware';

const router = Router();

// Public customer routes
router.post('/create', createOrder);
router.get('/track/:orderId', getOrderTracking);

// Protected Staff Portal routes (Requires orders:manage capability)
router.get('/', requireAuth, requireCapability('orders:manage'), listAllOrders);
router.patch('/:orderId/dispatch', requireAuth, requireCapability('orders:manage'), updateDispatch);

export default router;
