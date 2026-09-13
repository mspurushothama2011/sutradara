## Context

Sutraಧಾರ’s master checkout page (`/checkout`) handles both multi-piece Shopping Bag acquisitions and single 1-of-1 Direct Buy purchases. The platform needs an integrated payment gateway architecture for real-time payments across India and abroad via Razorpay, while retaining a robust simulation mode for offline/local development.

## Goals / Non-Goals

**Goals:**
- Provide secure server-side Razorpay Order initialization with zero-client price trust.
- Support UPI App intent, NetBanking (50+ banks), Debit/Credit cards, and No-Cost/Low-Cost EMIs for expensive sarees.
- Cryptographically verify HMAC-SHA256 signatures (`razorpay_order_id + "|" + razorpay_payment_id`) before stock decrement and order creation in PostgreSQL.
- Provide a dual-mode fallback that operates seamlessly in development when API credentials are not set.
- Ensure atomic transactions in PostgreSQL to prevent double-selling of 1-of-1 heirloom pieces.

**Non-Goals:**
- Recurring subscription payments or wallet top-ups.
- Storing customer credit card numbers on Sutraಧಾರ servers (handled 100% PCI-DSS compliant within Razorpay’s secure iframe/modal).

## Decisions

### 1. Payment Verification Flow: Server-Side HMAC SHA256 Signature Verification
- **Rationale**: The client receives `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` from Razorpay SDK upon successful authorization. The frontend sends these along with the order payload to `/api/v1/customer/orders/razorpay/verify-payment`. The backend computes `crypto.createHmac('sha256', secret).update(orderId + "|" + paymentId).digest('hex')` and validates it against the received signature. Only on signature match is the order created in PostgreSQL and stock decremented.
- **Alternative Considered**: Decrementing stock before opening the modal. *Rejected* because users closing or abandoning the Razorpay modal would lock up inventory for other patrons.

### 2. Dual-Mode Operation (Live & Realistic Offline Simulation)
- **Rationale**: To allow offline testing and development without requiring live test API keys on every local environment, `backend/src/services/razorpay.service.ts` detects whether `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` exist. If missing, it generates a mock `order_sim_...` ID and validates simulated signatures `sim_sig_...` instantly.

### 3. Client Modal Theme & UX
- **Rationale**: The Razorpay modal is customized with Sutraಧಾರ’s luxury aesthetic:
  ```ts
  theme: {
    color: '#c9a84c',
    backdrop_color: '#0d0906',
  }
  ```
  with the Sutraಧಾರ emblem and pre-filled customer details from Step 1 & Step 2.

## Risks / Trade-offs

- **[Risk] Patron closes browser before frontend sends signature to backend** → **Mitigation**: Implement `POST /api/v1/customer/orders/razorpay/webhook` to asynchronously capture `payment.captured` and guarantee order creation if frontend connection is lost.
- **[Risk] Saree acquired by another patron while first patron was completing payment in modal** → **Mitigation**: Re-check stock in the atomic Prisma transaction before committing payment verification. If stock was depleted, initiate an immediate refund via Razorpay API and return a clear `STOCK_UNAVAILABLE` race condition message.
