# Sutradara — Business Modules & Functional Specification

This document details the functional behavior, screens, and business logic for all 8 modular capabilities in Sutradara.

---

## 👗 Module 1: Product Catalog & 1-of-1 Heirloom Engine

### Features:
1. **Craft Specifications:**
   * Fabric: *Pure Katan Silk, Georgette, Organza, Tussar, Chanderi, Paithani*.
   * Zari Type: *Pure Gold Zari, Tested Zari, Antique Copper, Silver Zari*.
   * Craft Cluster: *Varanasi, Kanchipuram, Chanderi, Yeola*.
   * Weave Style: *Kadhwa, Cutwork, Jamdani, Tanchoi*.
2. **1-of-1 Heirloom vs Standard Stock:**
   * **1-of-1 Badge:** *"Unique Masterpiece — Woven on a single loom. Never repeated."* When purchased, item moves to sold archive.
   * **Multi-Piece Stock:** Shows quantity remaining with low-stock badge when $\le 2$ left.
3. **Silk Mark & Video Preview:**
   * Certificate number & QR code scan on product details page.
   * 30-second 4K video preview showing drape and zari shimmer.
4. **Economics & Margins:**
   * Selling Price, MRP, and **Cost Price** (Cost price is masked unless user has `finance:view`).

---

## ⚡ Module 2: Quick-Stock Warehouse/Floor Mode

### Features:
* Designed for high-speed mobile/tablet use by staff on the shop floor or packing station.
* **Instant SKU Search / Barcode Scan:** Type 3 letters or scan barcode to pull up product.
* **1-Tap Controls:**
  * Toggle: `In Stock` $\leftrightarrow$ `Out of Stock`
  * Buttons: `+1` / `-1` / `Set Exact Count`
  * Rapid Status: `Available`, `Reserved for Customer`, `Sent for Fall/Pico`, `Damaged`.
* Every stock adjustment records an entry into the Audit Log.

---

## 🏷️ Module 3: Marketing, Coupons & Festive Sales

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
   * Automatically generates dedicated landing routes (`/collections/diwali`).

---

## 🚚 Module 4: High-Assurance Delivery & Tracking

### Features:
1. **Pre-Shipment Video Inspection:**
   * Staff records a 20-second packing video showing Silk Mark, Pallu inspection, and tamper seal.
   * Video link is attached to the order and viewable on customer tracking page.
2. **Delivery Security OTP:**
   * 4-digit OTP sent to customer upon "Out for Delivery". Courier must enter OTP to close delivery.
3. **Live Customer Tracking (`/track/[orderNumber]`):**
   * Real-time milestones: *Confirmed $\rightarrow$ Quality Inspected $\rightarrow$ Dispatched $\rightarrow$ In Transit $\rightarrow$ Out for Delivery $\rightarrow$ Delivered*.
4. **NDR (Non-Delivery Report) Recovery Desk:**
   * When courier logs failed delivery, staff gets instant alert to call customer and re-schedule attempt.

---

## ⏱️ Module 5: Staff Attendance & Salary Engine

### Features:
1. **Clock-In / Clock-Out:**
   * Staff punches in/out with timestamp.
   * Status flags: *Present, Late, Half-Day, Approved Leave, Absent*.
2. **Salary Calculation Formula:**
   $$\text{Monthly Payout} = \frac{\text{Base Salary}}{\text{Total Days in Month}} \times (\text{Present Days} + \text{Paid Leaves}) - \text{Deductions}$$
3. **Leave Requests:**
   * Staff submits dates & reason; Admin approves/rejects with 1 click.
4. **Monthly Payslip:**
   * Generates printable summary showing working days, leaves, and net salary.

---

## 📝 Module 6: Daily Work Logs & Productivity Tracker

### Features:
* End-of-day form for staff to submit daily accomplishments:
  * Number of sarees cataloged / photographed.
  * Number of orders packed and inspected.
  * Customer queries resolved.
* Admin overview dashboard shows daily productivity trends per team member.

---

## 💬 Module 7: Team Noticeboard & Order Chat

### Features:
1. **Company Noticeboard:**
   * Admin broadcasts urgent notices (*"Diwali dispatch deadline: all orders before 2 PM must leave today"*).
   * Read receipts show which staff members have viewed the notice.
2. **Internal Order Remarks:**
   * Private notes attached to orders (*"Customer requested gold box packaging and gift note"*).

---

## 📜 Module 8: Audit Trail & Security Log

### Features:
* Automatically tracks all:
  * Price changes (Old vs New price).
  * Stock quantity adjustments.
  * Staff permission edits.
  * Coupon creations and deletions.
