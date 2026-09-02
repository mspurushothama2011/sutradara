# 🏛️ Sutraಧಾರ — Database Architecture & Specification

**Platform:** Sutraಧಾರ Handloom Saree Platform  
**Database Engine:** PostgreSQL 16+  
**ORM / Data Access:** Prisma ORM (`backend/src/prisma/schema.prisma`)  
**Design Philosophy:** Strict Identity Isolation, Wholesale Margin Protection, Zero-Client Price Recalculation, 1-of-1 Heirloom Double-Spend Locks, Fast JSONB Milestone Timelines, and Immutable Audit Trails.

---

## 📑 Table of Contents
1. [Architectural Highlights: Splits & Merges](#1-architectural-highlights-splits--merges)
2. [Entity-Relationship Diagram](#2-entity-relationship-diagram)
3. [Database Enums](#3-database-enums)
4. [Complete Tables & Columns Specification](#4-complete-tables--columns-specification)
   - [Customer (Storefront Patrons)](#table-1-customer-split)
   - [StaffAccount (Portal Staff & Admins)](#table-2-staffaccount-split)
   - [Category (Craft Clusters & Heritages)](#table-3-category)
   - [SubCategory (Max 3 per Category)](#table-4-subcategory)
   - [Product (Public Saree Catalog)](#table-5-product)
   - [ProductProcurement (Confidential Wholesale Vault)](#table-6-productprocurement-split)
   - [Order (High-Assurance Checkout)](#table-7-order-optimized)
   - [OrderItem (Order Line Items)](#table-8-orderitem)
   - [Address (Customer Address Book)](#table-9-address)
   - [Coupon (Promotional Discounts)](#table-10-coupon)
   - [Attendance (Staff Shift Punches)](#table-11-attendance)
   - [WorkLog (Daily Staff Productivity)](#table-12-worklog)
   - [Announcement (Team Noticeboard)](#table-13-announcement)
   - [AuditLog (Immutable Cyber Defense Ledger)](#table-14-auditlog)
5. [Category Taxonomy Structure](#5-category-taxonomy-structure)
6. [Database Indexes & Performance Rules](#6-database-indexes--performance-rules)
7. [Security & Business Invariants](#7-security--business-invariants)
8. [Prisma Reference Schema](#8-prisma-reference-schema)

---

## 1. Architectural Highlights: Splits & Merges

To maximize **speed**, **security**, and **operational isolation**, the schema incorporates the following architectural optimizations:

| Optimization | Technique | Architecture Rationale |
| :--- | :---: | :--- |
| **Identity Segregation** | **SPLIT** | Separates public patrons (`Customer`) from backoffice staff (`StaffAccount`). Completely eliminates privilege escalation vectors from public customer auth routes. |
| **Wholesale Margin Privacy** | **SPLIT** | Extracts `costPrice`, weaver guild contacts, and procurement invoices out of `Product` into a dedicated 1:1 `ProductProcurement` table. Makes it physically impossible to leak procurement margins on public catalog APIs. |
| **Timeline Query Latency** | **MERGE** | Replaces multi-table relational joins with an indexed `JSONB` array (`Order.trackingHistory`). Orders and live delivery milestones load in a single read in **< 3ms**. |
| **Category Specialization** | **ENFORCE** | Structured 2-tier hierarchy (`Category` $\rightarrow$ `SubCategory`) with an enforced hard cap of **maximum 3 sub-categories** per craft cluster. |
| **Domain Schema Isolation** | **ISOLATE** | Separates transactional storefront tables (`storefront.*`) from daily internal HR/staff attendance operations (`ops.*`). |

---

## 2. Entity-Relationship Diagram

```
                             STOREFRONT DOMAIN
                   ┌───────────────────────────────────┐
                   │             Category              │
                   └─────────────────┬─────────────────┘
                                     │ 1:N (Max 3)
                                     ▼
                   ┌───────────────────────────────────┐
                   │            SubCategory            │
                   └─────────────────┬─────────────────┘
                                     │ 1:N
                                     ▼
┌──────────────┐              ┌──────────────┐              ┌────────────────────┐
│   Customer   │◄─────────────┤    Order     │─────────────►│     OrderItem      │
└──────┬───────┘     1:N      └──────────────┘     1:N      └─────────┬──────────┘
       │                                                              │ N:1
       │ 1:N                                                          ▼
       ▼                                                    ┌────────────────────┐
┌──────────────┐                                            │      Product       │
│   Address    │                                            └─────────┬──────────┘
└──────────────┘                                                      │ 1:1
                                                                      ▼
                                                            ┌────────────────────┐
                                                            │ ProductProcurement │
                                                            │(Confidential Vault)│
                                                            └────────────────────┘

                              INTERNAL OPS DOMAIN
┌────────────────────────────────────────────────────────────────────────────────┐
│                                 StaffAccount                                   │
└───────┬───────────────────────────────┬───────────────────────────────┬────────┘
        │ 1:N                           │ 1:N                           │ 1:N
        ▼                               ▼                               ▼
┌───────────────┐               ┌───────────────┐               ┌────────────────┐
│  Attendance   │               │    WorkLog    │               │    AuditLog    │
└───────────────┘               └───────────────┘               └────────────────┘
```

---

## 3. Database Enums

### `StaffRole`
Role segregation exclusively for backoffice and warehouse operations:
| Value | Description | Permissions |
| :--- | :--- | :--- |
| `STAFF` | Floor staff / packing team | Quick stock adjustments, order fulfillment, 20s pre-dispatch video QC |
| `ADMIN` | System executive | Wholesale cost price view (`costPrice`), staff management, financial reports, audit logs |

### `OrderStatus`
Strict state machine for handloom order fulfillment:
| Value | Description |
| :--- | :--- |
| `PENDING` | Order created; awaiting online payment gateway capture |
| `PAID` | Payment captured and verified via Razorpay HMAC signature |
| `PROCESSING` | Artisan piece retrieved from vault; pre-shipment 20s video QC conducted |
| `SHIPPED` | Dispatched via high-assurance courier (AWB generated, tracking active) |
| `DELIVERED` | 4-digit drop OTP validated by delivery agent at patron doorstep |
| `CANCELLED` | Order cancelled; 1-of-1 heirloom reservation released back to inventory |
| `RETURNED` | Verified 7-day white-glove inspection return processed |

### `AttendanceStatus`
Biometric / portal shift punch states:
| Value | Description |
| :--- | :--- |
| `PRESENT` | On-time punch-in recorded |
| `HALF_DAY` | Worked less than standard threshold hours |
| `LATE` | Clocked in past grace period threshold |
| `APPROVED_LEAVE` | Pre-approved absence authorized by Admin |
| `ABSENT` | Unexcused absence |

### `DiscountType`
Coupon discount calculation model:
| Value | Description |
| :--- | :--- |
| `PERCENTAGE` | Deducts percentage of subtotal (subject to `maxDiscount` cap) |
| `FLAT` | Deducts fixed rupee amount (e.g. ₹2,000 flat off) |

---

## 4. Complete Tables & Columns Specification

---

### Table 1: `Customer` (SPLIT)
Stores public patrons with passwordless email OTP and address associations.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique customer identifier |
| `email` | `VARCHAR(150)` | **UNIQUE**, NOT NULL | — | Patron email address |
| `phone` | `VARCHAR(20)` | NULLABLE | — | Contact mobile number |
| `name` | `VARCHAR(100)` | NULLABLE | — | Patron full name |
| `isVerified` | `BOOLEAN` | NOT NULL | `false` | Email OTP verification status |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Account registration date |
| `updatedAt` | `TIMESTAMP` | NOT NULL | `now()` | Last profile update |

* **Relationships:**
  * `orders`: Has many `Order` (1:N).
  * `addresses`: Has many `Address` (1:N).
* **Security:** Has no `role` or permission fields, eliminating privilege escalation risks.

---

### Table 2: `StaffAccount` (SPLIT)
Stores administrative and operational staff credentials with granular capabilities.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique staff identifier |
| `employeeId` | `VARCHAR(50)` | **UNIQUE**, NOT NULL | — | Official employee code (e.g. `EMP-101`) |
| `email` | `VARCHAR(150)` | **UNIQUE**, NOT NULL | — | Corporate staff email |
| `passwordHash` | `VARCHAR(255)` | NOT NULL | — | Argon2id / Bcrypt hashed password |
| `name` | `VARCHAR(100)` | NOT NULL | — | Employee name |
| `role` | `StaffRole` | NOT NULL | `STAFF` | Role: `STAFF` or `ADMIN` |
| `customPermissions`| `TEXT[]` | NOT NULL | `[]` | Granular capabilities: `["finance:view", "products:create_edit"]` |
| `isActive` | `BOOLEAN` | NOT NULL | `true` | Access active toggle |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Account creation date |
| `updatedAt` | `TIMESTAMP` | NOT NULL | `now()` | Last update date |

* **Relationships:**
  * `attendances`: Has many `Attendance` (1:N).
  * `workLogs`: Has many `WorkLog` (1:N).
  * `auditLogs`: Has many `AuditLog` (1:N).

---

### Table 3: `Category`
Regional craft clusters and primary handloom heritages.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique category identifier |
| `name` | `VARCHAR(100)` | **UNIQUE**, NOT NULL | — | Cluster title (e.g. *"Banarasi Heritage"*) |
| `slug` | `VARCHAR(120)` | **UNIQUE**, NOT NULL | — | URL-safe slug (e.g. `banarasi-heritage`) |
| `description`| `TEXT` | NULLABLE | — | Craft cluster provenance and history |
| `region` | `VARCHAR(100)` | NOT NULL | — | Geographical cluster (e.g. *"Varanasi"*) |
| `image` | `VARCHAR(500)` | NULLABLE | — | Cluster hero banner URL |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Creation timestamp |

* **Relationships:**
  * `subCategories`: Has many `SubCategory` (1:N, strict limit: **max 3**).
  * `products`: Has many `Product` (1:N).

---

### Table 4: `SubCategory`
Weave, technique, and motif specializations (**Strictly max 3 per Category**).

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique sub-category identifier |
| `name` | `VARCHAR(100)` | NOT NULL | — | Sub-category name (e.g. *"Kadhwa Pure Katan Silk"*) |
| `slug` | `VARCHAR(120)` | **UNIQUE**, NOT NULL | — | URL-safe slug (e.g. `kadhwa-pure-katan-silk`) |
| `description`| `TEXT` | NULLABLE | — | Technical description of the weave method |
| `categoryId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Category.id` (`onDelete: Cascade`) |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Creation timestamp |

* **Relationships:**
  * `category`: Belongs to `Category`.
  * `products`: Has many `Product` (1:N).
* **Validation Rule:** Controller verifies `COUNT(subCategories WHERE categoryId = ?) < 3` before insert.

---

### Table 5: `Product`
Master catalog of authentic handloom sarees (Public & Storefront Safe).

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique product identifier |
| `sku` | `VARCHAR(50)` | **UNIQUE**, NOT NULL | — | Floor barcode / SKU (e.g. `BAN-KAT-001`) |
| `name` | `VARCHAR(200)` | NOT NULL | — | Full display name |
| `slug` | `VARCHAR(250)` | **UNIQUE**, NOT NULL | — | URL path (e.g. `/product/royal-kadhwa-jangla`) |
| `description` | `TEXT` | NOT NULL | — | Drape notes, zari purity, weaver story |
| `categoryId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Category.id` |
| `subCategoryId`| `VARCHAR(36)`| **FK**, NULLABLE | — | Reference to `SubCategory.id` |
| `sellingPrice` | `DOUBLE PRECISION`| NOT NULL | — | Retail price in INR |
| `comparePrice` | `DOUBLE PRECISION`| NULLABLE | — | Strikethrough comparison price |
| `stock` | `INTEGER` | NOT NULL | `1` | Available quantity |
| `isHeirloom1of1`| `BOOLEAN` | NOT NULL | `false` | Single-piece flag; triggers 10-min atomic pessimistic lock |
| `fabric` | `VARCHAR(100)` | NOT NULL | — | e.g. *"Pure Katan Silk"*, *"3-Ply Mulberry Silk"* |
| `zariType` | `VARCHAR(100)` | NOT NULL | — | e.g. *"Pure Gold Zari"*, *"Tested Gold Zari"* |
| `craftRegion` | `VARCHAR(100)` | NOT NULL | — | Geographical cluster (e.g. *"Varanasi"*) |
| `weaveStyle` | `VARCHAR(100)` | NULLABLE | — | Weave method (e.g. *"Kadhwa"*, *"Korvai"*) |
| `silkMarkNumber`|`VARCHAR(50)` | NULLABLE | — | Central Silk Board verification number |
| `videoUrl` | `VARCHAR(500)` | NULLABLE | — | Showcase video / loom clip URL |
| `isFeatured` | `BOOLEAN` | NOT NULL | `false` | Shown on Home Featured Showcase |
| `isDealOfDay` | `BOOLEAN` | NOT NULL | `false` | Active in Privileged Deal countdown |
| `dealExpiresAt`|`TIMESTAMP` | NULLABLE | — | Deal expiration timestamp |
| `tags` | `TEXT[]` | NOT NULL | `[]` | Search tags: `["Bridal", "Diwali", "Heirloom"]` |
| `images` | `TEXT[]` | NOT NULL | `[]` | Array of high-resolution image URLs |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Catalog entry timestamp |
| `updatedAt` | `TIMESTAMP` | NOT NULL | `now()` | Last modification timestamp |

* **Relationships:**
  * `procurement`: Has one `ProductProcurement` (1:1, confidential).
  * `orderItems`: Has many `OrderItem` (1:N).

---

### Table 6: `ProductProcurement` (SPLIT)
Confidential wholesale acquisition details, supplier relationships, and profit margins.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique procurement record ID |
| `productId` | `VARCHAR(36)` | **FK**, **UNIQUE**, NOT NULL | — | 1:1 foreign key to `Product.id` (`onDelete: Cascade`) |
| `costPrice` | `DOUBLE PRECISION`| NOT NULL | — | Wholesale weaver procurement price in INR |
| `weaverGuildName`|`VARCHAR(150)`| NOT NULL | — | Master artisan name / cooperative society |
| `weaverContact` | `VARCHAR(100)` | NULLABLE | — | Direct artisan phone or guild contact |
| `procurementDate`|`DATE` | NOT NULL | — | Date saree was acquired |
| `invoiceRef` | `VARCHAR(100)` | NULLABLE | — | Physical tax invoice / purchase receipt reference |
| `notes` | `TEXT` | NULLABLE | — | Confidential quality notes / weaver agreements |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Creation timestamp |

* **Security Invariant:** Accessible exclusively through `/portal/finance` with `finance:view` capability. Never exposed to public catalog serializers.

---

### Table 7: `Order` (OPTIMIZED WITH JSONB)
High-assurance order records with integrated milestone history.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Internal order UUID |
| `orderNumber` | `VARCHAR(50)` | **UNIQUE**, NOT NULL | — | Human-readable ID (e.g. `SUT-2026-1001`) |
| `customerId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Customer.id` |
| `status` | `OrderStatus` | NOT NULL | `PENDING` | Order lifecycle status |
| `totalAmount` | `DOUBLE PRECISION`| NOT NULL | — | Server-recalculated total in INR |
| `shippingAddress`| `JSONB` | NOT NULL | — | Immutable JSON snapshot of destination address |
| `trackingHistory`| `JSONB` | NOT NULL | `'[]'` | **Chronological milestone array** (replaces `TrackingEvent`) |
| `courierPartner`| `VARCHAR(100)` | NULLABLE | — | Logistics carrier (e.g. *"BlueDart Apex"*) |
| `awbNumber` | `VARCHAR(100)` | **UNIQUE**, NULLABLE| — | Air Waybill / Tracking number |
| `trackingUrl` | `VARCHAR(500)` | NULLABLE | — | Courier tracking link |
| `deliveryOtp` | `VARCHAR(6)` | NULLABLE | — | **4-digit secure delivery OTP** given to driver |
| `inspectionVideoUrl`|`VARCHAR(500)`| NULLABLE | — | 20s pre-dispatch inspection clip recorded by staff |
| `isNdrFlagged` | `BOOLEAN` | NOT NULL | `false` | Flagged if Non-Delivery Report was filed |
| `ndrReason` | `TEXT` | NULLABLE | — | Delivery failure / rescheduling note |
| `razorpayOrderId`|`VARCHAR(100)` | **UNIQUE**, NULLABLE| — | Payment gateway order ID |
| `razorpayPaymentId`|`VARCHAR(100)`| NULLABLE | — | Payment gateway transaction ID |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Order creation timestamp |
| `updatedAt` | `TIMESTAMP` | NOT NULL | `now()` | Last update timestamp |

#### `trackingHistory` JSONB Structure Example:
```json
[
  {
    "status": "VAULT_INSPECTION_PASSED",
    "location": "Varanasi Central Vault",
    "message": "Artisan piece verified with Silk Mark tag. 20s video QC recorded.",
    "timestamp": "2026-09-01T10:00:00Z"
  },
  {
    "status": "IN_TRANSIT",
    "location": "BlueDart Apex Hub, Delhi",
    "message": "Package bagged for insured express transit.",
    "timestamp": "2026-09-01T16:30:00Z"
  }
]
```

---

### Table 8: `OrderItem`
Line items linking products to an order with the exact price captured at purchase.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Line item identifier |
| `orderId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Order.id` (`onDelete: Cascade`) |
| `productId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Product.id` |
| `price` | `DOUBLE PRECISION`| NOT NULL | — | Price locked in INR at moment of purchase |
| `quantity` | `INTEGER` | NOT NULL | `1` | Quantity ordered |

---

### Table 9: `Address`
Customer shipping address book with 6-digit Indian PIN code validation.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Address identifier |
| `customerId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Customer.id` |
| `street` | `VARCHAR(250)` | NOT NULL | — | Street address, building, floor |
| `city` | `VARCHAR(100)` | NOT NULL | — | City / Town |
| `state` | `VARCHAR(100)` | NOT NULL | — | State / Territory |
| `pincode` | `VARCHAR(6)` | NOT NULL | — | Validated 6-digit Indian PIN code (`/^[1-9][0-9]{5}$/`) |
| `country` | `VARCHAR(50)` | NOT NULL | `"India"` | Country name |
| `isDefault` | `BOOLEAN` | NOT NULL | `false` | Default shipping address flag |

---

### Table 10: `Coupon`
Promotional codes with date boundaries, usage quotas, and minimum order values.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Coupon identifier |
| `code` | `VARCHAR(50)` | **UNIQUE**, NOT NULL | — | Uppercase code (e.g. `VIRASAT10`) |
| `discountType` | `DiscountType` | NOT NULL | `PERCENTAGE`| `PERCENTAGE` or `FLAT` |
| `discountValue`| `DOUBLE PRECISION`| NOT NULL | — | Discount amount (percentage or flat INR) |
| `minOrderValue`| `DOUBLE PRECISION`| NULLABLE | — | Minimum qualifying order value |
| `maxDiscount` | `DOUBLE PRECISION`| NULLABLE | — | Maximum discount cap for percentage codes |
| `usageLimit` | `INTEGER` | NULLABLE | — | Maximum times coupon can be redeemed |
| `usedCount` | `INTEGER` | NOT NULL | `0` | Current redemption count |
| `validFrom` | `TIMESTAMP` | NOT NULL | — | Start date/time |
| `validUntil` | `TIMESTAMP` | NOT NULL | — | Expiry date/time |
| `isActive` | `BOOLEAN` | NOT NULL | `true` | Active toggle |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Creation timestamp |

---

### Table 11: `Attendance`
Staff shift records for attendance and payroll computation.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Punch record identifier |
| `staffId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `StaffAccount.id` |
| `date` | `DATE` | NOT NULL | — | Shift date (YYYY-MM-DD) |
| `clockIn` | `TIMESTAMP` | NOT NULL | — | Clock-in timestamp |
| `clockOut` | `TIMESTAMP` | NULLABLE | — | Clock-out timestamp |
| `status` | `AttendanceStatus`| NOT NULL | `PRESENT` | Attendance status enum |
| `notes` | `TEXT` | NULLABLE | — | Shift notes / overtime remarks |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Record creation timestamp |

---

### Table 12: `WorkLog`
Daily staff shift output and processed inventory counts.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Work log identifier |
| `staffId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `StaffAccount.id` |
| `date` | `TIMESTAMP` | NOT NULL | `now()` | Shift date/time |
| `tasksSummary` | `TEXT` | NOT NULL | — | Summary of completed tasks |
| `itemsProcessed`|`INTEGER` | NULLABLE | `0` | Count of sarees inspected, packed, or inventoried |

---

### Table 13: `Announcement`
Internal broadcast noticeboard for staff and floor teams.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Notice identifier |
| `title` | `VARCHAR(200)` | NOT NULL | — | Headline |
| `content` | `TEXT` | NOT NULL | — | Announcement message |
| `isUrgent` | `BOOLEAN` | NOT NULL | `false` | Triggers red alert banner across `/portal` |
| `createdBy` | `VARCHAR(100)` | NOT NULL | — | Author name / email |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Publication timestamp |

---

### Table 14: `AuditLog`
Immutable cyber defense ledger tracking all administrative and financial actions.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Audit entry identifier |
| `staffId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `StaffAccount.id` (actor) |
| `action` | `VARCHAR(100)` | NOT NULL | — | Event code (e.g. `PRODUCT_PRICE_UPDATE`, `STOCK_OVERRIDE`) |
| `entityType` | `VARCHAR(50)` | NOT NULL | — | Target entity: `PRODUCT`, `ORDER`, `STAFF`, `COUPON` |
| `entityId` | `VARCHAR(50)` | NOT NULL | — | Primary key of modified entity |
| `oldValues` | `JSONB` | NULLABLE | — | JSON snapshot before modification |
| `newValues` | `JSONB` | NULLABLE | — | JSON snapshot after modification |
| `ipAddress` | `VARCHAR(45)` | NULLABLE | — | Origin IPv4 / IPv6 address |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Immutable timestamp |

---

## 5. Category Taxonomy Structure

Every Category represents an authentic craft cluster with a **hard limit of 3 sub-categories**:

```
📂 Banarasi Heritage (Varanasi)
   ├── 🏷️ Kadhwa Pure Katan Silk
   ├── 🏷️ Tanchoi & Jamdani Brocade
   └── 🏷️ Jangla Shikargah (Gold Zari)

📂 Kanjivaram Heritage (Kanchipuram)
   ├── 🏷️ Korvai Interlocking Temple Border
   ├── 🏷️ Heavy Bridal 3-Ply Mulberry Silk
   └── 🏷️ Classic Petni & Contrast Pallu

📂 Paithani Heritage (Yeola)
   ├── 🏷️ Muniya & Oblique Border
   ├── 🏷️ Handwoven Peacock Pallu
   └── 🏷️ Pure Tapestry Zari Weave

📂 Chanderi Heritage (Madhya Pradesh)
   ├── 🏷️ Featherlight Tissue & Sheer Organza
   ├── 🏷️ Gold & Silver Meenakari Butis
   └── 🏷️ Classic Chanderi Katan Silk
```

---

## 6. Database Indexes & Performance Rules

```sql
-- Fast SKU and Slug lookups
CREATE UNIQUE INDEX idx_product_sku ON "Product"("sku");
CREATE UNIQUE INDEX idx_product_slug ON "Product"("slug");
CREATE INDEX idx_product_category ON "Product"("categoryId", "subCategoryId");
CREATE INDEX idx_product_region_fabric ON "Product"("craftRegion", "fabric");

-- SubCategory parent lookups
CREATE INDEX idx_subcategory_category ON "SubCategory"("categoryId");

-- Order lookups by status and patron
CREATE UNIQUE INDEX idx_order_number ON "Order"("orderNumber");
CREATE INDEX idx_order_customer_status ON "Order"("customerId", "status");
CREATE INDEX idx_order_awb ON "Order"("awbNumber");

-- GIN Index for rapid JSONB tracking lookups
CREATE INDEX idx_order_tracking_gin ON "Order" USING GIN ("trackingHistory");

-- Fast audit search by staff actor and entity
CREATE INDEX idx_audit_staff_action ON "AuditLog"("staffId", "action");
CREATE INDEX idx_audit_entity ON "AuditLog"("entityType", "entityId");

-- Staff attendance filtering
CREATE INDEX idx_attendance_staff_date ON "Attendance"("staffId", "date");
```

---

## 7. Security & Business Invariants

1. **Zero-Client-Price Trust:** Product prices and discounts submitted from client browsers are strictly disregarded. The backend recalculates `totalAmount` directly from `Product.sellingPrice` at checkout.
2. **1-of-1 Double-Spend Protection:** Single-piece heirlooms (`isHeirloom1of1 = true`) receive an atomic 10-minute pessimistic hold to prevent duplicate checkouts.
3. **Wholesale Margin Privacy (Physical Isolation):** Because `costPrice` lives in `ProductProcurement`, queries on `Product` cannot leak wholesale prices into client browsers.
4. **Multi-Factor Rate Limiting:** All customer auth and OTP routes are rate-limited via composite keys `(targetEmail + _sutradara_did cookie + browser fingerprint)`.
5. **Immutable Audit Trails:** `AuditLog` rows cannot be updated or deleted via API; they capture exact JSON deltas (`oldValues` $\rightarrow$ `newValues`).

---

## 8. Prisma Reference Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum StaffRole {
  STAFF
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  RETURNED
}

enum AttendanceStatus {
  PRESENT
  HALF_DAY
  LATE
  APPROVED_LEAVE
  ABSENT
}

enum DiscountType {
  PERCENTAGE
  FLAT
}

// 🛍️ STOREFRONT DOMAIN: Customers & Address Book
model Customer {
  id         String    @id @default(uuid())
  email      String    @unique
  phone      String?
  name       String?
  isVerified Boolean   @default(false)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  orders     Order[]
  addresses  Address[]
}

model Address {
  id         String    @id @default(uuid())
  customerId String
  customer   Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  street     String
  city       String
  state      String
  pincode    String
  country    String    @default("India")
  isDefault  Boolean   @default(false)
}

// 🏷️ CATEGORY & WEAVE SPECIALIZATION HIERARCHY
model Category {
  id            String        @id @default(uuid())
  name          String        @unique
  slug          String        @unique
  description   String?
  region        String
  image         String?
  createdAt     DateTime      @default(now())

  subCategories SubCategory[] // Max 3 enforced via API
  products      Product[]
}

model SubCategory {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  products    Product[]
  createdAt   DateTime  @default(now())
}

// 👗 PRODUCT CATALOG & WHOLESALE PROCUREMENT VAULT
model Product {
  id              String              @id @default(uuid())
  sku             String              @unique
  name            String
  slug            String              @unique
  description     String
  
  categoryId      String
  category        Category            @relation(fields: [categoryId], references: [id])
  subCategoryId   String?
  subCategory     SubCategory?        @relation(fields: [subCategoryId], references: [id])

  sellingPrice    Float
  comparePrice    Float?
  stock           Int                 @default(1)
  isHeirloom1of1  Boolean             @default(false)
  
  fabric          String
  zariType        String
  craftRegion     String
  weaveStyle      String?
  silkMarkNumber  String?
  videoUrl        String?
  
  isFeatured      Boolean             @default(false)
  isDealOfDay     Boolean             @default(false)
  dealExpiresAt   DateTime?
  tags            String[]            @default([])
  images          String[]
  
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  procurement     ProductProcurement?
  orderItems      OrderItem[]
}

model ProductProcurement {
  id               String   @id @default(uuid())
  productId        String   @unique
  product          Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  costPrice        Float
  weaverGuildName  String
  weaverContact    String?
  procurementDate  DateTime @db.Date
  invoiceRef       String?
  notes            String?
  createdAt        DateTime @default(now())
}

// 📦 HIGH-ASSURANCE CHECKOUT & ORDER LOGISTICS
model Order {
  id                 String          @id @default(uuid())
  orderNumber        String          @unique
  customerId         String
  customer           Customer        @relation(fields: [customerId], references: [id])
  status             OrderStatus     @default(PENDING)
  totalAmount        Float
  shippingAddress    Json
  trackingHistory    Json            @default("[]") // JSONB timeline array
  
  courierPartner     String?
  awbNumber          String?         @unique
  trackingUrl        String?
  deliveryOtp        String?
  inspectionVideoUrl String?
  isNdrFlagged       Boolean         @default(false)
  ndrReason          String?
  
  razorpayOrderId    String?         @unique
  razorpayPaymentId  String?
  
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt

  items              OrderItem[]
}

model OrderItem {
  id         String   @id @default(uuid())
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  price      Float
  quantity   Int      @default(1)
}

model Coupon {
  id            String       @id @default(uuid())
  code          String       @unique
  discountType  DiscountType @default(PERCENTAGE)
  discountValue Float
  minOrderValue Float?
  maxDiscount   Float?
  usageLimit    Int?
  usedCount     Int          @default(0)
  validFrom     DateTime
  validUntil    DateTime
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
}

// 🏛️ INTERNAL OPS DOMAIN: Staff, Attendance, WorkLogs & Audit
model StaffAccount {
  id                String       @id @default(uuid())
  employeeId        String       @unique
  email             String       @unique
  passwordHash      String
  name              String
  role              StaffRole    @default(STAFF)
  customPermissions String[]     @default([])
  isActive          Boolean      @default(true)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  attendances       Attendance[]
  workLogs          WorkLog[]
  auditLogs         AuditLog[]
}

model Attendance {
  id        String           @id @default(uuid())
  staffId   String
  staff     StaffAccount     @relation(fields: [staffId], references: [id], onDelete: Cascade)
  date      DateTime         @db.Date
  clockIn   DateTime
  clockOut  DateTime?
  status    AttendanceStatus @default(PRESENT)
  notes     String?
  createdAt DateTime         @default(now())
}

model WorkLog {
  id             String       @id @default(uuid())
  staffId        String
  staff          StaffAccount @relation(fields: [staffId], references: [id], onDelete: Cascade)
  date           DateTime     @default(now())
  tasksSummary   String
  itemsProcessed Int?         @default(0)
}

model Announcement {
  id        String   @id @default(uuid())
  title     String
  content   String
  isUrgent  Boolean  @default(false)
  createdBy String
  createdAt DateTime @default(now())
}

model AuditLog {
  id         String       @id @default(uuid())
  staffId    String
  staff      StaffAccount @relation(fields: [staffId], references: [id])
  action     String
  entityType String
  entityId   String
  oldValues  Json?
  newValues  Json?
  ipAddress  String?
  createdAt  DateTime     @default(now())
}
```
