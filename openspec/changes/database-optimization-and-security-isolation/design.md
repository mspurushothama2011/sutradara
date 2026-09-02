## Context

The current Sutraಧಾರ backend operates on a single consolidated PostgreSQL database using Prisma ORM. While functionally complete, public e-commerce transactions (customer orders, carts, OTP auth) share tables, memory pools, and connection limits with internal operations (staff punch-in/out, work logs, immutable audit trails). Furthermore, sensitive wholesale procurement prices (`costPrice`) currently sit inside the public `Product` model, creating a data leak vulnerability if serializers fail to explicitly omit the field.

## Goals / Non-Goals

**Goals:**
- Segregate Customer identity from Staff/Admin accounts into distinct `Customer` and `StaffAccount` models.
- Extract confidential wholesale procurement margins into a dedicated 1:1 `ProductProcurement` table.
- Optimize order tracking lookups by merging the separate `TrackingEvent` table into a JSONB `trackingHistory` array on `Order`.
- Formally model the 2-tier Category taxonomy (`Category` and `SubCategory`) with strict enforcement of maximum 3 sub-categories per cluster.
- Update controllers and shared TypeScript interfaces to reflect the segregated architecture.

**Non-Goals:**
- Splitting into physically separate cloud database clusters at this stage (we will use logical domain separation and table isolation within PostgreSQL).
- Changing public customer API routes (endpoints like `/api/v1/customer/orders` maintain stable contracts).

## Decisions

### 1. Separate `Customer` and `StaffAccount` Models
- **Rationale**: Customers authenticate via 6-digit branded Email OTP and have no concept of administrative roles. Staff authenticate via Argon2id passwords, sessions, and granular capability strings. Splitting the tables prevents privilege escalation bugs.
- **Alternatives Considered**: Keeping a unified `User` table with strict role guards. Rejected due to the risk of mass-assignment bugs or auth confusion.

### 2. Isolate `ProductProcurement` from `Product`
- **Rationale**: By moving `costPrice`, weaver guild contact, and procurement references to a separate table, any query on `Product` is physically incapable of leaking wholesale margins to public consumers.
- **Alternatives Considered**: Using Prisma middleware or controller-level delete statements (`delete product.costPrice`). Rejected because human error or unmapped endpoints can accidentally expose it.

### 3. Store Order Tracking Events as JSONB Array
- **Rationale**: A customer looking up order tracking on `/track/[orderId]` needs the entire chronological timeline in one read. Replacing a join on `TrackingEvent` with a `JSONB` array (`Order.trackingHistory`) reduces query latency to < 3ms.
- **Alternatives Considered**: Retaining `TrackingEvent` relational table. Rejected due to unnecessary join overhead for small append-mostly timeline logs.

### 4. Explicit `Category` and `SubCategory` Models with Controller Guard
- **Rationale**: A dedicated `SubCategory` table linked to `Category` makes query filtering explicit (`/catalog?category=banarasi&subCategory=kadhwa`). The controller enforces `COUNT <= 3` on creation.
- **Alternatives Considered**: Self-referencing recursive Category table. Rejected because Sutraಧಾರ's craft hierarchy is strictly 2 levels deep (Cluster $\rightarrow$ Technique).

## Risks / Trade-offs

- **[Risk] Existing order foreign keys break during migration**  
  → *Mitigation*: Migration script maps existing `userId` on `Order` to the new `Customer` table, and preserves existing orders.
- **[Risk] Controller queries failing due to removed `costPrice` on `Product`**  
  → *Mitigation*: Update all admin product queries to join `procurement: true` when `finance:view` permission is present.
