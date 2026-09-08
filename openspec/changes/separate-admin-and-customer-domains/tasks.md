## 1. Backend Domain Separation

- [x] 1.1 Create `backend/src/routes/customer/` and `backend/src/routes/admin/` router subtrees.
- [x] 1.2 Move and consolidate customer-facing routes (auth, catalog, cart, checkout, orders, tracking) into `backend/src/routes/customer/`.
- [x] 1.3 Move and consolidate admin-facing routes (portal auth, orders dispatch, inventory/products, marketing, staff, audit) into `backend/src/routes/admin/`.
- [x] 1.4 Refactor `backend/src/controllers/` into `controllers/customer/` and `controllers/admin/` with updated imports.
- [x] 1.5 Update `backend/src/index.ts` to mount `/api/v1/customer`, `/api/v1/admin`, and backward-compatible route aliases.
- [x] 1.6 Verify backend builds cleanly with `npm run build` or TypeScript compilation.

## 2. Frontend Components Domain Separation

- [x] 2.1 Create `frontend/src/components/customer/`, `frontend/src/components/admin/`, and `frontend/src/components/shared/` directories.
- [x] 2.2 Relocate universal UI primitives and layout to `frontend/src/components/shared/` (e.g. `shared/ui/`, `shared/layout/`).
- [x] 2.3 Relocate customer storefront components (landing, storefront, checkout, auth, tracking) to `frontend/src/components/customer/`.
- [x] 2.4 Relocate administrative and portal components (portal nav, stats, dispatch tools, stock editors) to `frontend/src/components/admin/`.
- [x] 2.5 Update component import paths across all component files.

## 3. Frontend App Router Reorganization

- [x] 3.1 Create Next.js Route Groups `frontend/src/app/(customer)/` and `frontend/src/app/(admin)/`.
- [x] 3.2 Relocate all customer storefront pages into `frontend/src/app/(customer)/` (`page.tsx`, `catalog/`, `categories/`, `collections/`, `product/`, `bag/`, `checkout/`, `track/`, `account/`, `login/`, `register/`, `search/`, legal pages).
- [x] 3.3 Relocate administrative portal pages into `frontend/src/app/(admin)/portal/` (`login/`, `dashboard/`, `orders/`, `catalog/`, `quick-stock/`, `marketing/`, `staff-hr/`, `noticeboard/`, `audit-logs/`, `orders/[orderId]/track/`).
- [x] 3.4 Update all page-level imports to point to the new component and library locations.

## 4. Verification and End-to-End Build

- [x] 4.1 Run full Next.js production build (`npm run build`) in `frontend` to verify all 30+ routes compile with 0 errors.
- [x] 4.2 Validate that customer public URLs (`/`, `/catalog`, `/bag`, `/checkout`, `/track`) and admin portal URLs (`/portal/login`, `/portal/orders`, `/portal/dashboard`) resolve correctly.
- [x] 4.3 Update project documentation and walkthrough artifacts.
