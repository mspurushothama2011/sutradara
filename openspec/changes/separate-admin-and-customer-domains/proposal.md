## Why

Currently, customer-facing storefront files and internal administrative/staff portal files are mixed across top-level directories in both the frontend (`src/app/`, `src/components/`) and backend (`src/routes/`, `src/controllers/`, `src/services/`). This intermingling creates ambiguity, increases the cognitive load when developing or maintaining features, and introduces the risk of leaking internal administrative logic or accidentally mixing customer and staff workflows.

Establishing a strict, two-domain directory separation (`customer` and `admin`) across both frontend and backend will guarantee modular isolation, crystal-clear code ownership, and frictionless feature development without breaking customer public URLs or existing API contracts.

## What Changes

- **Frontend Route Organization**: Reorganize `frontend/src/app` using Next.js App Router Route Groups:
  - `frontend/src/app/(customer)/` for all customer-facing routes (`/`, `/catalog`, `/categories`, `/collections`, `/product/[slug]`, `/bag`, `/checkout`, `/track`, `/account`, `/login`, `/register`, etc.).
  - `frontend/src/app/(admin)/portal/` for all staff and admin operations (`/portal/login`, `/portal/dashboard`, `/portal/orders`, `/portal/catalog`, `/portal/quick-stock`, `/portal/marketing`, `/portal/staff-hr`, `/portal/noticeboard`, `/portal/audit-logs`, `/portal/orders/[orderId]/track`).
- **Frontend Component Organization**: Separate `frontend/src/components` into three explicit domains:
  - `frontend/src/components/customer/` (landing, storefront, checkout, auth, tracking).
  - `frontend/src/components/admin/` (portal shell, orders desk, inventory management, staff HR).
  - `frontend/src/components/shared/` (universal UI design system primitives like GoldButton, InputField, Modal, Badge, Spinner, Layout).
- **Backend Route & Controller Separation**: Structure `backend/src/routes`, `backend/src/controllers`, and `backend/src/services` into `customer` and `admin` subtrees:
  - `backend/src/routes/customer/` and `backend/src/controllers/customer/` for public customer APIs (`/api/v1/customer/*` with backwards-compatible aliases for `/api/v1/*`).
  - `backend/src/routes/admin/` and `backend/src/controllers/admin/` for internal staff/admin APIs (`/api/v1/admin/*`).
- **Comprehensive Import Updates**: Update all relative and alias imports across the entire codebase to match the new structure, ensuring 100% build integrity and zero runtime broken links.

## Capabilities

### New Capabilities
- `domain-architecture-isolation`: Formal structure and boundaries enforcing strict isolation between customer storefront workflows and staff administration systems across frontend components, route groups, backend routers, controllers, and services.

### Modified Capabilities
- `delivery-tracking`: Separate customer satellite tracking timeline from admin dispatch and logistics controls.
- `portal-auth-rbac`: Route admin portal requests through isolated admin controller and route trees.

## Impact

- **Frontend**: File relocation in `frontend/src/app` into route groups `(customer)` and `(admin)`. Component restructuring into `components/customer`, `components/admin`, and `components/shared`. All public URLs remain identical.
- **Backend**: API endpoints structured under `customer` and `admin` modules with backwards-compatible router mounts.
- **Shared Types**: Unchanged in `shared/types/index.ts`.
- **Dependencies**: No external dependency changes required.
