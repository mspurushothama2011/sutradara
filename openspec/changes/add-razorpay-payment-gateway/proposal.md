## Why

Sutraಧಾರ currently supports shopping bag checkout and direct 1-of-1 "Buy Now" flow with simulated database placement. To enable real-world high-assurance e-commerce transactions for authentic luxury handloom sarees in India and globally, Sutraಧಾರ requires integration with **Razorpay Standard Checkout** supporting UPI (GPay, PhonePe, Paytm, Cred), Credit/Debit Cards, NetBanking, and EMIs, with server-side HMAC-SHA256 signature verification and graceful offline simulation fallback.

## What Changes

- **Backend Razorpay Order Initialization Endpoint**: Create `POST /api/v1/customer/orders/razorpay/create-order` to validate database stock, apply discounts, convert INR into sub-unit paise, and initialize a Razorpay order.
- **Backend Razorpay Signature Verification & Order Execution**: Create `POST /api/v1/customer/orders/razorpay/verify-payment` to verify HMAC-SHA256 signatures, atomically decrement stock, record `razorpayOrderId` & `razorpayPaymentId`, and finalize the `Order` in PostgreSQL.
- **Backend Asynchronous Webhook Receiver**: Create `POST /api/v1/customer/orders/razorpay/webhook` to handle asynchronous `order.paid` and `payment.captured` webhooks.
- **Dual Mode (Production & Simulation)**: If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are not set in `.env`, the backend provides a realistic mock order (`order_sim_...`) and the frontend allows seamless 1-click sandbox testing without breaking local development.
- **Frontend Master Checkout Integration**: Update `/checkout` (covering both Shopping Bag and Direct Buy Now) to load Razorpay's `checkout.js` modal with customized luxury brand dark/gold styling.
- **Shared Types Update**: Add Razorpay order creation and payment verification payload and response interfaces to `shared/types/index.ts`.

## Capabilities

### New Capabilities
- `razorpay-checkout`: End-to-end Razorpay order creation, client-side luxury standard checkout modal launcher, HMAC-SHA256 cryptographic signature verification, atomic PostgreSQL order finalization, and simulated fallback mode.

### Modified Capabilities
- `delivery-tracking`: Order creation automatically links `razorpayOrderId` and `razorpayPaymentId` into the order's immutable financial snapshot and tracking record.

## Impact

- **Frontend**: `frontend/src/app/(customer)/checkout/page.tsx`, `frontend/src/lib/api.ts`.
- **Backend**: `backend/src/routes/customer/orders.routes.ts`, `backend/src/controllers/customer/orders.controller.ts`, `backend/src/services/razorpay.service.ts`.
- **Shared Types**: `shared/types/index.ts`.
- **Dependencies**: `razorpay` npm package (or native REST API + crypto on Node.js) on backend.
