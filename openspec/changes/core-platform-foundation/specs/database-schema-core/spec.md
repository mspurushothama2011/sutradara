## ADDED Requirements

### Requirement: Relational PostgreSQL Schema via Prisma
The database schema SHALL define all core entities: `User`, `Product`, `Order`, `OrderItem`, `Coupon`, `Attendance`, `WorkLog`, `Announcement`, and `AuditLog` with strict foreign key constraints and indexed lookup fields (email, sku, orderNumber).

#### Scenario: Database migration execution
- **WHEN** developer runs `npx prisma migrate dev`
- **THEN** PostgreSQL tables are created matching Prisma schema definitions with zero compilation errors

### Requirement: Immutable Audit Logging
The database SHALL store all sensitive resource mutations in the `AuditLog` table capturing `userId`, `action`, `entityType`, `entityId`, `oldValues`, and `newValues`.

#### Scenario: Price modification audit record creation
- **WHEN** an authenticated user modifies a product price
- **THEN** an `AuditLog` row is created with before and after JSON values
