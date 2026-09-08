## ADDED Requirements

### Requirement: Immutable Customer Snapshot on Orders
The system SHALL snapshot the customer's name, email, and contact phone directly on the `Order` record at checkout time to ensure invoice and historical data integrity.

#### Scenario: Order creation with customer snapshot
- **WHEN** customer places an order via `POST /api/v1/orders`
- **THEN** system saves `customerName`, `customerEmail`, and `customerPhone` directly within the created `Order` record in PostgreSQL.

#### Scenario: Customer deactivates account after placing orders
- **WHEN** a customer deactivates or deletes their account after placing orders
- **THEN** existing `Order` records retain their original `customerName`, `customerEmail`, and `customerPhone` snapshots untouched for accounting, fulfillment, and audit compliance.
