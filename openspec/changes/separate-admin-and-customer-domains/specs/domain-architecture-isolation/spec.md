## ADDED Requirements

### Requirement: Frontend Route Isolation via Route Groups
The frontend application SHALL organize all routes into two primary domain route groups: `src/app/(customer)` for customer-facing views and `src/app/(admin)/portal` for staff management views, preserving all canonical public URLs without route prefix regressions.

#### Scenario: Customer navigates to catalog
- **WHEN** a customer visits `/catalog`
- **THEN** Next.js renders `src/app/(customer)/catalog/page.tsx` wrapped in the customer layout without exposing any internal portal telemetry.

#### Scenario: Staff navigates to orders management
- **WHEN** an authenticated staff member visits `/portal/orders`
- **THEN** Next.js renders `src/app/(admin)/portal/orders/page.tsx` wrapped in the portal administrative layout.

### Requirement: Component Domain Quarantine
All frontend components SHALL be organized under `src/components/customer/` for customer-specific storefront components, `src/components/admin/` for portal and operational components, and `src/components/shared/` for universal UI design system primitives.

#### Scenario: Developer imports design system button
- **WHEN** a component requires standard UI primitives
- **THEN** it imports from `@/components/shared/ui` or `@/components/shared/layout` rather than cross-importing from opposite business domains.

### Requirement: Backend Router and Controller Segregation
The backend SHALL route API requests through separate router files organized in `backend/src/routes/customer/` and `backend/src/routes/admin/`, delegating to controllers in `backend/src/controllers/customer/` and `backend/src/controllers/admin/`.

#### Scenario: Customer requests public catalog
- **WHEN** a client issues `GET /api/v1/customer/catalog` or `GET /api/v1/products`
- **THEN** the request is processed by `customer/catalog.controller.ts` with public pricing and inventory status without exposing wholesale margins.

#### Scenario: Staff updates product inventory
- **WHEN** an authenticated staff member issues `PATCH /api/v1/admin/inventory/:id/stock`
- **THEN** the request is processed by `admin/inventory.controller.ts` under `products:create_edit` RBAC authorization.
