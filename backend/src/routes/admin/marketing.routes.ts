import { Router } from 'express';
import {
  listCoupons,
  listPublicCoupons,
  createCoupon,
  validateCoupon,
  getActiveDeal,
  updateActiveDeal,
} from '../../controllers/admin/marketing.controller';
import { requireAuth, requireCapability } from '../../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/deal', getActiveDeal);
router.get('/deal-of-the-day', getActiveDeal);
router.get('/public-coupons', listPublicCoupons);
router.get('/coupons/public', listPublicCoupons);
router.post('/validate-coupon', validateCoupon);
router.post('/coupons/validate', validateCoupon);

// Protected routes (Requires marketing:manage capability)
router.get('/coupons', requireAuth, requireCapability('marketing:manage'), listCoupons);
router.post('/coupons', requireAuth, requireCapability('marketing:manage'), createCoupon);
router.post('/deal-of-the-day', requireAuth, requireCapability('marketing:manage'), updateActiveDeal);
router.put('/deal', requireAuth, requireCapability('marketing:manage'), updateActiveDeal);

export default router;
