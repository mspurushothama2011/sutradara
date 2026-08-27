# Sutradara Monorepo Structure & File Mapping Guide

This document defines the complete directory layout, file locations, responsibilities, and modular feature locations across the **Sutradara** e-commerce platform.

---

## 📁 Monorepo Overview

```
sutradara/
├── frontend/             # Next.js 15 App Router + React Three Fiber (Storefront & Unified Portal)
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
│   │   ├── page.tsx                # 3D scrolltelling landing page
│   │   ├── globals.css             # Global design tokens, typography, luxury theme
│   │   │
│   │   ├── (store)/                # Customer Storefront Routes
│   │   │   ├── catalog/            # /catalog (Filter by craft, fabric, zari, region)
│   │   │   ├── product/[slug]/     # /product/[slug] (Silk Mark, video drape, 1-of-1 badge)
│   │   │   ├── collections/[tag]/  # /collections/[tag] (Diwali, Wedding, Festive edits)
│   │   │   ├── cart/               # /cart (Shopping cart with coupon engine)
│   │   │   ├── checkout/           # /checkout (Address, pincode check, Razorpay modal)
│   │   │   └── track/[orderId]/    # /track/[orderId] (Live courier tracker & video log)
│   │   │
│   │   └── portal/                 # Unified Portal Shell (Admin & Staff)
│   │       ├── login/              # /portal/login (Unified login screen)
│   │       ├── dashboard/          # /portal/dashboard (Role-filtered metrics & work pulse)
│   │       ├── catalog/            # /portal/catalog (Full saree editor & media uploader)
│   │       ├── quick-stock/        # /portal/quick-stock (Mobile floor fast stock toggle)
│   │       ├── marketing/          # /portal/marketing (Coupons, banners, deal countdowns)
│   │       ├── orders/             # /portal/orders (Fulfillment, inspection video, labels)
│   │       ├── tracking/           # /portal/tracking (Live delivery sync & NDR desk)
│   │       ├── staff-hr/           # /portal/staff-hr (Attendance clock in/out, salary calc)
│   │       ├── work-logs/          # /portal/work-logs (Daily task submissions)
│   │       ├── noticeboard/        # /portal/noticeboard (Team announcements & chat)
│   │       └── audit-logs/         # /portal/audit-logs (Security & change audit trail)
│   │
│   ├── components/
│   │   ├── landing/
│   │   │   ├── ScrollCanvas.tsx    # Three.js R3F GPU texture renderer with weighted lerp
│   │   │   ├── Overlays.tsx        # Floating brand storytelling text layers
│   │   │   ├── Preloader.tsx       # Loading screen with frame progress bar
│   │   │   └── ScrollCue.tsx       # Animated scroll indicator
│   │   ├── portal/
│   │   │   ├── PortalLayout.tsx    # Dynamic sidebar layout filtering items by capability
│   │   │   ├── CapabilityGuard.tsx # Component wrapper showing/hiding by permission
│   │   │   └── Header.tsx          # Staff profile, clock-in status & notifications
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Footer.tsx          # Minimal brand footer
│   │
│   ├── hooks/
│   │   ├── useScrollProgress.ts    # Scroll range tracker (0.0 -> 1.0)
│   │   └── usePermissions.ts       # Hook to check user capability flags
│   │
│   └── lib/
│       └── api.ts                  # Axios/fetch API client with auth token interceptors
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
│   ├── routes/
│   │   ├── auth.routes.ts          # /api/v1/auth (Login, logout, refresh, staff create)
│   │   ├── products.routes.ts      # /api/v1/products (Catalog CRUD & Floor stock toggle)
│   │   ├── marketing.routes.ts     # /api/v1/marketing (Coupons, flash deals, banners)
│   │   ├── orders.routes.ts        # /api/v1/orders (Checkout, labels, video inspection)
│   │   ├── payments.routes.ts      # /api/v1/payments (Razorpay order creation & HMAC webhook)
│   │   ├── tracking.routes.ts      # /api/v1/tracking (Shiprocket webhook, live status, OTP)
│   │   ├── staff.routes.ts         # /api/v1/staff (Attendance, salary computation, work logs)
│   │   ├── announcements.routes.ts # /api/v1/announcements (Noticeboard & order chat)
│   │   └── audit.routes.ts         # /api/v1/audit (Security & change logs)
│   │
│   ├── controllers/                # Business logic handlers for each route
│   ├── services/                   # Razorpay, Shiprocket, Cloudinary & Email integrations
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
    └── index.ts                    # Shared types (User, Capability, Product, Order, Coupon, Attendance)
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
└── PROJECT_STRUCTURE.md            # This file
```

---

## 🚀 Running the Development Environments

### Frontend (Next.js 15)
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

### Backend (Node.js Express)
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:4000
```
