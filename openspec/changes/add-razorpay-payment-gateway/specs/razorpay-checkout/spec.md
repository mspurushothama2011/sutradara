## ADDED Requirements

### Requirement: Initialize Razorpay Order
The backend system SHALL provide an authenticated customer endpoint to validate stock, apply valid coupon codes, compute the exact amount in sub-unit paise, and initialize a Razorpay order entity with receipt metadata.

#### Scenario: Successful Razorpay order creation for authenticated patron
- **WHEN** an authenticated customer sends items and shipping address to `/api/v1/customer/orders/razorpay/create-order`
- **THEN** the system validates that all requested sarees have sufficient stock, computes total discount and net total in paise, creates an order via Razorpay API (or realistic simulation mode if API keys are absent), and returns `{ razorpayOrderId, amount, currency: "INR", keyId }`

#### Scenario: Reject order creation if stock is insufficient
- **WHEN** a customer attempts to initialize a Razorpay order for a saree whose stock is 0
- **THEN** the system returns HTTP 409 with code `OUT_OF_STOCK` and descriptive message without initializing a payment order

### Requirement: Verify Razorpay Cryptographic Signature and Atomic Order Execution
The backend system SHALL verify the HMAC-SHA256 signature constructed from `razorpay_order_id + "|" + razorpay_payment_id` using the secret key, and execute the final order creation in an atomic PostgreSQL transaction.

#### Scenario: Valid signature executes database order and decrements inventory
- **WHEN** the frontend submits `razorpayOrderId`, `razorpayPaymentId`, and `razorpaySignature` along with customer items and shipping payload to `/api/v1/customer/orders/razorpay/verify-payment`
- **THEN** the backend verifies the HMAC-SHA256 signature, atomically decrements the stock for the ordered sarees, records the `Order` in PostgreSQL with `status: "PAID"` and associated Razorpay IDs, and returns `{ success: true, order, trackingUrl }`

#### Scenario: Tampered or invalid signature rejection
- **WHEN** an invalid or altered signature is submitted to `/api/v1/customer/orders/razorpay/verify-payment`
- **THEN** the system rejects the transaction with HTTP 400 `Invalid payment signature`, logs an audit warning, and does not create the order or decrement stock

### Requirement: Frontend Razorpay Modal Launcher and Simulation Fallback
The frontend checkout page SHALL load the Razorpay checkout script, launch the standard checkout popup with custom luxury brand gold/dark theme upon patron confirmation, and seamlessly support simulation mode when live keys are not configured.

#### Scenario: Launching Razorpay Standard Checkout modal on live mode
- **WHEN** the patron clicks "Authorize Payment & Secure Acquisition" with live Razorpay keys configured
- **THEN** the Razorpay modal opens displaying UPI, Card, NetBanking, and EMI payment options with Sutraಧಾರ branding

#### Scenario: Simulated Payment Authorization in local / demo mode
- **WHEN** the patron clicks "Authorize Payment & Secure Acquisition" in development mode with simulated keys
- **THEN** the system triggers the simulated payment verification flow, acquires the saree in the database, and redirects the patron to `/track/:orderNumber`

### Requirement: Asynchronous Webhook Capture Handler
The backend system SHALL provide a webhook listener at `/api/v1/customer/orders/razorpay/webhook` to asynchronously handle `order.paid` and `payment.captured` events.

#### Scenario: Webhook updates order status if payment captured
- **WHEN** a validated Razorpay webhook payload arrives with `payment.captured`
- **THEN** the system ensures the corresponding order is marked `PAID` in PostgreSQL with the confirmed payment ID
