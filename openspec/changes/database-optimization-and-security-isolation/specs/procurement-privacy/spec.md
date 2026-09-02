## ADDED Requirements

### Requirement: Wholesale Procurement Privacy
The system SHALL store wholesale cost prices, master weaver contact information, and purchase invoice references in a dedicated `ProductProcurement` table isolated from public catalog products.

#### Scenario: Public customer queries saree details
- **WHEN** an unauthenticated or customer user queries `/api/v1/products` or `/api/v1/products/:slug`
- **THEN** the system executes `SELECT` exclusively on the `Product` table
- **THEN** the response payload contains zero procurement, weaver contact, or `costPrice` fields

#### Scenario: Finance administrator queries wholesale margin
- **WHEN** an authenticated staff member with capability `finance:view` queries `/api/v1/portal/products/:id/procurement`
- **THEN** the system returns the linked `ProductProcurement` record containing `costPrice` and weaver guild information
