## 1. Backend Service & Endpoints

- [x] 1.1 Create `backend/src/services/razorpay.service.ts` with order creation, signature verification, and dual-mode simulation fallback
- [x] 1.2 Implement `createRazorpayOrder` controller method in `backend/src/controllers/customer/orders.controller.ts` validating stock, applying coupons, and calculating amount in paise
- [x] 1.3 Implement `verifyRazorpayPayment` controller method in `backend/src/controllers/customer/orders.controller.ts` with HMAC SHA256 verification and atomic Prisma stock decrement & order creation
- [x] 1.4 Implement `handleRazorpayWebhook` webhook handler for asynchronous payment captures in `backend/src/controllers/customer/orders.controller.ts`
- [x] 1.5 Register Razorpay routes in `backend/src/routes/customer/orders.routes.ts` (`/razorpay/create-order`, `/razorpay/verify-payment`, `/razorpay/webhook`)

## 2. Shared Types & Client Integration

- [x] 2.1 Update `shared/types/index.ts` with Razorpay order creation request/response and payment verification payloads
- [x] 2.2 Create Razorpay script loader utility and modal launcher in `frontend/src/lib/razorpay.ts` (or direct checkout helper)
- [x] 2.3 Integrate Razorpay standard checkout modal in `frontend/src/app/(customer)/checkout/page.tsx` for both Shopping Bag and Direct Buy Now flows
- [x] 2.4 Add simulated payment modal fallback in `frontend/src/app/(customer)/checkout/page.tsx` when running in offline/local development mode

## 3. Verification & End-to-End Testing

- [x] 3.1 Verify Razorpay order initialization and signature verification endpoints via automated backend tests
- [x] 3.2 Verify full checkout flow in browser (Direct Buy and Bag acquisitions) ensuring stock is decremented and order is placed in PostgreSQL
- [x] 3.3 Validate typecheck and production build on both backend and frontend
