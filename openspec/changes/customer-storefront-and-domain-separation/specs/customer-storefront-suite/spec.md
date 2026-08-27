## ADDED Requirements

### Requirement: Guest Browsing and Cart Storage
The storefront SHALL allow unauthenticated visitors to browse all sarees, search clusters, view Silk Mark certificates, and add items to the cart. Cart state MUST persist in browser storage until checkout.

#### Scenario: Unauthenticated visitor adds saree to bag
- **WHEN** a guest clicks "Add to Bag" on `/product/[slug]`
- **THEN** item is saved in client cart state
- **AND** no login prompt is shown until checkout initiation

### Requirement: Mandatory Customer Authentication at Checkout
The system SHALL require customer authentication before creating an order or accessing `/account`.

#### Scenario: Guest initiates checkout
- **WHEN** a guest clicks "Proceed to Checkout" from cart
- **THEN** user is redirected to `/login` with return URL parameter
- **AND** cart items are retained upon successful login

### Requirement: Multi-Factor Composite Rate Limiting
The system SHALL evaluate rate limiting based on a composite key composed of (Target Email/Account ID + Persistent Device Cookie `_sutradara_did` + Hardware/Browser Signature + IP Subnet) to prevent shared Wi-Fi/NAT false bans.

#### Scenario: Multiple shoppers on same office Wi-Fi
- **WHEN** multiple distinct users on the same public IP browse and log in
- **THEN** each user is tracked by their individual composite key
- **AND** one user's failed attempts do not block other users on the same IP

### Requirement: 1-of-1 Heirloom Pessimistic Checkout Lock
The system SHALL place an atomic 10-minute pessimistic hold lock on single-piece 1-of-1 heirloom sarees upon checkout initiation.

#### Scenario: Simultaneous checkout on 1-of-1 Heirloom
- **WHEN** Buyer A initiates payment for a 1-of-1 saree
- **THEN** saree is locked for 10 minutes to Buyer A
- **AND** if Buyer B attempts checkout simultaneously, system returns 409 Conflict with countdown notice

### Requirement: Physical Barcode/QR Scanner for Floor Intake
The system SHALL support camera-based and hardware USB barcode scanning on `/portal/quick-stock` and `/portal/orders` to rapidly locate items by SKU and update stock or attach QC videos.

#### Scenario: Warehouse staff scans saree tag
- **WHEN** staff scans barcode `BAN-KAT-001` with device camera or USB reader
- **THEN** system instantly opens and focuses the saree quick-stock control card
