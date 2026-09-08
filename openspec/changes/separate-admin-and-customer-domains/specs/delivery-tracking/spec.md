## MODIFIED Requirements

### Requirement: Customer Live Tracking Portal
* The public storefront MUST provide a dedicated read-only customer tracking page at `/track/[orderNumber]` and lookup sanctuary at `/track`.
* Customers MUST be able to view real-time courier milestones (*Confirmed $\rightarrow$ Inspected $\rightarrow$ Dispatched $\rightarrow$ In Transit $\rightarrow$ Out for Delivery $\rightarrow$ Delivered*).
* Customers MUST be able to watch their saree's actual 20-second pre-shipment inspection video directly on the tracking page without exposing administrative dispatch buttons or delivery OTP codes.

#### Scenario: Customer views tracking for an in-transit order
- **WHEN** the customer visits `/track/SUT-2026-1049`
- **THEN** the page displays the current milestone, courier name, live AWB tracking link, and the pre-shipment inspection video with zero administrative controls.

### Requirement: Staff NDR (Non-Delivery Report) Recovery Desk
* When a courier webhook fires an NDR event (*"Customer unreachable"*, *"Address missing"*), the order MUST be flagged with `isNdrFlagged: true`.
* Staff in `/portal/orders/[orderId]/track` MUST receive an immediate alert with 1-click customer call, courier re-attempt tools, and manual milestone telemetry commit options.

#### Scenario: Staff navigates to logistics dispatch desk
- **WHEN** an authenticated staff member opens `/portal/orders/SUT-2026-1049/track`
- **THEN** the admin dispatch console displays 1-click Shiprocket booking, 4-digit drop OTP, NDR toggles, and milestone status editors.
