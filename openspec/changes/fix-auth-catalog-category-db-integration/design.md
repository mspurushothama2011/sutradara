## Context

The backend has transitioned from in-memory arrays to a live PostgreSQL database (`sutradara_sarees_dev`) via Prisma ORM. However, several API endpoints and frontend components currently exhibit mismatches:
1. **Customer Authentication**: `/login` and `/api/v1/customer/auth/*` must generate and verify OTPs against the PostgreSQL `Customer` table without requiring third-party SMS providers during local dev (displaying OTP in dev console/API response).
2. **Staff / Admin Portal Authentication**: `/portal/login` requires valid password comparison using `bcrypt.compare` against `User.passwordHash` in PostgreSQL, issuing JWT cookies (`_sutradara_token`), and ensuring the permissions hook (`usePermissions`) properly decodes `customPermissions` and `role`.
3. **Catalog & Single Product Rendering**: The `/catalog` page must fetch live products from `GET /api/v1/products` with query params (`craftRegion`, `zariType`, `isHeirloom1of1`, `search`), handle pagination/count, and gracefully render high-res image carousels. Single product `/product/[slug]` must load live data by slug.
4. **Category & Sub-Category Integration**: The `/categories` page and homepage clusters must consume `GET /api/v1/categories` and route cleanly to `/catalog?craftRegion=...` or `/catalog?subCategory=...`.

## Goals / Non-Goals

**Goals:**
- Unify customer passwordless authentication with PostgreSQL `Customer` records and local dev OTP output.
- Make staff/admin portal authentication rock solid for `admin@sutradara.in` (`AdminPassword@2026`) and `staff@sutradara.in` (`StaffPassword@2026`).
- Ensure product listings, images, pricing, and stock status are 100% database-driven across storefront and portal.
- Establish seamless category and sub-category navigation with max-3 sub-categories per cluster.
- Provide a clear diagnostic checklist to verify each area.

**Non-Goals:**
- Production SMS gateway integration (Twilio/Gupshup) — dev uses local simulated OTP delivery.
- Redesigning the visual theme (preserves existing dark gold luxury aesthetic).

## Decisions

1. **Dual Auth Route Support (`/api/v1/customer/auth` & `/api/v1/portal/auth` with legacy fallback `/api/v1/auth`)**:
   - *Rationale*: Prevents breaking existing client requests while strictly segregating customer and staff authentication pipelines.
2. **Standardized Image Fallback Strategy**:
   - *Rationale*: If a database product has empty image arrays, default to `/frames/ezgif-frame-240.jpg` to prevent layout breaks.
3. **Database-Driven Deal & Featured Flags**:
   - *Rationale*: `isDealOfDay` and `isFeatured` fields on `Product` dictate what appears on the top countdown banner and homepage showcase.

## Risks / Trade-offs

- **[Risk] Cookie/CORS Token Issues**: In local development, cookies on `localhost:4000` might not persist across `localhost:3000` if `credentials: true` or `SameSite` settings mismatch.
  - *Mitigation*: Ensure `cors` middleware explicitly whitelists `http://localhost:3000` with `credentials: true`, and return JWT in both HttpOnly cookie and JSON response body for localStorage/cookie dual resiliency.
- **[Risk] Saree Slug Collisions**: Duplicate slugs can cause 404 or wrong saree display.
  - *Mitigation*: Slugs are enforced with `@unique` index in Prisma schema and checked before creation.
