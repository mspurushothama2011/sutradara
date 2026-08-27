import { Router } from 'express';
import {
  validateCart,
  createOrder,
  getCustomerOrders,
  trackOrder,
} from '../../controllers/customer/orders.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { compositeRateLimiter } from '../../middleware/rate-limiter.middleware';

const router = Router();

const checkoutRateLimiter = compositeRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Checkout rate limit reached. Please wait a moment.',
  keyPrefix: 'checkout',
});

// Stage 1: Validate cart against DB (unauthenticated allowed for guest browsing)
router.post('/validate-cart', validateCart);

// Stage 2: Create Order & 10-min lock (Authentication Mandatory)
router.post('/create', requireAuth, checkoutRateLimiter, createOrder);

// Customer order history
router.get('/my-orders', requireAuth, getCustomerOrders);

// Public Live Delivery Tracking
router.get('/track/:orderId', trackOrder);

export default router;
