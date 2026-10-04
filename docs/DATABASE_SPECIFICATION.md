# 🏛️ Sutraಧಾರ — Database Architecture & Specification

**Platform:** Sutraಧಾರ Handloom Saree Platform  
**Database Engine:** PostgreSQL 16+ (Database: `sutradara_sarees_dev`)  
**ORM / Data Access:** Prisma ORM (`backend/src/prisma/schema.prisma`)  
**Design Philosophy:** Identity Segregation, Wholesale Margin Privacy, Zero-Client Price Recalculation, 1-of-1 Heirloom Double-Spend Locks, Fast JSONB Milestone Timelines, and Immutable Audit Trails.

---

## 📑 Complete 15 Tables Directory (Alphabetical — Exactly Matches PostgreSQL / pgAdmin)

| # | Table Name in PostgreSQL | Domain | Purpose |
| :---: | :--- | :--- | :--- |
| 1 | [**`Address`**](#table-1-address) | Storefront | Customer address book (with gifting / multi-recipient fields) |
| 2 | [**`Announcement`**](#table-2-announcement) | Internal Ops | Team broadcast noticeboard for staff and floor teams |
| 3 | [**`Attendance`**](#table-3-attendance) | Internal Ops | Staff shift punch-in/out records for payroll |
| 4 | [**`AuditLog`**](#table-4-auditlog) | Internal Ops | Immutable cyber defense ledger tracking admin actions |
| 5 | [**`Category`**](#table-5-category) | Storefront | Regional craft clusters (Varanasi, Kanchipuram, Yeola, Chanderi) |
| 6 | [**`Coupon`**](#table-6-coupon) | Storefront | Promotional discount codes and usage limits |
| 7 | [**`Customer`**](#table-7-customer) | Storefront | Public patrons using passwordless Email OTP authentication |
| 8 | [**`Order`**](#table-8-order) | Storefront | High-assurance order records, 4-digit drop OTP, and JSONB tracking |
| 9 | [**`OrderItem`**](#table-9-orderitem) | Storefront | Line items purchased in an order with locked purchase prices |
| 10 | [**`Product`**](#table-10-product) | Storefront | Master saree catalog (Public, drape notes, zari purity, Silk Mark) |
| 11 | [**`ProductProcurement`**](#table-11-productprocurement) | Confidential Vault | Wholesale procurement margins and master weaver contacts (`costPrice`) |
| 12 | [**`SubCategory`**](#table-12-subcategory) | Storefront | Weave and technique specializations (**Max 3 per Category**) |
| 13 | [**`TrackingEvent`**](#table-13-trackingevent) | Storefront | Dedicated milestone tracking events table |
| 14 | [**`User`**](#table-14-user) | Internal Ops | **Staff & Admin accounts** with Argon2id passwords and capabilities |
| 15 | [**`WorkLog`**](#table-15-worklog) | Internal Ops | Daily staff task output and processed saree count |

---

## 1. Entity-Relationship Diagram

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
└──────┬───────┘     1:N      └──────┬───────┘     1:N      └─────────┬──────────┘
       │                             │ 1:N                            │ N:1
       │ 1:N                         ▼                                ▼
       ▼                      ┌──────────────┐              ┌────────────────────┐
┌──────────────┐              │TrackingEvent │              │      Product       │
│   Address    │              └──────────────┘              └─────────┬──────────┘
└──────────────┘                                                      │ 1:1
                                                                      ▼
                                                            ┌────────────────────┐
                                                            │ ProductProcurement │
                                                            │(Confidential Vault)│
                                                            └────────────────────┘

                              INTERNAL OPS DOMAIN
┌────────────────────────────────────────────────────────────────────────────────┐
│                         User (Staff & Admin Accounts)                          │
└───────┬───────────────────────────────┬───────────────────────────────┬────────┘
        │ 1:N                           │ 1:N                           │ 1:N
        ▼                               ▼                               ▼
┌───────────────┐               ┌───────────────┐               ┌────────────────┐
│  Attendance   │               │    WorkLog    │               │    AuditLog    │
└───────────────┘               └───────────────┘               └────────────────┘
```

---

## 2. Database Enums

### `Role`
Defines actor privileges across internal operations:
| Value | Description |
| :--- | :--- |
| `CUSTOMER` | Public shopper account |
| `STAFF` | Floor staff / packing team (Quick stock updates, order fulfillment, 20s pre-dispatch video QC) |
| `ADMIN` | System executive (Full access to wholesale cost prices, staff management, payroll, audit logs) |

### `OrderStatus`
Strict state machine for handloom order fulfillment:
| Value | Description |
| :--- | :--- |
| `PENDING` | Order created; awaiting online payment capture / checkout authorization |
| `PAID` | Payment captured and verified |
| `QC_INSPECTED` | Pre-shipment 20s ultra-high-definition video inspection recorded and verified by Master Curator |
| `PROCESSING` | Artisan piece steamed, folded, and sealed in luxury heritage trunk with tamper-evident tape |
| `SHIPPED` | Dispatched via high-assurance air courier (AWB generated, tracking active) |
| `IN_TRANSIT` | Air shipment in flight or sorted at metro airport gateway hub |
| `OUT_FOR_DELIVERY` | White-glove van out for delivery to patron doorstep |
| `DELIVERED` | Handover complete and accepted by recipient at patron residence |
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

## 3. Exhaustive Tables Specification (All 15 Tables)

---

### Table 1: `Address`
Customer shipping address book with multi-recipient support (gifting, family, office, wedding venues) and 6-digit Indian PIN code validation.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Address identifier |
| `customerId` | `VARCHAR(36)` | **FK**, NULLABLE | — | Reference to `Customer.id` (`onDelete: Cascade`) |
| `userId` | `VARCHAR(36)` | **FK**, NULLABLE | — | Reference to `User.id` (`onDelete: Cascade`) |
| `recipientName` | `VARCHAR(100)` | NULLABLE | — | **Recipient full name** (supports ordering for someone else / gifting, e.g. *"Sunita Verma (Mother)"*) |
| `recipientPhone`| `VARCHAR(20)` | NULLABLE | — | **Recipient mobile number** (called by courier agent for delivery & 4-digit drop OTP) |
| `label` | `VARCHAR(50)` | NULLABLE | — | User-defined label (e.g. `"Home"`, `"Office"`, `"Mother's Place"`, `"Wedding Venue"`) |
| `street` | `VARCHAR(250)` | NOT NULL | — | House/Flat number, building, street |
| `landmark` | `VARCHAR(150)` | NULLABLE | — | Nearby landmark (e.g. *"Opposite City Center Mall"*) |
| `city` | `VARCHAR(100)` | NOT NULL | — | City / Town |
| `state` | `VARCHAR(100)` | NOT NULL | — | State / Territory |
| `pincode` | `VARCHAR(6)` | NOT NULL | — | Validated 6-digit Indian PIN code (`/^[1-9][0-9]{5}$/`) |
| `country` | `VARCHAR(50)` | NOT NULL | `"India"` | Country name |
| `isDefault` | `BOOLEAN` | NOT NULL | `false` | Default shipping address flag |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Address creation date |

---

### Table 2: `Announcement`
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

### Table 3: `Attendance`
Staff shift records for attendance and payroll computation.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Punch record identifier |
| `userId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `User.id` (`onDelete: Cascade`) |
| `date` | `DATE` | NOT NULL | — | Shift date (YYYY-MM-DD) |
| `clockIn` | `TIMESTAMP` | NOT NULL | — | Clock-in timestamp |
| `clockOut` | `TIMESTAMP` | NULLABLE | — | Clock-out timestamp |
| `status` | `AttendanceStatus`| NOT NULL | `PRESENT` | Attendance status enum |
| `notes` | `TEXT` | NULLABLE | — | Shift notes / overtime remarks |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Record creation timestamp |

---

### Table 4: `AuditLog`
Immutable cyber defense ledger tracking all administrative and financial actions.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Audit entry identifier |
| `userId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `User.id` (actor) |
| `action` | `VARCHAR(100)` | NOT NULL | — | Event code (e.g. `PRODUCT_PRICE_UPDATE`, `STOCK_OVERRIDE`) |
| `entityType` | `VARCHAR(50)` | NOT NULL | — | Target entity: `PRODUCT`, `ORDER`, `USER`, `COUPON` |
| `entityId` | `VARCHAR(50)` | NOT NULL | — | Primary key of modified entity |
| `oldValues` | `JSONB` | NULLABLE | — | JSON snapshot before modification |
| `newValues` | `JSONB` | NULLABLE | — | JSON snapshot after modification |
| `ipAddress` | `VARCHAR(45)` | NULLABLE | — | Origin IPv4 / IPv6 address |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Immutable timestamp |

---

### Table 5: `Category`
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

### Table 6: `Coupon`
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

### Table 7: `Customer`
Stores public storefront patrons with passwordless email OTP and address associations.

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

---

### Table 8: `Order`
High-assurance order records with immutable customer snapshots, multi-carrier logistics, and integrated JSONB milestone history.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Internal order UUID |
| `orderNumber` | `VARCHAR(50)` | **UNIQUE**, NOT NULL | — | Human-readable ID (e.g. `SUT-2026-1001`) |
| `customerId` | `VARCHAR(36)` | **FK**, NULLABLE | — | Reference to `Customer.id` |
| `customerName` | `VARCHAR(100)` | NULLABLE | — | **Immutable Customer Name snapshot** at checkout |
| `customerEmail`| `VARCHAR(150)` | NULLABLE | — | **Immutable Customer Email snapshot** at checkout |
| `customerPhone`| `VARCHAR(20)` | NULLABLE | — | **Immutable Customer Phone snapshot** at checkout |
| `status` | `OrderStatus` | NOT NULL | `PENDING` | Order lifecycle status (`PENDING`, `PAID`, `QC_INSPECTED`, `PROCESSING`, `SHIPPED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `RETURNED`) |
| `totalAmount` | `DOUBLE PRECISION`| NOT NULL | — | Server-recalculated total in INR |
| `shippingAddress`| `JSONB` | NOT NULL | — | Immutable JSON snapshot of destination address |
| `trackingHistory`| `JSONB` | NULLABLE | `'[]'` | **Chronological milestone array** |
| `courierPartner`| `VARCHAR(100)` | NULLABLE | — | Logistics carrier (e.g. *"Bluedart Apex Air"*, *"Delhivery Express"*, *"DTDC Express"*, *"Speed Post"*) |
| `awbNumber` | `VARCHAR(100)` | **UNIQUE**, NULLABLE| — | Air Waybill / Tracking number |
| `trackingUrl` | `VARCHAR(500)` | NULLABLE | — | Courier tracking link |
| `inspectionVideoUrl`|`VARCHAR(500)`| NULLABLE | — | **INTERNAL WAREHOUSE EVIDENCE RECORD** (Scrubbed from public patron views) |
| `isNdrFlagged` | `BOOLEAN` | NOT NULL | `false` | Flagged if Non-Delivery Report was filed |
| `ndrReason` | `TEXT` | NULLABLE | — | Delivery failure / rescheduling note |
| `razorpayOrderId`|`VARCHAR(100)` | **UNIQUE**, NULLABLE| — | Payment gateway order ID |
| `razorpayPaymentId`|`VARCHAR(100)`| NULLABLE | — | Payment gateway transaction ID |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Order creation timestamp |
| `updatedAt` | `TIMESTAMP` | NOT NULL | `now()` | Last update timestamp |

---

### Table 9: `OrderItem`
Line items linking products to an order with the exact price captured at purchase.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Line item identifier |
| `orderId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Order.id` (`onDelete: Cascade`) |
| `productId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Product.id` |
| `price` | `DOUBLE PRECISION`| NOT NULL | — | Price locked in INR at moment of purchase |
| `quantity` | `INTEGER` | NOT NULL | `1` | Quantity ordered |

---

### Table 10: `Product`
Master catalog of authentic handloom sarees (Public & Storefront Safe).

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique product identifier |
| `sku` | `VARCHAR(50)` | **UNIQUE**, NOT NULL | — | Floor barcode / SKU (e.g. `BAN-KAT-001`) |
| `name` | `VARCHAR(200)` | NOT NULL | — | Full display name |
| `slug` | `VARCHAR(250)` | **UNIQUE**, NOT NULL | — | URL path (e.g. `/product/royal-kadhwa-jangla`) |
| `description` | `TEXT` | NOT NULL | — | Drape notes, zari purity, weaver story |
| `categoryId` | `VARCHAR(36)` | **FK**, NULLABLE | — | Reference to `Category.id` |
| `subCategoryId`| `VARCHAR(36)`| **FK**, NULLABLE | — | Reference to `SubCategory.id` |
| `sellingPrice` | `DOUBLE PRECISION`| NOT NULL | — | Retail price in INR |
| `comparePrice` | `DOUBLE PRECISION`| NULLABLE | — | Strikethrough comparison price |
| `costPrice` | `DOUBLE PRECISION`| NULLABLE | — | Confidential wholesale procurement price |
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

---

### Table 11: `ProductProcurement`
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

---

### Table 12: `SubCategory`
Weave, technique, and motif specializations (**Strictly max 3 per Category**).

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique sub-category identifier |
| `name` | `VARCHAR(100)` | NOT NULL | — | Sub-category name (e.g. *"Kadhwa Pure Katan Silk"*) |
| `slug` | `VARCHAR(120)` | **UNIQUE**, NOT NULL | — | URL-safe slug (e.g. `kadhwa-pure-katan-silk`) |
| `description`| `TEXT` | NULLABLE | — | Technical description of the weave method |
| `categoryId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Category.id` (`onDelete: Cascade`) |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Creation timestamp |

---

### Table 13: `TrackingEvent`
Dedicated milestone tracking events table linking to an order.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Event identifier |
| `orderId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Order.id` (`onDelete: Cascade`) |
| `status` | `VARCHAR(50)` | NOT NULL | — | Milestone code: `PICKED_UP`, `IN_TRANSIT`, `DELIVERED` |
| `location` | `VARCHAR(150)` | NULLABLE | — | Hub location |
| `message` | `TEXT` | NOT NULL | — | Human-readable progress description |
| `timestamp` | `TIMESTAMP` | NOT NULL | `now()` | Timestamp of milestone |

---

### Table 14: `User`
Staff and Administrator accounts with Argon2id passwords and granular capability arrays.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique user identifier |
| `email` | `VARCHAR(150)` | **UNIQUE**, NOT NULL | — | Corporate staff email |
| `passwordHash` | `VARCHAR(255)` | NOT NULL | — | Argon2id / Bcrypt hashed password |
| `name` | `VARCHAR(100)` | NOT NULL | — | Employee / Administrator full name |
| `phone` | `VARCHAR(20)` | NULLABLE | — | Contact mobile number |
| `role` | `Role` | NOT NULL | `STAFF` | Role: `CUSTOMER`, `STAFF`, `ADMIN` |
| `customPermissions`| `TEXT[]` | NOT NULL | `[]` | Granular capabilities: `["finance:view", "products:create_edit"]` |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Account registration date |
| `updatedAt` | `TIMESTAMP` | NOT NULL | `now()` | Last profile update |

* **Relationships:**
  * `attendances`: Has many `Attendance` (1:N).
  * `workLogs`: Has many `WorkLog` (1:N).
  * `auditLogs`: Has many `AuditLog` (1:N).
  * `orders`: Has many `Order` (1:N).
  * `addresses`: Has many `Address` (1:N).

---

### Table 15: `WorkLog`
Daily staff shift output and processed inventory counts.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Work log identifier |
| `userId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `User.id` (`onDelete: Cascade`) |
| `date` | `TIMESTAMP` | NOT NULL | `now()` | Shift date/time |
| `tasksSummary` | `TEXT` | NOT NULL | — | Summary of completed tasks |
| `itemsProcessed`|`INTEGER` | NULLABLE | `0` | Count of sarees inspected, packed, or inventoried |

---

## 4. Category Taxonomy Structure

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

## 5. Database Indexes & Performance Rules

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

-- Fast audit search by user actor and entity
CREATE INDEX idx_audit_user_action ON "AuditLog"("userId", "action");
CREATE INDEX idx_audit_entity ON "AuditLog"("entityType", "entityId");

-- Staff attendance filtering
CREATE INDEX idx_attendance_user_date ON "Attendance"("userId", "date");
```

---

## 6. Security & Business Invariants

1. **Zero-Client-Price Trust:** Product prices and discounts submitted from client browsers are strictly disregarded. The backend recalculates `totalAmount` directly from `Product.sellingPrice` at checkout.
2. **1-of-1 Double-Spend Protection:** Single-piece heirlooms (`isHeirloom1of1 = true`) receive an atomic 10-minute pessimistic hold to prevent duplicate checkouts.
3. **Wholesale Margin Privacy (Physical Isolation):** Because `costPrice` lives in `ProductProcurement`, queries on `Product` cannot leak wholesale prices into client browsers.
4. **Warehouse QC Video Isolation (Customer Exclusion):** `Order.inspectionVideoUrl` is strictly an internal warehouse evidence asset. It is automatically scrubbed from all customer-facing endpoints (`/api/v1/customer/orders/*`) and is **never accessible to public patrons**. It is exclusively viewable by authenticated staff in the `/portal` for courier dispute resolution and fraudulent return protection.
5. **Multi-Factor Rate Limiting:** All customer auth and OTP routes are rate-limited via composite keys `(targetEmail + _sutradara_did cookie + browser fingerprint)`.
6. **Immutable Audit Trails:** `AuditLog` rows cannot be updated or deleted via API; they capture exact JSON deltas (`oldValues` $\rightarrow$ `newValues`).

### 📸 Media & Asset Storage Policy
* **`Category.image` (Optional):** Cluster banner URL; if omitted, client UI falls back to default craft pattern.
* **`Product.images` (Mandatory - Minimum 1, Supports Multiple):** Stored as `TEXT[]` string array in PostgreSQL pointing to Cloudflare R2 / S3 storage. A saree must have at least 1 image to be published, and can have 4 to 10 photos covering front drape, pallu macro, border detail, and Silk Mark tags.
* **`Product.videoUrl` (Optional):** Saree showcase reel or loom weaving video URL.
* **`Order.inspectionVideoUrl` (Internal-Only Evidence):** Null at checkout; mandatory for warehouse staff before dispatch/AWB generation; strictly restricted to portal staff/admin.

---

## 7. Prisma Reference Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  STAFF
  ADMIN
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

// 🛍️ STOREFRONT DOMAIN: Customers & Multi-Recipient Address Book
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
  id             String    @id @default(uuid())
  customerId     String?
  customer       Customer? @relation(fields: [customerId], references: [id], onDelete: Cascade)
  userId         String?
  user           User?     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 🎁 Gifting & Recipient Details
  recipientName  String?
  recipientPhone String?
  label          String?
  
  street         String
  landmark       String?
  city           String
  state          String
  pincode        String
  country        String    @default("India")
  isDefault      Boolean   @default(false)
  createdAt      DateTime  @default(now())
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
  
  categoryId      String?
  category        Category?           @relation(fields: [categoryId], references: [id])
  subCategoryId   String?
  subCategory     SubCategory?        @relation(fields: [subCategoryId], references: [id])

  sellingPrice    Float
  comparePrice    Float?
  costPrice       Float?
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
  userId             String?
  user               User?           @relation(fields: [userId], references: [id])
  customerId         String?
  customer           Customer?       @relation(fields: [customerId], references: [id])
  status             OrderStatus     @default(PENDING)
  totalAmount        Float
  shippingAddress    Json
  trackingHistory    Json?           @default("[]")
  
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
  trackingEvents     TrackingEvent[]
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

model TrackingEvent {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status    String
  location  String?
  message   String
  timestamp DateTime @default(now())
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

// 🏛️ STAFF, ADMIN & WORKSPACE DOMAIN
model User {
  id                String       @id @default(uuid())
  email             String       @unique
  passwordHash      String
  name              String
  phone             String?
  role              Role         @default(STAFF)
  customPermissions String[]     @default([])
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  orders            Order[]
  addresses         Address[]
  attendances       Attendance[]
  workLogs          WorkLog[]
  auditLogs         AuditLog[]
}

model Attendance {
  id        String           @id @default(uuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      DateTime         @db.Date
  clockIn   DateTime
  clockOut  DateTime?
  status    AttendanceStatus @default(PRESENT)
  notes     String?
  createdAt DateTime         @default(now())
}

model WorkLog {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date           DateTime @default(now())
  tasksSummary   String
  itemsProcessed Int?     @default(0)
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
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  action     String
  entityType String
  entityId   String
  oldValues  Json?
  newValues  Json?
  ipAddress  String?
  createdAt  DateTime @default(now())
}
```
