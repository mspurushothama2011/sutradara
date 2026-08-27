## 1. Backend Products & Stock API

- [x] 1.1 Implement `backend/src/controllers/products.controller.ts` with list, getBySlug, create, update, delete, and stockOverride endpoints
- [x] 1.2 Implement `backend/src/routes/products.routes.ts` with `requireAuth` and `requireCapability` guards
- [x] 1.3 Mount products routes on `/api/v1/products` in `backend/src/index.ts`

## 2. Portal Saree Management & Floor Quick-Stock

- [x] 2.1 Build `/portal/catalog/page.tsx` with saree listing table, search/filter, and "Add New Saree" modal
- [x] 2.2 Build `/portal/quick-stock/page.tsx` with mobile-optimized 1-tap stock counter and In-Stock/Out-of-Stock toggles

## 3. Customer Storefront Catalog & Product Showcase

- [x] 3.1 Build `/catalog/page.tsx` with multi-facet filters (Banarasi, Kanjivaram, Chanderi, Paithani, Pure Gold Zari, 1-of-1 Heirloom)
- [x] 3.2 Build `/product/[slug]/page.tsx` with luxury gallery, Silk Mark badge, 1-of-1 Heirloom callout, and craft provenance story
- [x] 3.3 Link landing page "Begin Your Journey" and navigation to `/catalog`

## 4. Verification

- [x] 4.1 Verify creating a saree in `/portal/catalog` makes it appear instantly in `/catalog` and `/product/[slug]`
- [x] 4.2 Verify floor stock adjuster in `/portal/quick-stock` updates live inventory count and creates an audit log
