## Why

Following the database migration to local PostgreSQL (`sutradara_sarees_dev`), the application requires end-to-end alignment between frontend interfaces and backend PostgreSQL queries. Currently, customer OTP login, staff/admin portal authentication, product catalog filters, and category/sub-category navigation encounter disconnects, causing login failures and inconsistent data rendering. This change diagnoses, fixes, and verifies all authentication flows, catalog rendering, and category taxonomies against the live PostgreSQL database.

## What Changes

- **Customer Authentication Flow**: Fix customer Email OTP generation, rate limiting, and session verification against the PostgreSQL `Customer` table, enabling smooth patron checkout and account profile access.
- **Staff & Admin Portal Login**: Fix staff authentication on `/portal/login` to query the `User` table in PostgreSQL, verify hashed passwords (`AdminPassword@2026` / `StaffPassword@2026`), issue secure HttpOnly tokens, and enforce granular RBAC capabilities.
- **Dynamic Product Catalog & Detail Display**: Ensure `/catalog` and `/product/[slug]` render live PostgreSQL `Product` records with images, prices, stock statuses, 1-of-1 heirloom badging, Silk Mark verification tags, and active filters.
- **Craft Cluster Category Taxonomy**: Connect the homepage, `/categories`, and catalog filters to PostgreSQL `Category` and `SubCategory` tables, supporting up to 3 sub-categories per cluster.
- **Comprehensive Verification Checklist**: Implement and execute a systematic diagnostic checklist across all auth, catalog, and category flows.

## Capabilities

### New Capabilities
- `customer-auth-flow`: End-to-end customer passwordless Email OTP verification, patron address book, and order history linked to the `Customer` table.
- `staff-portal-auth`: Dedicated staff and admin login with bcrypt/argon2id password verification, session cookie management, and capability checks.
- `live-product-catalog`: Database-driven saree catalog, search, multi-attribute filtering (region, fabric, zari, price, heirloom), and single product view.
- `cluster-category-taxonomy`: Two-tier craft cluster navigation and sub-category routing backed by PostgreSQL `Category` and `SubCategory` tables.

### Modified Capabilities
<!-- None -->

## Impact

- **Backend APIs**:
  - `/api/v1/customer/auth/*` (Customer OTP)
  - `/api/v1/portal/auth/*` and `/api/v1/auth/*` (Staff & Admin Login)
  - `/api/v1/products/*` (Catalog & single product)
  - `/api/v1/categories/*` (Clusters & sub-categories)
- **Frontend Pages**:
  - `/login` (Customer OTP Login)
  - `/portal/login` (Staff & Admin Login)
  - `/catalog` (Treasury Catalog & Filters)
  - `/product/[slug]` (Saree Detail View)
  - `/categories` (Craft Clusters Directory)
  - `/account` (Customer Sanctuary)
- **Database**: PostgreSQL (`sutradara_sarees_dev`) queries via Prisma ORM.
