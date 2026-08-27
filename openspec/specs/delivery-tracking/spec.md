# Capability: High-Assurance Delivery & Live Tracking

## Overview
End-to-end customer delivery tracking, pre-shipment video verification logging, 4-digit Secure Delivery OTP, and Staff Non-Delivery Report (NDR) recovery desk.

## Requirements

### Requirement 1: Customer Live Tracking Portal
* The public storefront MUST provide a tracking page at `/track/[orderNumber]`.
* Customers MUST be able to view real-time courier milestones (*Confirmed $\rightarrow$ Inspected $\rightarrow$ Dispatched $\rightarrow$ In Transit $\rightarrow$ Out for Delivery $\rightarrow$ Delivered*).
* Customers MUST be able to watch their saree's actual 20-second pre-shipment inspection video directly on the tracking page.

#### Scenario: Customer views tracking for an in-transit order
* **Given** an order exists with order number `"SUT-2026-1049"` and status `"SHIPPED"`
* **When** the customer visits `/track/SUT-2026-1049`
* **Then** the page displays the current milestone, courier name, live AWB tracking link, and the pre-shipment inspection video.

### Requirement 2: Secure Delivery OTP
* When courier status changes to `"OUT_FOR_DELIVERY"`, the backend MUST generate a random 4-digit numeric OTP and send it via SMS/WhatsApp to the customer's phone.
* The courier agent cannot confirm delivery without entering the customer's OTP.

### Requirement 3: Staff NDR (Non-Delivery Report) Recovery Desk
* When a courier webhook fires an NDR event (*"Customer unreachable"*, *"Address missing"*), the order MUST be flagged with `isNdrFlagged: true`.
* Staff in `/portal/tracking` MUST receive an immediate alert with 1-click customer call and courier re-attempt buttons.
