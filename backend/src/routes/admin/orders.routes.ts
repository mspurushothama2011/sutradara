import { Router } from 'express';
import { listAllOrders, getOrderTracking, updateDispatch } from '../../controllers/admin/orders.controller';
import { dispatchOrderViaShiprocket, handleShiprocketWebhook } from '../../controllers/admin/logistics.controller';
import { requireAuth, requireCapability } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, requireCapability('orders:manage'), listAllOrders);
router.get('/:id', requireAuth, requireCapability('orders:manage'), getOrderTracking);
router.patch('/:id/dispatch', requireAuth, requireCapability('orders:manage'), updateDispatch);
router.post('/:orderId/shiprocket-dispatch', requireAuth, requireCapability('orders:manage'), dispatchOrderViaShiprocket);
router.post('/shiprocket-webhook', handleShiprocketWebhook);

export default router;
