## ADDED Requirements

### Requirement: Saree Catalog Filtering and Pricing Privacy
The backend API SHALL provide `GET /api/v1/products` supporting filtering by `fabric`, `zariType`, `craftRegion`, `isHeirloom1of1`, `minPrice`, `maxPrice`, and `search`. The `costPrice` field MUST be omitted from responses unless the requester has `finance:view` capability.

#### Scenario: Customer requests product list
- **WHEN** unauthenticated customer calls `GET /api/v1/products`
- **THEN** server returns products list with `sellingPrice` and `comparePrice`
- **AND** `costPrice` is undefined/omitted

#### Scenario: Admin with finance capability requests product list
- **WHEN** user with `finance:view` calls `GET /api/v1/products`
- **THEN** server returns products list including `costPrice` for margin tracking

### Requirement: Floor-Level Quick Stock Adjustment with Audit
The backend API SHALL provide `PATCH /api/v1/products/:id/stock` requiring `inventory:quick_update` capability to rapidly increment, decrement, or toggle in/out of stock. Every adjustment MUST record an entry in `AuditLog`.

#### Scenario: Staff toggles product to out of stock on floor
- **WHEN** staff calls `PATCH /api/v1/products/p1/stock` with `{ stock: 0 }`
- **THEN** product stock is updated to 0 in database
- **AND** an `AuditLog` row is created with action `"STOCK_OVERRIDE"`

### Requirement: Customer Storefront Saree Details
The frontend SHALL render rich product details on `/product/[slug]` displaying Silk Mark verification badge, 1-of-1 Heirloom uniqueness callout, and multi-angle photo gallery.

#### Scenario: Visitor views a 1-of-1 Heirloom saree
- **WHEN** visitor views a product with `isHeirloom1of1: true`
- **THEN** page displays badge *"1-of-1 Exclusive Heirloom — Never Repeated"*
- **AND** displays Silk Mark certificate tag number
