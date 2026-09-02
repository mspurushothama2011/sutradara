## Why

Sutraಧಾರ currently houses public customer accounts, staff/admin credentials, public catalog items, wholesale procurement costs, and internal HR operations in a single mixed schema. This creates security exposure (risk of privilege escalation and leakage of artisan wholesale margins), query performance overhead (multi-table joins on order tracking), and resource contention between customer checkout and daily staff attendance logging.

## What Changes

- **Identity Segregation (SPLIT)**: Separate `User` into `Customer` (for patrons using passwordless Email OTP) and `StaffAccount` (for staff/admin with Argon2id passwords and granular RBAC), eliminating privilege escalation vectors.
- **Wholesale Margin Privacy (SPLIT)**: Extract `costPrice`, weaver guild contacts, and procurement references out of `Product` into a dedicated `ProductProcurement` table accessible exclusively to authenticated users with `finance:view`.
- **Order Tracking Query Optimization (MERGE)**: Merge `TrackingEvent` into `Order.trackingHistory` as an indexed `JSONB` array, enabling instant 1-query order tracking timeline lookups without multi-table relational joins.
- **Category Hierarchy Normalization**: Formally enforce the 2-tier Category $\rightarrow$ SubCategory hierarchy with a strict limit of **max 3 sub-categories** per category.
- **Logical Schema Segregation**: Organize tables into PostgreSQL logical schemas (`storefront` and `ops`) to isolate public customer traffic from internal operations.

## Capabilities

### New Capabilities
- `identity-segregation`: Dedicated `Customer` and `StaffAccount` models with isolated authentication lifecycles and token payload separation.
- `procurement-privacy`: Extraction of confidential wholesale purchase data into `ProductProcurement` with role-restricted access controls.
- `optimized-order-tracking`: JSONB-based milestone tracking array on `Order` for fast, join-free delivery timelines.
- `strict-category-hierarchy`: Enforced 1:N relationship between `Category` and `SubCategory` with maximum 3 sub-categories per cluster.

### Modified Capabilities
- `customer-storefront-suite`: Update backend order placement and profile queries to interact with the new `Customer` model and JSONB tracking events.

## Impact

- **Database**: Updated `schema.prisma` with `Customer`, `StaffAccount`, `ProductProcurement`, `Category`, `SubCategory`, and revised `Order`.
- **Backend Controllers**:
  - Customer auth and orders controllers migrated from `User` to `Customer`.
  - Portal auth, staff, attendance, and audit controllers migrated to `StaffAccount`.
  - Product controllers decoupled from `costPrice`, delegating procurement queries to a protected finance service.
- **Shared Types**: Updated `shared/types/index.ts` to reflect the new separated domain models.
