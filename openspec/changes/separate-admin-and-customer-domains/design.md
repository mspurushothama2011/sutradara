## Context

The Sutradara platform has grown into a comprehensive luxury e-commerce and loom inventory management system. Storefront customer workflows (catalog browsing, shopping bag, checkout, OTP verification, satellite delivery tracking) coexist in the repository alongside internal administrative workflows (staff authentication, warehouse quick-stock, logistics dispatch, NDR alerts, marketing coupons, and security audit trails).

Currently, files across `frontend/src/app`, `frontend/src/components`, `backend/src/routes`, and `backend/src/controllers` share overlapping directories. This design establishes a strict two-domain architectural quarantine between Customer and Admin layers without altering public URLs or breaking existing API contracts.

## Goals / Non-Goals

**Goals:**
- Reorganize frontend routes using Next.js Route Groups `app/(customer)` and `app/(admin)/portal` to keep public URLs clean while isolating file trees.
- Refactor `frontend/src/components` into `customer/`, `admin/`, and `shared/` (for universal design system primitives).
- Segment backend routes, controllers, and services into `routes/customer/` vs. `routes/admin/` and `controllers/customer/` vs. `controllers/admin/`.
- Maintain backwards compatibility by aliasing legacy top-level `/api/v1/*` routes while introducing the structured `/api/v1/customer/*` and `/api/v1/admin/*` namespaces.
- Update all code imports across frontend and backend, validating complete type-check and build integrity.

**Non-Goals:**
- Changing database schema or altering Prisma models.
- Changing customer-facing URL paths (e.g., `/catalog`, `/checkout`, `/track` remain identical).
- Modifying shared TypeScript contracts in `shared/types/index.ts`.

## Decisions

### 1. Next.js App Router Route Groups `(customer)` and `(admin)`
- **Decision**: Wrap customer storefront pages inside `src/app/(customer)/` and administrative portal pages inside `src/app/(admin)/portal/`.
- **Rationale**: Route groups in parentheses do not add segments to URL paths. Customers continue to navigate to `/`, `/catalog`, `/bag`, `/checkout`, `/track`, while admin staff access `/portal/login`, `/portal/orders`, `/portal/catalog`, etc.
- **Alternatives Considered**: Subdirectory prefixes like `src/app/customer/catalog` would alter external links to `/customer/catalog`, causing SEO and bookmark breakage.

### 2. Three-Tier Frontend Component Architecture
- **Decision**:
  - `src/components/customer/`: Landing canvas, luxury showcase, storefront catalog cards, patron bag sheet, customer auth modal, patron satellite tracking.
  - `src/components/admin/`: Portal navigation, metric cards, order dispatch desk, stock editor, HR management, audit stream.
  - `src/components/shared/`: Universal design system UI primitives (`ui/GoldButton`, `ui/Modal`, `ui/Badge`, `ui/Spinner`, `layout/Footer`).
- **Rationale**: Prevents accidental coupling where a customer view imports staff telemetry tools, or vice versa, while keeping shared UI consistent.

### 3. Backend Routing & Namespace Aliasing
- **Decision**: Structure backend routes into `backend/src/routes/customer/index.ts` and `backend/src/routes/admin/index.ts`.
- **Rationale**: Clean separation of route middleware, rate limiting, and RBAC requirements. The root router mounts `/api/v1/customer` and `/api/v1/admin`, and also mounts alias forwards for existing storefront calls.

## Risks / Trade-offs

- **[Risk] Broken relative import paths during file moves** → **Mitigation**: Use TypeScript path aliases (`@/components/...`, `@/lib/...`) and run exhaustive `npm run build` checks on both frontend and backend after relocation.
- **[Risk] Client API endpoint mismatch** → **Mitigation**: Root backend router mounts both domain subrouters and backward-compatible route aliases.
- **[Risk] Next.js caching or static route collision** → **Mitigation**: Clean `.next` build cache and verify route generation output during build.
