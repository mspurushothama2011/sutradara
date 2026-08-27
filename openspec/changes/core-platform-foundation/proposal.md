## Why

Sutradara needs a robust, scalable foundation to transition from a static landing page into a live e-commerce platform. We must establish the unified PostgreSQL database schema, Express backend API server, and a unified authentication portal with granular capability-based access control (RBAC) so that Admin and Staff can manage products, stock, and operations securely.

## What Changes

* **Database Engine & Models:** Complete PostgreSQL schema with Prisma ORM supporting `User`, `Product`, `Order`, `OrderItem`, `Coupon`, `Attendance`, `WorkLog`, `Announcement`, and `AuditLog`.
* **Express Backend Infrastructure:** API server with CORS, rate limiting, error handling, and Cloudflare header trust.
* **Unified Authentication & RBAC:** Single login endpoint (`/api/v1/auth/login`) with `httpOnly` secure cookies, short-lived JWTs, and dynamic capability permission guards.
* **Unified Portal Shell:** Next.js portal layout (`/portal/*`) with dynamic sidebar navigation that automatically filters menu items based on the logged-in user's assigned capabilities.
* **Shared Types Layer:** Master TypeScript definitions in `shared/types/index.ts` synchronized across Frontend and Backend.

## Capabilities

### New Capabilities
- `portal-auth-rbac`: Unified login system, `httpOnly` JWT session management, and granular capability-based access control.
- `database-schema-core`: PostgreSQL master schema via Prisma ORM for products, users, orders, staff attendance, coupons, and audit logs.
- `portal-shell-navigation`: Dynamic Next.js portal shell with capability-aware sidebar navigation and role guards.

### Modified Capabilities
<!-- No modified capabilities; this is the initial core platform foundation -->

## Impact

- **Backend:** Initializes `backend/src/` with Prisma client, auth middleware, rate limiter, and Express server.
- **Frontend:** Adds `/portal/login`, `/portal/dashboard`, capability hooks (`usePermissions`), and portal layout.
- **Shared:** Updates `shared/types/index.ts` with complete domain models.
- **Database:** Supabase PostgreSQL instance migrated with core tables.
