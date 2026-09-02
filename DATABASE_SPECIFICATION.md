# 🏛️ Sutraಧಾರ — Database Architecture & Specification

**Platform:** Sutraಧಾರ Handloom Saree Platform  
**Database Engine:** PostgreSQL 16+  
**ORM / Data Access:** Prisma ORM (`backend/src/prisma/schema.prisma`)  
**Design Philosophy:** Strict Relational Integrity, 3-Stage Price Recalculation, Granular Role-Based Access Control (RBAC), 1-of-1 Heirloom Double-Spend Locks, and Immutable Audit Trails.

---

## 📑 Table of Contents
1. [Entity-Relationship Diagram](#1-entity-relationship-diagram)
2. [Database Enums](#2-database-enums)
3. [Complete Tables & Columns Specification](#3-complete-tables--columns-specification)
   - [Category (Craft Clusters & Heritages)](#table-1-category)
   - [SubCategory (Max 3 per Category)](#table-2-subcategory)
   - [Product (Handloom Saree Catalog)](#table-3-product)
   - [User (Customers, Staff, Admins)](#table-4-user)
   - [Order (High-Assurance Checkout)](#table-5-order)
   - [OrderItem (Order Line Items)](#table-6-orderitem)
   - [TrackingEvent (Milestone Timeline)](#table-7-trackingevent)
   - [Coupon (Promotional Discounts)](#table-8-coupon)
   - [Address (Customer Address Book)](#table-9-address)
   - [Attendance (Staff Shiftpunches)](#table-10-attendance)
   - [WorkLog (Daily Staff Productivity)](#table-11-worklog)
   - [Announcement (Team Noticeboard)](#table-12-announcement)
   - [AuditLog (Immutable Cyber Defense Ledger)](#table-13-auditlog)
4. [Category Taxonomy Structure](#4-category-taxonomy-structure)
5. [Database Indexes & Performance Rules](#5-database-indexes--performance-rules)
6. [Security & Business Invariants](#6-security--business-invariants)
7. [Prisma Reference Schema](#7-prisma-reference-schema)

---

## 1. Entity-Relationship Diagram

```
                   ┌──────────────────┐
                   │     Category     │
                   └────────┬─────────┘
                            │ 1:N (Max 3)
                            ▼
                   ┌──────────────────┐
                   │   SubCategory    │
                   └────────┬─────────┘
                            │ 1:N
                            ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     User     │◄────┤    Order     │────►│  OrderItem   │◄────┤   Product    │
└──────┬───────┘ 1:N └──────┬───────┘ 1:N └──────────────┘ N:1 └──────────────┘
       │                    │
       │ 1:N                │ 1:N
       ├──────────────┐     ▼
       │              │ ┌───────────────┐
       ▼              ▼ │ TrackingEvent │
┌─────────────┐ ┌─────────────┐ └───────────────┘
│   Address   │ │ Attendance  │
└─────────────┘ └─────────────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
│   WorkLog   │ │  AuditLog   │ │   Coupon    │ │ Announcement │
└─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘
```

---

## 2. Database Enums

### `Role`
| Value | Description | Permissions Summary |
| :--- | :--- | :--- |
| `CUSTOMER` | Public shopper | Cart management, order placement, order history tracking, saved addresses |
| `STAFF` | Floor staff / packing team | Quick stock adjustments, order fulfillment, 20s pre-dispatch QC video upload |
| `ADMIN` | System executive | Wholesale cost price view (`costPrice`), staff management, financial reports, audit logs |

### `OrderStatus`
| Value | Description |
| :--- | :--- |
| `PENDING` | Order created; awaiting online payment gateway capture |
| `PAID` | Payment captured and cryptographically verified via Razorpay HMAC signature |
| `PROCESSING` | Artisan piece retrieved from vault; pre-shipment 20s video QC conducted |
| `SHIPPED` | Dispatched via high-assurance courier (AWB generated, tracking active) |
| `DELIVERED` | 4-digit drop OTP validated by delivery agent at patron doorstep |
| `CANCELLED` | Order cancelled; 1-of-1 heirloom reservation released back to inventory |
| `RETURNED` | Verified 7-day white-glove inspection return processed |

### `AttendanceStatus`
| Value | Description |
| :--- | :--- |
| `PRESENT` | On-time punch-in recorded |
| `HALF_DAY` | Worked less than standard threshold hours |
| `LATE` | Clocked in past grace period threshold |
| `APPROVED_LEAVE` | Pre-approved absence authorized by Admin |
| `ABSENT` | Unexcused absence |

### `DiscountType`
| Value | Description |
| :--- | :--- |
| `PERCENTAGE` | Deducts percentage of subtotal (subject to `maxDiscount` cap) |
| `FLAT` | Deducts fixed rupee amount (e.g. ₹2,000 flat off) |

---

## 3. Complete Tables & Columns Specification

---

### Table 1: `Category`
Regional handloom clusters and primary heritages.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique category identifier |
| `name` | `VARCHAR(100)` | **UNIQUE**, NOT NULL | — | Name (e.g. *"Banarasi Heritage"*) |
| `slug` | `VARCHAR(120)` | **UNIQUE**, NOT NULL | — | URL-safe slug (e.g. `banarasi-heritage`) |
| `description`| `TEXT` | NULLABLE | — | Historical provenance and craft guild story |
| `region` | `VARCHAR(100)` | NOT NULL | — | Geographical cluster (e.g. *"Varanasi"*) |
| `image` | `VARCHAR(500)` | NULLABLE | — | Banner image URL |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Record creation timestamp |

* **Relationships:**
  * `subCategories`: Has many `SubCategory` (1:N, strict limit: **max 3**).
  * `products`: Has many `Product` (1:N).

---

### Table 2: `SubCategory`
Technique, motif, and weave specializations (**Strictly max 3 per Category**).

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique sub-category identifier |
| `name` | `VARCHAR(100)` | NOT NULL | — | Display title (e.g. *"Kadhwa Pure Katan Silk"*) |
| `slug` | `VARCHAR(120)` | **UNIQUE**, NOT NULL | — | URL-safe slug (e.g. `kadhwa-pure-katan-silk`) |
| `description`| `TEXT` | NULLABLE | — | Technical description of the weave method |
| `categoryId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Category.id` (`onDelete: Cascade`) |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Record creation timestamp |

* **Relationships:**
  * `category`: Belongs to `Category`.
  * `products`: Has many `Product` (1:N).
* **Validation Rule:** Backend controller checks `COUNT(subCategories WHERE categoryId = ?) < 3` before insert.

---

### Table 3: `Product`
Master catalog of authentic handloom sarees.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique product identifier |
| `sku` | `VARCHAR(50)` | **UNIQUE**, NOT NULL | — | Floor barcode / SKU (e.g. `BAN-KAT-001`) |
| `name` | `VARCHAR(200)` | NOT NULL | — | Full display name |
| `slug` | `VARCHAR(250)` | **UNIQUE**, NOT NULL | — | URL path (e.g. `/product/royal-kadhwa-jangla`) |
| `description` | `TEXT` | NOT NULL | — | Story, drape notes, zari details |
| `categoryId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Category.id` |
| `subCategoryId`| `VARCHAR(36)`| **FK**, NULLABLE | — | Reference to `SubCategory.id` |
| `sellingPrice` | `DOUBLE PRECISION`| NOT NULL | — | Retail selling price in INR |
| `comparePrice` | `DOUBLE PRECISION`| NULLABLE | — | Strikethrough comparison price |
| `costPrice` | `DOUBLE PRECISION`| NULLABLE | — | **Confidential** wholesale artisan procurement cost (masked unless `finance:view`) |
| `stock` | `INTEGER` | NOT NULL | `1` | Available quantity |
| `isHeirloom1of1`| `BOOLEAN` | NOT NULL | `false` | Single-piece flag; triggers 10-min pessimistic lock |
| `fabric` | `VARCHAR(100)` | NOT NULL | — | e.g. *"Pure Katan Silk"*, *"3-Ply Mulberry Silk"* |
| `zariType` | `VARCHAR(100)` | NOT NULL | — | e.g. *"Pure Gold Zari"*, *"Tested Gold Zari"* |
| `craftRegion` | `VARCHAR(100)` | NOT NULL | — | Geographical cluster (e.g. *"Varanasi"*) |
| `weaveStyle` | `VARCHAR(100)` | NULLABLE | — | Weave method (e.g. *"Kadhwa"*, *"Korvai"*) |
| `silkMarkNumber`|`VARCHAR(50)` | NULLABLE | — | Official Silk Mark hologram verification code |
| `videoUrl` | `VARCHAR(500)` | NULLABLE | — | Showcase reel / loom video URL |
| `isFeatured` | `BOOLEAN` | NOT NULL | `false` | Shown on Home Featured Showcase |
| `isDealOfDay` | `BOOLEAN` | NOT NULL | `false` | Active in Privileged Deal countdown |
| `dealExpiresAt`|`TIMESTAMP` | NULLABLE | — | Deal expiration timestamp |
| `tags` | `TEXT[]` | NOT NULL | `[]` | Search tags: `["Bridal", "Diwali", "Heirloom"]` |
| `images` | `TEXT[]` | NOT NULL | `[]` | Array of high-resolution image URLs |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Catalog entry timestamp |
| `updatedAt` | `TIMESTAMP` | NOT NULL | `now()` | Last modification timestamp |

---

### Table 4: `User`
Unified identity model for Customers, Staff, and Administrators.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Unique user identifier |
| `email` | `VARCHAR(150)` | **UNIQUE**, NOT NULL | — | Validated email address |
| `passwordHash` | `VARCHAR(255)` | NOT NULL | — | Argon2id / Bcrypt hashed password |
| `name` | `VARCHAR(100)` | NOT NULL | — | Full name |
| `phone` | `VARCHAR(20)` | NULLABLE | — | Mobile contact number |
| `role` | `Role` | NOT NULL | `STAFF` | User role (`CUSTOMER`, `STAFF`, `ADMIN`) |
| `customPermissions`| `TEXT[]` | NOT NULL | `[]` | Granular permission capabilities |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Account creation date |
| `updatedAt` | `TIMESTAMP` | NOT NULL | `now()` | Last profile update |

---

### Table 5: `Order`
Checkout records with Zero-Client-Price Trust and logistics tracking.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Internal order UUID |
| `orderNumber` | `VARCHAR(50)` | **UNIQUE**, NOT NULL | — | Human-readable ID (e.g. `SUT-2026-1001`) |
| `userId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `User.id` |
| `status` | `OrderStatus` | NOT NULL | `PENDING` | Order lifecycle status |
| `totalAmount` | `DOUBLE PRECISION`| NOT NULL | — | Server-computed total in INR |
| `shippingAddress`| `JSONB` | NOT NULL | — | Immutable JSON snapshot of destination address |
| `courierPartner`| `VARCHAR(100)` | NULLABLE | — | Logistics provider (e.g. *"BlueDart Apex"*) |
| `awbNumber` | `VARCHAR(100)` | **UNIQUE**, NULLABLE| — | Air Waybill / Tracking number |
| `trackingUrl` | `VARCHAR(500)` | NULLABLE | — | Courier tracking link |
| `deliveryOtp` | `VARCHAR(6)` | NULLABLE | — | **4-digit secure delivery OTP** given to driver |
| `inspectionVideoUrl`|`VARCHAR(500)`| NULLABLE | — | 20s pre-dispatch inspection video recorded by staff |
| `isNdrFlagged` | `BOOLEAN` | NOT NULL | `false` | Flagged if delivery exception occurred |
| `ndrReason` | `TEXT` | NULLABLE | — | Reason for delivery failure / rescheduling |
| `razorpayOrderId`|`VARCHAR(100)` | **UNIQUE**, NULLABLE| — | Payment gateway order ID |
| `razorpayPaymentId`|`VARCHAR(100)`| NULLABLE | — | Payment gateway transaction ID |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Order creation timestamp |
| `updatedAt` | `TIMESTAMP` | NOT NULL | `now()` | Last update timestamp |

---

### Table 6: `OrderItem`
Line items linking products to an order with the exact price captured at checkout.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Line item identifier |
| `orderId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Order.id` (`onDelete: Cascade`) |
| `productId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Product.id` |
| `price` | `DOUBLE PRECISION`| NOT NULL | — | Price locked in INR at moment of purchase |
| `quantity` | `INTEGER` | NOT NULL | `1` | Quantity ordered |

---

### Table 7: `TrackingEvent`
Live delivery timeline milestones shown on `/track/[orderId]`.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Timeline event identifier |
| `orderId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `Order.id` (`onDelete: Cascade`) |
| `status` | `VARCHAR(50)` | NOT NULL | — | Milestone code: `PICKED_UP`, `IN_TRANSIT`, `DELIVERED` |
| `location` | `VARCHAR(150)` | NULLABLE | — | Hub location (e.g. *"Varanasi Vault"*) |
| `message` | `TEXT` | NOT NULL | — | Human-readable progress description |
| `timestamp` | `TIMESTAMP` | NOT NULL | `now()` | Timestamp of milestone |

---

### Table 8: `Coupon`
Promotional codes with date boundaries, usage quotas, and minimum spends.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Coupon identifier |
| `code` | `VARCHAR(50)` | **UNIQUE**, NOT NULL | — | Uppercase coupon code (e.g. `VIRASAT10`) |
| `discountType` | `DiscountType` | NOT NULL | `PERCENTAGE`| `PERCENTAGE` or `FLAT` |
| `discountValue`| `DOUBLE PRECISION`| NOT NULL | — | Percentage rate or flat rupee amount |
| `minOrderValue`| `DOUBLE PRECISION`| NULLABLE | — | Minimum cart value in INR required |
| `maxDiscount` | `DOUBLE PRECISION`| NULLABLE | — | Maximum discount cap for percentage coupons |
| `usageLimit` | `INTEGER` | NULLABLE | — | Maximum global redemption count |
| `usedCount` | `INTEGER` | NOT NULL | `0` | Number of times redeemed |
| `validFrom` | `TIMESTAMP` | NOT NULL | — | Start date/time |
| `validUntil` | `TIMESTAMP` | NOT NULL | — | Expiry date/time |
| `isActive` | `BOOLEAN` | NOT NULL | `true` | Active status toggle |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Creation timestamp |

---

### Table 9: `Address`
Customer shipping address book with 6-digit Indian PIN code validation.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Address identifier |
| `userId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `User.id` |
| `street` | `VARCHAR(250)` | NOT NULL | — | Street address, building, floor |
| `city` | `VARCHAR(100)` | NOT NULL | — | City / Town |
| `state` | `VARCHAR(100)` | NOT NULL | — | State / Territory |
| `pincode` | `VARCHAR(6)` | NOT NULL | — | Validated 6-digit Indian PIN code (`/^[1-9][0-9]{5}$/`) |
| `country` | `VARCHAR(50)` | NOT NULL | `"India"` | Country name |
| `isDefault` | `BOOLEAN` | NOT NULL | `false` | Default shipping address flag |

---

### Table 10: `Attendance`
Staff shift records for payroll and attendance tracking.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Punch record identifier |
| `userId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `User.id` |
| `date` | `DATE` | NOT NULL | — | Shift date (YYYY-MM-DD) |
| `clockIn` | `TIMESTAMP` | NOT NULL | — | Clock-in time |
| `clockOut` | `TIMESTAMP` | NULLABLE | — | Clock-out time |
| `status` | `AttendanceStatus`| NOT NULL | `PRESENT` | Shift status enum |
| `notes` | `TEXT` | NULLABLE | — | Remarks (e.g. *"Overtime approved"*) |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Record creation timestamp |

---

### Table 11: `WorkLog`
Daily staff shift output and processed inventory counts.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Work log identifier |
| `userId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Reference to `User.id` |
| `date` | `TIMESTAMP` | NOT NULL | `now()` | Shift date/time |
| `tasksSummary` | `TEXT` | NOT NULL | — | Summary of tasks completed |
| `itemsProcessed`|`INTEGER` | NULLABLE | `0` | Count of sarees inspected, packed, or uploaded |

---

### Table 12: `Announcement`
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

### Table 13: `AuditLog`
Immutable cyber defense ledger tracking all administrative actions.

| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | **PK**, UUID | `uuid()` | Audit entry identifier |
| `userId` | `VARCHAR(36)` | **FK**, NOT NULL | — | Actor who performed the action (`User.id`) |
| `action` | `VARCHAR(100)` | NOT NULL | — | Event code (e.g. `PRODUCT_PRICE_UPDATE`, `STOCK_OVERRIDE`) |
| `entityType` | `VARCHAR(50)` | NOT NULL | — | Target entity: `PRODUCT`, `ORDER`, `USER`, `COUPON` |
| `entityId` | `VARCHAR(50)` | NOT NULL | — | Primary key of modified entity |
| `oldValues` | `JSONB` | NULLABLE | — | JSON snapshot before modification |
| `newValues` | `JSONB` | NULLABLE | — | JSON snapshot after modification |
| `ipAddress` | `VARCHAR(45)` | NULLABLE | — | Origin IPv4 / IPv6 address |
| `createdAt` | `TIMESTAMP` | NOT NULL | `now()` | Immutable timestamp |

---

## 4. Category Taxonomy Structure

Every Category contains a **maximum of 3 sub-categories**:

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
-- Fast SKU and Slug lookup for products
CREATE UNIQUE INDEX idx_product_sku ON "Product"("sku");
CREATE UNIQUE INDEX idx_product_slug ON "Product"("slug");
CREATE INDEX idx_product_category ON "Product"("categoryId", "subCategoryId");
CREATE INDEX idx_product_region_fabric ON "Product"("craftRegion", "fabric");

-- Sub-Category parent lookup
CREATE INDEX idx_subcategory_category ON "SubCategory"("categoryId");

-- Order lookups by status and patron
CREATE UNIQUE INDEX idx_order_number ON "Order"("orderNumber");
CREATE INDEX idx_order_user_status ON "Order"("userId", "status");
CREATE INDEX idx_order_awb ON "Order"("awbNumber");

-- Fast audit search by user and entity
CREATE INDEX idx_audit_user_action ON "AuditLog"("userId", "action");
CREATE INDEX idx_audit_entity ON "AuditLog"("entityType", "entityId");

-- Attendance date filtering
CREATE INDEX idx_attendance_user_date ON "Attendance"("userId", "date");
```

---

## 6. Security & Business Invariants

1. **Zero-Client-Price Trust:** Client payloads with price or discount fields are strictly ignored. The backend queries `Product.sellingPrice` from the database and calculates the total during order creation.
2. **1-of-1 Double-Spend Protection:** If `Product.isHeirloom1of1 = true`, an atomic 10-minute pessimistic hold prevents other users from initiating checkout for that single-piece saree.
3. **Wholesale Margin Privacy:** The `costPrice` column is omitted from public API serializers and only accessible to users with the `finance:view` permission.
4. **Multi-Factor Rate Limiting:** All customer auth and OTP routes are rate-limited via composite keys `(targetEmail + _sutradara_did cookie + browser signature)`, ensuring no false bans on shared Wi-Fi networks.
5. **Immutable Audit Trails:** `AuditLog` rows cannot be updated or deleted via API endpoints; they record the exact JSON delta (`oldValues` $\rightarrow$ `newValues`).

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

model Product {
  id              String       @id @default(uuid())
  sku             String       @unique
  name            String
  slug            String       @unique
  description     String
  
  categoryId      String
  category        Category     @relation(fields: [categoryId], references: [id])
  subCategoryId   String?
  subCategory     SubCategory? @relation(fields: [subCategoryId], references: [id])

  sellingPrice    Float
  comparePrice    Float?
  costPrice       Float?
  stock           Int          @default(1)
  isHeirloom1of1  Boolean      @default(false)
  
  fabric          String
  zariType        String
  craftRegion     String
  weaveStyle      String?
  silkMarkNumber  String?
  videoUrl        String?
  
  isFeatured      Boolean      @default(false)
  isDealOfDay     Boolean      @default(false)
  dealExpiresAt   DateTime?
  tags            String[]     @default([])
  images          String[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  orderItems      OrderItem[]
}

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

model Order {
  id                 String          @id @default(uuid())
  orderNumber        String          @unique
  userId             String
  user               User            @relation(fields: [userId], references: [id])
  status             OrderStatus     @default(PENDING)
  totalAmount        Float
  shippingAddress    Json
  
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
  id          String   @id @default(uuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  price       Float
  quantity    Int      @default(1)
}

model TrackingEvent {
  id          String   @id @default(uuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status      String
  location    String?
  message     String
  timestamp   DateTime @default(now())
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

model Address {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  street    String
  city      String
  state     String
  pincode   String
  country   String   @default("India")
  isDefault Boolean  @default(false)
}

model Attendance {
  id        String           @id @default(uuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id])
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
  user           User     @relation(fields: [userId], references: [id])
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
