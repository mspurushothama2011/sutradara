# Sutradara — Step-by-Step Implementation Roadmap

This roadmap breaks down the complete platform build into sequential, testable milestones.

---

```
┌────────────────────────────────────────────────────────────────────────┐
│ MILESTONE 1: Core Database & Unified Auth Portal Foundation            │
│ 1.1 Complete Prisma schema with User, Product, Order, Attendance, etc. │
│ 1.2 Unified Portal Login with JWT & Granular Capability Guard          │
│ 1.3 Dynamic Portal Sidebar Shell (/portal/*)                           │
├────────────────────────────────────────────────────────────────────────┤
│ MILESTONE 2: Saree Catalog & Quick-Stock Floor Manager                 │
│ 2.1 Product Create/Edit form with Handloom craft & zari specs          │
│ 2.2 Floor-level Quick Stock Adjuster (Mobile-optimized SKU +/- toggle) │
│ 2.3 Storefront Catalog Page & Product Detail Page with Silk Mark badge │
├────────────────────────────────────────────────────────────────────────┤
│ MILESTONE 3: Marketing & Promotional Suite                             │
│ 3.1 Coupons & Promo engine (Percentage, Flat, Min-order validation)    │
│ 3.2 Deal of the Day live countdown timer                               │
│ 3.3 Hero Banners & Festive Collection tag routes (/collections/diwali) │
├────────────────────────────────────────────────────────────────────────┤
│ MILESTONE 4: Staff Operations, HR & Internal Communications            │
│ 4.1 Daily Attendance Clock In/Out & Monthly Salary Formula Calculator  │
│ 4.2 Staff Daily Task/Work Log Submission                               │
│ 4.3 Internal Noticeboard with Read Receipts & Order Team Remarks       │
│ 4.4 Immutable Audit Trail logging                                      │
├────────────────────────────────────────────────────────────────────────┤
│ MILESTONE 5: Order Checkout, Razorpay & Logistics Tracking             │
│ 5.1 Shopping Cart, Address Validation & Checkout Page                  │
│ 5.2 Server-Side Price Calculation & Razorpay HMAC Webhook Verification │
│ 5.3 Live Customer Tracking Page (/track/[orderId]) & Delivery OTP      │
│ 5.4 Staff Pre-Shipment Video Inspection Log & NDR Recovery Desk        │
└────────────────────────────────────────────────────────────────────────┘
```
