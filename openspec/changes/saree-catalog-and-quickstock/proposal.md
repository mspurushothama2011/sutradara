## Why

With the core authentication and database foundation in place, Sutradara needs the live product catalog engine so that Admin and Staff can catalog authentic handloom sarees, update stock in real-time on the warehouse/shop floor, and customers can discover and browse sarees with rich craft provenance and Silk Mark certification.

## What Changes

* **Backend Product API:** REST endpoints for product CRUD, filtering by craft region, fabric, zari purity, and fast floor stock overrides with audit trail logging.
* **Portal Saree Catalog Management (`/portal/catalog`):** Admin & Staff dashboard table to create, edit, filter, and archive sarees with 1-of-1 Heirloom and craft provenance fields.
* **Portal Floor Quick-Stock Adjuster (`/portal/quick-stock`):** Mobile/floor-optimized 1-tap stock counter and In-Stock/Out-of-Stock toggles.
* **Customer Storefront Catalog (`/catalog`):** Public luxury catalog with dynamic filters (Banarasi, Kanjivaram, Chanderi, Paithani, Pure Gold Zari, Price, 1-of-1 Heirloom).
* **Customer Saree Details Page (`/product/[slug]`):** Luxury product showcase with Silk Mark authentication card, 1-of-1 uniqueness badge, multi-image gallery, and craft storytelling.

## Capabilities

### New Capabilities
- `product-catalog-quickstock`: Complete saree catalog management, 1-of-1 Heirloom badging, floor quick-stock adjuster, and customer storefront browsing.

### Modified Capabilities
<!-- None -->

## Impact

- **Backend:** Adds `backend/src/controllers/products.controller.ts` and `backend/src/routes/products.routes.ts`.
- **Frontend:** Adds `/portal/catalog`, `/portal/quick-stock`, `/catalog`, and `/product/[slug]`.
- **Database:** Reads and writes live data to PostgreSQL `Product` and `AuditLog` tables.
