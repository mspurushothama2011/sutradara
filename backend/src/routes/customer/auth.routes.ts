import { Router } from 'express';
import {
  sendEmailOtp,
  verifyEmailOtp,
  signInWithGoogle,
  requestAccountDeletionOtp,
  deleteCustomerAccount,
  getCustomerProfile,
  saveCustomerAddress,
} from '../../controllers/customer/customer-auth.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { compositeRateLimiter } from '../../middleware/rate-limiter.middleware';

const router = Router();

// Multi-factor composite rate limit on OTP sending: max 5 requests per 15 minutes per (email + device)
const otpRateLimiter = compositeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many OTP requests for this account. Please wait 15 minutes before requesting again.',
  keyPrefix: 'otp-send',
});

// Max 5 verification attempts per 15 minutes
const verifyRateLimiter = compositeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many verification attempts. Please wait 15 minutes.',
  keyPrefix: 'otp-verify',
});

// Customer Authentication
router.post('/send-otp', otpRateLimiter, sendEmailOtp);
router.post('/verify-otp', verifyRateLimiter, verifyEmailOtp);
router.post('/google', signInWithGoogle);

// Customer Profile & Address Management
router.get('/me', requireAuth, getCustomerProfile);
router.post('/address', requireAuth, saveCustomerAddress);

// 2-Step Account Deactivation & DPDP/GDPR PII Anonymization
router.post('/account/delete-request-otp', requireAuth, requestAccountDeletionOtp);
router.delete('/account', requireAuth, deleteCustomerAccount);

export default router;
