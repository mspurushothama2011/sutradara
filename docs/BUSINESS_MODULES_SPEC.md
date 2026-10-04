# Sutradara — Business Modules & Functional Specification

This document details the functional behavior, screens, and business logic for all core modules in Sutradara.

---

## 👗 Module 1: Product Catalog & 1-of-1 Heirloom Engine

### Features:
1. **Craft Specifications:**
   * Fabric: *Pure Katan Silk, Georgette, Organza, Tussar, Chanderi, Paithani, Baluchari, Uppada Jamdani*.
   * Zari Type: *Pure Gold Zari, Tested Zari, Antique Copper, Silver Zari*.
   * Craft Cluster: *Varanasi, Kanchipuram, Chanderi, Yeola, Sualkuchi, Dharmavaram*.
   * Weave Style: *Kadhwa, Cutwork, Jamdani, Tanchoi, Double Ikat*.
2. **1-of-1 Heirloom vs Standard Stock:**
   * **1-of-1 Badge:** *"Unique Masterpiece — Woven on a single loom. Never repeated."* When purchased, item moves to sold archive.
   * **Multi-Piece Stock:** Shows quantity remaining with low-stock badge when $\le 2$ left.
3. **Silk Mark & Video Preview:**
   * Certificate number & QR code scan on product details page.
   * 30-second 4K video preview showing drape and zari shimmer.
4. **Economics & Margins:**
   * Selling Price, MRP, and **Cost Price** (Cost price is masked unless user has `finance:view`).

---

## 🛍️ Module 2: Master Checkout & Multi-Recipient Address Book

### Features:
1. **Unified Acquisition Workflow (`/checkout`):**
   * Supports both direct "Buy Now" and multi-item Shopping Bag acquisitions.
   * Live inventory verification with race condition alert banner.
2. **Patron Authentication, Registration & Verification:**
   * **Customer Registration Guard (`/register`):** Validates email address and 10-digit mobile number uniqueness before dispatching OTP. Returns clear collision errors (`EMAIL_ALREADY_REGISTERED` or `PHONE_ALREADY_REGISTERED`) with 1-click links to sign in.
   * **Passwordless 6-Digit Email OTP:** 10-minute TTL code delivered via Gmail SMTP and secured by **Cloudflare Turnstile CAPTCHA**.
   * **Seamless Google Identity Services (GIS):** One-tap OAuth sign-in and account linking.
3. **Intelligent Nationwide Address Autocomplete:**
   * 300+ Indian cities with alias and historical name normalization (e.g., typing `Bangalore` resolves to canonical `Bengaluru`).
   * Automatic State field resolution when a city is selected.
   * 6-Digit Indian PIN code automatic district and state lookup.
4. **Multi-Recipient Address Book (`/account`):**
   * Save multiple delivery destinations with custom labels (*"Home"*, *"Mother's Place"*, *"Wedding Venue"*).
   * Separate Recipient Name and Delivery Phone Number for courier 4-digit drop OTP.

---

## ⚡ Module 3: Quick-Stock Warehouse & Inventory Mode

### Features:
* Designed for high-speed mobile/tablet use by staff on the shop floor or packing station.
* **Instant SKU Search / Barcode Scan:** Type 3 letters or scan barcode to pull up product.
* **1-Tap Controls:**
  * Toggle: `In Stock` $\leftrightarrow$ `Out of Stock`
  * Buttons: `+1` / `-1` / `Set Exact Count`
  * Rapid Status: `Available`, `Reserved for Customer`, `Sent for Fall/Pico`, `Damaged`.
* Every stock adjustment records an entry into the Audit Log.

---

## 🏷️ Module 4: Marketing, Coupons & Festive Campaigns

### Features:
1. **Coupons & Discount Codes:**
   * Discount Modes: Percentage (e.g. `10% off`) or Flat (`₹1,500 off`).
   * Rules: Min Order Value, Max Discount Cap, Expiry Date, Total Usage Limit, Once-per-customer limit.
   * Collection Lock: Apply only to specific categories (e.g. *Bridal Kanjivaram*).
2. **Deal of the Day / Flash Sale:**
   * Scheduled start and end timestamp.
   * Front-end displays an animated countdown ticker: `Ends in 04h:28m:12s`.
3. **Hero & Top Promotional Banners:**
   * Manage top notification bar text, hero slide images, and call-to-action links.
4. **Festive Occasion Collections:**
   * Tag sarees with dynamic themes (*Diwali, Royal Wedding, Festive Splendor*).
   * Dedicated landing routes and catalog filters.

---

## 🚚 Module 5: High-Assurance Fulfillment & Live Tracking

### Features:
1. **Admin Orders & Dispatch Queue (`/portal/orders`):**
   * Instant status filtering (`All`, `Paid / Pending`, `QC Inspected`, `Shipped`, `In Transit`, `Out for Delivery`, `Delivered`, `NDR Exceptions`).
   * Quick dispatch update modal to transition statuses, assign courier partners, input AWB tracking numbers, and add location notes.
2. **Dedicated Admin Dispatch Desk (`/portal/orders/[orderId]/track`):**
   * Granular checkpoint timeline logging with custom messages.
   * Pre-shipment video verification evidence attachment.
   * 1-Click NDR (Non-Delivery Report) exception flagging.
3. **Live Customer Satellite Tracking (`/track/[orderNumber]`):**
   * Real-time milestone tracker viewable by patrons without requiring login.
   * Pre-shipment QC video proofs assuring authentic handloom quality.

---

## ⏱️ Module 6: Staff Attendance & Salary Engine

### Features:
1. **Clock-In / Clock-Out (`/portal/staff`):**
   * Staff punches in/out with timestamp.
   * Status flags: *Present, Late, Half-Day, Approved Leave, Absent*.
2. **Salary Calculation Formula:**
   $$\text{Monthly Payout} = \frac{\text{Base Salary}}{\text{Total Days in Month}} \times (\text{Present Days} + \text{Paid Leaves}) - \text{Deductions}$$
3. **Leave Requests:**
   * Staff submits dates & reason; Admin approves/rejects with 1 click.
4. **Monthly Payslip:**
   * Generates printable summary showing working days, leaves, and net salary.

---

## 📝 Module 7: Daily Work Logs & Productivity Tracker

### Features:
* End-of-day form for staff to submit daily accomplishments:
  * Number of sarees cataloged / photographed.
  * Number of orders packed and inspected.
  * Customer queries resolved.
* Admin overview dashboard shows daily productivity trends per team member.

---

## 📜 Module 8: Audit Trail & Security Log

### Features:
* Automatically tracks all:
  * Price changes (Old vs New price).
  * Stock quantity adjustments.
  * Staff permission edits.
  * Order milestone dispatches.
  * Coupon creations and deletions.

---

## 📊 Module 9: Real-Time Executive Dashboard & Operational Telemetry

### Features:
1. **Live Backend Aggregation (`GET /api/v1/admin/dashboard/stats`):**
   * **Orders & Logistics Telemetry:** Real-time counts for Pending Dispatch, Awaiting QC Inspection, Processing / Packed, Courier Transit, Delivered, and Cancelled.
   * **Inventory & Stock Telemetry:** Active Sarees in stock, 1-of-1 Heirlooms, Low-Stock alerts ($\le 1$), and total inventory physical units across all catalog SKUs.
   * **Financial Analytics:** Today's calculated net revenue from authentic order checkouts, daily growth % comparison vs yesterday, and cumulative lifetime earnings.
   * **Operations & Shift Monitoring:** Active team members, today's punch-in count, and personal active shift status.
2. **Frontend Auto-Refresh & Live Queue (`/portal/dashboard`):**
   * 15-second background polling cycle + manual on-demand "Live Refresh" trigger.
   * **Live Fulfillment & Dispatch Queue:** Real-time table of incoming customer checkouts with 1-click links to the Dispatch Desk.
   * **Recent Operational Audit Feed:** Live preview of system actions, category updates, and price adjustments.
