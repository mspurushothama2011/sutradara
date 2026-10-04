# Sutradara Monorepo Structure & File Mapping Guide

This document defines the complete directory layout, file locations, responsibilities, and modular feature locations across the **Sutradara** luxury handloom e-commerce platform.

---

## 📁 Monorepo Overview

```
sutradara/
├── frontend/             # Next.js 15 App Router + React Three Fiber (Storefront & Admin Portals)
├── backend/              # Node.js + Express + Prisma ORM (API Engine & Business Logic)
├── shared/               # Shared TypeScript types & constants
└── docs/                 # Master System Documentation & Architectural Specs
```

---

## 🎨 1. Frontend Structure (`frontend/`)

Built with **Next.js 15 (App Router)**, **TypeScript**, **React 19**, **Three.js / React Three Fiber**, and **Vanilla CSS**.

```
frontend/
├── public/
│   └── frames/                     # 240 loom animation frames (ezgif-frame-001.jpg -> 240.jpg)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root HTML shell, Google Fonts (Playfair + Inter), metadata
│   │   ├── globals.css             # Global design tokens, typography, luxury theme
│   │   │
│   │   ├── (customer)/             # Public Customer Storefront Domain
│   │   │   ├── page.tsx            # 3D scrolltelling landing page
│   │   │   ├── catalog/            # /catalog (Filter by craft, fabric, zari, region, price)
│   │   │   ├── product/[slug]/     # /product/[slug] (Silk Mark, video drape, 1-of-1 badge, quick-buy modal)
│   │   │   ├── bag/                # /bag (Shopping bag with live stock verification & coupon engine)
│   │   │   ├── checkout/           # /checkout (Master Checkout: Guest OTP / Google Auth, Saved Addresses, Canonical City Autocomplete, Razorpay)
│   │   │   ├── account/            # /account (Customer profile, multi-recipient address book, order history)
│   │   │   ├── track/[orderId]/    # /track/[orderId] (Live customer delivery timeline, courier status & QC video proof)
│   │   │   ├── login/              # /login (Customer passwordless OTP & Google login)
│   │   │   └── portal-access/      # /portal-access (Direct route to staff & admin portal)
│   │   │
│   │   └── (admin)/portal/         # Unified Admin & Staff Management Domain
│   │       ├── login/              # /portal/login (Staff & Admin credential verification)
│   │       ├── dashboard/          # /portal/dashboard (Executive KPI pulse & live alerts)
│   │       ├── catalog/            # /portal/catalog (Full heirloom catalog CRUD, procurement details & media)
│   │       ├── inventory/          # /portal/inventory (Rapid floor stock adjustment & 1-of-1 toggles)
│   │       ├── orders/             # /portal/orders (Orders queue & quick status/dispatch modal)
│   │       │   └── [orderId]/track/# /portal/orders/[orderId]/track (Admin Dispatch Desk, milestones & timeline logger)
│   │       ├── marketing/          # /portal/marketing (Coupons, festive campaigns, banners, flash deal timers)
│   │       ├── staff/              # /portal/staff (Staff attendance clock-in/out, leave approvals, payroll engine)
│   │       ├── finance/            # /portal/finance (Revenue breakdown, cost margins, profit analytics)
│   │       └── audit/              # /portal/audit (Cryptographic immutable audit trail of all staff actions)
│   │
│   ├── components/
│   │   ├── landing/
│   │   │   ├── LandingNavbar.tsx   # Customer storefront luxury navigation
│   │   │   ├── ScrollCanvas.tsx    # Three.js R3F GPU texture renderer with weighted lerp
│   │   │   ├── Overlays.tsx        # Floating brand storytelling text layers
│   │   │   └── Preloader.tsx       # Loading screen with frame progress bar
│   │   ├── shared/
│   │   │   ├── AddressAutocomplete.tsx # Intelligent luxury autocomplete with keyword highlighting & auto state sync
│   │   │   ├── ui/Footer.tsx       # Universal footer
│   │   │   └── ui/Modal.tsx        # Reusable accessible modal dialog
│   │   ├── auth/
│   │   │   ├── TurnstileCaptcha.tsx# Cloudflare Turnstile bot verification
│   │   │   └── GoogleAuthButton.tsx# Google One-Tap & OAuth button
│   │   └── portal/
│   │       ├── PortalLayout.tsx    # Dynamic sidebar layout filtering items by capability
│   │       └── CapabilityGuard.tsx # Component wrapper showing/hiding by permission
│   │
│   ├── context/
│   │   └── CartContext.tsx         # Universal cart state (Bag + Buy Now item management)
│   │
│   └── lib/
│       ├── api.ts                  # Axios/fetch API client with auth token interceptors
│       ├── india-locations.ts      # Comprehensive Indian States, 300+ Cities, Aliases & Canonical Standardizer
│       └── razorpay.ts             # Razorpay checkout script loader and modal launcher
│
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Frontend dependencies
```

---

## ⚙️ 2. Backend Structure (`backend/`)

Built with **Node.js**, **Express**, **TypeScript**, **Prisma ORM**, and **JWT Authentication**.

```
backend/
├── src/
│   ├── index.ts                    # Express server entry point, CORS & Cloudflare header parsing
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT verification & capability check (requireCapability)
│   │   ├── rateLimiter.ts          # Anti brute-force rate limiter
│   │   ├── validate.ts             # Zod input sanitization & mass-assignment filter
│   │   └── audit.middleware.ts     # Automatic change logging to AuditLog table
│   │
│    ├── routes/
│   │   ├── auth.routes.ts          # /api/v1/auth (Login, logout, refresh, staff create)
│   │   ├── customer/               # Customer domain endpoints
│   │   │   ├── auth.routes.ts      # /api/v1/customer/auth (OTP send/verify with duplicate collision check, Google OAuth, Profile, Address book)
│   │   │   └── orders.routes.ts    # /api/v1/customer/orders (Order placement, Live stock check)
│   │   ├── admin/                  # Admin domain endpoints
│   │   │   ├── dashboard.routes.ts # /api/v1/admin/dashboard (Real-time live operational telemetry & KPIs)
│   │   │   ├── products.routes.ts  # /api/v1/admin/products (Product CRUD & wholesale cost vault)
│   │   │   ├── orders.routes.ts    # /api/v1/admin/orders (Dispatch queue, AWB & tracking milestones)
│   │   │   ├── staff.routes.ts     # /api/v1/admin/staff (Staff HR, attendance, leaves & permissions)
│   │   │   ├── categories.routes.ts# /api/v1/admin/categories (4-tier hierarchy taxonomy tree)
│   │   │   ├── marketing.routes.ts # /api/v1/admin/marketing (Coupons, deals of day, banners)
│   │   │   ├── upload.routes.ts    # /api/v1/admin/uploads (Single & bulk image storage)
│   │   │   └── audit.routes.ts     # /api/v1/admin/audit (Immutable cryptographic audit trail)
│   │   ├── products.routes.ts      # /api/v1/products (Storefront catalog & filters)
│   │   ├── categories.routes.ts    # /api/v1/categories (Hierarchical category taxonomy tree)
│   │   ├── orders.routes.ts        # /api/v1/orders (Fulfillment, dispatch, milestone updates, live tracking)
│   │   └── payments.routes.ts      # /api/v1/payments (Razorpay order creation & HMAC webhook)
│   │
│   ├── controllers/                # Business logic handlers for customer & admin domains
│   │   ├── admin/dashboard.controller.ts # Real-time aggregation of orders, inventory, revenue, and staff telemetry
│   │   └── customer/customer-auth.controller.ts # OTP, Duplicate Email/Phone checks, Google Sign-in & Address book
│   ├── services/                   # Razorpay, Cloudinary, Email & Logistics services
│   │
│   └── prisma/
│       └── schema.prisma           # Master PostgreSQL database schema
│
├── tsconfig.json                   # TypeScript backend configuration
└── package.json                    # Backend dependencies
```

---

## 📦 3. Shared Structure (`shared/`)

Shared TypeScript interfaces between Frontend and Backend to guarantee type safety and eliminate code duplication.

```
shared/
└── types/
    └── index.ts                    # Shared types (User, Capability, Product, Order, OrderStatus, Coupon, Address, Attendance)
```

---

## 📚 4. Documentation Suite (`docs/`)

```
docs/
├── ARCHITECTURE_MASTER.md          # Topology, cloud infrastructure & component interaction
├── CLOUDFLARE_AND_INFRASTRUCTURE.md# WAF, DNS, SSL/TLS, DDoS, and edge caching setup
├── SECURITY_AND_COMPLIANCE.md      # RBAC, Zero-Client Price Trust, HMAC signatures, OWASP
├── BUSINESS_MODULES_SPEC.md        # Functional specification of all 8 core business modules
├── ENVIRONMENT_AND_SECRETS.md      # Full catalog of environment variables and keys
├── IMPLEMENTATION_ROADMAP.md       # Step-by-step milestone execution sequence
├── PAYMENT_AND_LOGISTICS_INTEGRATION_SPEC.md # Payment gateway & logistics fulfillment protocol
└── PROJECT_STRUCTURE.md            # This file
```

---

## 🚀 Running the Development Environments

### 1. Frontend:
```bash
cd frontend
npm run dev
# Running on http://localhost:3000
```

### 2. Backend:
```bash
cd backend
npm run dev
# Running on http://localhost:4000
```

### 3. Database Studio:
```bash
cd backend
npx prisma studio --schema=src/prisma/schema.prisma
# Running on http://localhost:5555
```
