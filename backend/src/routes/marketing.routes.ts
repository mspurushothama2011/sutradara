import { Router } from 'express';
import {
  listCoupons,
  createCoupon,
  validateCoupon,
  getActiveDeal,
  updateActiveDeal,
} from '../controllers/marketing.controller';
import { requireAuth, requireCapability } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/deal', getActiveDeal);
router.post('/validate-coupon', validateCoupon);

// Protected routes (Requires marketing:manage capability)
router.get('/coupons', requireAuth, requireCapability('marketing:manage'), listCoupons);
router.post('/coupons', requireAuth, requireCapability('marketing:manage'), createCoupon);
router.put('/deal', requireAuth, requireCapability('marketing:manage'), updateActiveDeal);

export default router;
