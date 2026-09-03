## 1. Customer Authentication Fixes

- [x] 1.1 Review and fix `customer/auth.controller.ts` to ensure OTP generation and verification query the PostgreSQL `Customer` table.
- [x] 1.2 Add local dev OTP output so testing `/login` immediately shows the generated 6-digit OTP in the console/response.
- [x] 1.3 Verify `/login` and `/account` pages cleanly authenticate, set session cookies/tokens, and display patron details.

## 2. Staff & Admin Portal Authentication Fixes

- [x] 2.1 Fix `auth.controller.ts` portal login to verify passwords via `bcrypt.compare` against PostgreSQL `User` records.
- [x] 2.2 Verify JWT generation includes `role`, `customPermissions`, and sets the `_sutradara_token` cookie.
- [x] 2.3 Verify `frontend/src/app/portal/login/page.tsx` logs in `admin@sutradara.in` (`AdminPassword@2026`) and `staff@sutradara.in` (`StaffPassword@2026`) and redirects to `/portal/dashboard`.
- [x] 2.4 Verify `usePermissions` hook in frontend properly reads user capabilities and enforces RBAC on navigation items.

## 3. Product Catalog & Detail Display Fixes

- [x] 3.1 Verify `products.controller.ts` queries PostgreSQL `Product` table and excludes `costPrice` on public endpoints.
- [x] 3.2 Update `frontend/src/app/catalog/page.tsx` to handle image fallbacks, filter states, and accurate product pricing.
- [x] 3.3 Verify single product page `frontend/src/app/product/[slug]/page.tsx` renders live saree data, Silk Mark badge, and 1-of-1 tags from PostgreSQL.
- [x] 3.4 Verify deal countdown banner in `DealCountdownBanner.tsx` and featured showcase in `FeaturedShowcase.tsx` pull active database products.

## 4. Category & Craft Cluster Taxonomy Fixes

- [x] 4.1 Ensure `categories.controller.ts` returns all 4 clusters with their sub-categories (enforced max 3).
- [x] 4.2 Update `frontend/src/app/categories/page.tsx` and homepage craft preview cards to link cleanly to `/catalog?craftRegion=...`.
- [x] 4.3 Verify subcategory filtering works seamlessly on the catalog page.

## 5. Comprehensive Diagnostic Verification

- [x] 5.1 Run diagnostic tests on customer login flow (`POST /api/v1/customer/auth/request-otp` and `POST /api/v1/customer/auth/verify-otp`).
- [x] 5.2 Run diagnostic tests on staff portal login (`POST /api/v1/portal/auth/login`).
- [x] 5.3 Verify catalog API (`GET /api/v1/products`) and category API (`GET /api/v1/categories`).
- [x] 5.4 Test frontend UI workflows end-to-end in browser.
