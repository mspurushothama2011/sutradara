## 1. Domain Separation & Security Middleware

- [x] 1.1 Restructure backend controllers into `backend/src/controllers/customer/` and `backend/src/controllers/portal/`
- [x] 1.2 Restructure backend routes into `backend/src/routes/customer/` and `backend/src/routes/portal/`
- [x] 1.3 Implement multi-factor composite rate limiting middleware (`backend/src/middleware/rate-limiter.middleware.ts`)
- [x] 1.4 Implement 10-minute pessimistic checkout lock and 3-stage DB price validation for 1-of-1 heirlooms

## 2. Customer Authentication & Email OTP Engine

- [x] 2.1 Implement Email OTP generation, verification, and rate limiting in `backend/src/controllers/customer/auth.controller.ts`
- [x] 2.2 Build `/login` with Email OTP modal and instant guest cart retention
- [x] 2.3 Build `/account` (Profile & address book) and `/account/orders` (Order history & 1-click live tracking)

## 3. Discovery: Categories, Collections & Search

- [x] 3.1 Build `/categories` (Craft clusters: Varanasi, Kanchipuram, Yeola, Chanderi)
- [x] 3.2 Build `/collections` and `/collections/[slug]` (1-of-1 Vault, Bridal, Festive)
- [x] 3.3 Build `/search` (Instant query search with technique & motif filters)

## 4. Brand Trust, Provenance & Legal Policies

- [x] 4.1 Build `/about` (Direct master weaver sourcing story)
- [x] 4.2 Build `/authenticity` (Silk Mark & 2G Gold Zari purity guarantee)
- [x] 4.3 Build `/contact` (Curator concierge & WhatsApp link)
- [x] 4.4 Build `/privacy-policy`, `/terms`, `/refunds` (7-day inspection policy), and `/shipping` (Insured transit & OTP drop)
- [x] 4.5 Build multi-column luxury Footer and Global Storefront Navbar connecting all pages

## 5. Warehouse Floor Barcode / QR Scanner Integration

- [x] 5.1 Add camera & USB barcode scanner to `/portal/quick-stock` for 1-tap floor stock updates
- [x] 5.2 Add order QR scanner to `/portal/orders` for instant QC video and AWB attachment

## 6. Verification

- [x] 6.1 Verify both backend and frontend compile with 0 TypeScript errors
- [x] 6.2 Test multi-factor rate limiting and shared IP resilience
- [x] 6.3 Test 1-of-1 heirloom reservation lock and guest-to-checkout flow
