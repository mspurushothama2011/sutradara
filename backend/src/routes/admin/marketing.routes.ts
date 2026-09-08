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

router.get('/coupons', requireAuth, requireCapability('marketing:manage'), listCoupons);
router.get('/coupons/public', listPublicCoupons);
router.post('/coupons', requireAuth, requireCapability('marketing:manage'), createCoupon);
router.post('/coupons/validate', validateCoupon);

router.get('/deal-of-the-day', getActiveDeal);
router.post('/deal-of-the-day', requireAuth, requireCapability('marketing:manage'), updateActiveDeal);

export default router;
