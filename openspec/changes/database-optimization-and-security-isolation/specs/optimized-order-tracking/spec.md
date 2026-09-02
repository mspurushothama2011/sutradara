## ADDED Requirements

### Requirement: JSONB Order Tracking Timeline
The system SHALL record shipping and inspection milestones directly within a `trackingHistory` JSONB array on the `Order` model, eliminating multi-table joins during timeline reads.

#### Scenario: Customer queries order tracking timeline
- **WHEN** a customer requests `/api/v1/customer/orders/:orderNumber/track`
- **THEN** the system fetches the order record in a single primary key lookup
- **THEN** the timeline is rendered directly from `Order.trackingHistory` in < 5ms response latency

#### Scenario: Staff updates logistics milestone
- **WHEN** fulfillment staff updates an order status to `SHIPPED` with courier AWB
- **THEN** the system appends a new milestone object `{ status, location, message, timestamp }` into `Order.trackingHistory`
