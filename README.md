# Sutradara — Luxury Handloom Saree E-Commerce Platform

A production-grade, modular monorepo for the **Sutradara** luxury handloom saree platform with physical domain separation, 3D scrolltelling, high-assurance checkout, multi-carrier logistics tracking, and staff operations.

---

## 📁 Repository Structure

```
sutradara/
├── frontend/             # Next.js 15 App Router + React Three Fiber (Storefront & Admin Portals)
├── backend/              # Node.js + Express + TypeScript + Prisma ORM (API Engine & PostgreSQL)
├── shared/               # Shared TypeScript types & interfaces
└── docs/                 # Complete Architectural & Operational Documentation Hub
```

---

## ✨ Key Platform Features

1. **Physical Domain & Route Group Separation:**
   - **Customer Storefront (`/`)**: 3D loom scroll storytelling, curated catalog with region/craft filters, quick-buy modal, shopping bag, and live satellite order tracking (`/track/[orderId]`).
   - **Master Checkout (`/checkout`)**: Guest email OTP verification with Cloudflare Turnstile, Google OAuth, multi-recipient address book, 6-digit PIN code lookup, and intelligent nationwide canonical city autocomplete.
   - **Admin Management Portal (`/portal/*`)**: Executive dashboard, heirloom procurement catalog, rapid shop floor inventory toggle, multi-carrier order dispatch desk, marketing campaign scheduler, staff attendance/payroll, and cryptographic audit logging.

2. **Intelligent Location & Standardization Engine:**
   - Real-time normalization of 300+ Indian cities and alias synonyms (e.g. typing `Bangalore` automatically normalizes to `Bengaluru` and sets state to `Karnataka`).

3. **High-Assurance Order Lifecycle & Fulfillment:**
   - 8-stage verifiable state machine: `PENDING` $\rightarrow$ `PAID` $\rightarrow$ `QC_INSPECTED` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED` (+ `CANCELLED`, `RETURNED`, `NDR Exceptions`).
   - Multi-carrier dispatching supporting Bluedart Apex Air, Delhivery, DTDC, Speed Post, The Professional Couriers, Shadowfax, Xpressbees, and In-House Handover.
   - Pre-shipment ultra-HD QC inspection video evidence recording.

---

## 📚 Master Documentation Suite

All system details, database schemas, security configurations, and blueprints are documented in [`docs/`](./docs/):

1. **[`ARCHITECTURE_MASTER.md`](./docs/ARCHITECTURE_MASTER.md)** — High-level architecture, system topology, and tech stack rationale.
2. **[`PROJECT_STRUCTURE.md`](./docs/PROJECT_STRUCTURE.md)** — Complete file and directory layout mapping across frontend, backend, and shared modules.
3. **[`BUSINESS_MODULES_SPEC.md`](./docs/BUSINESS_MODULES_SPEC.md)** — Complete functional specification for all storefront and administrative modules.
4. **[`DATABASE_SPECIFICATION.md`](./docs/DATABASE_SPECIFICATION.md)** — Exhaustive PostgreSQL 16+ schema specification (15 tables, enums, constraints, JSONB timelines).
5. **[`PAYMENT_AND_LOGISTICS_INTEGRATION_SPEC.md`](./docs/PAYMENT_AND_LOGISTICS_INTEGRATION_SPEC.md)** — Payment state machines, Razorpay webhook signatures, and multi-carrier dispatch protocols.
6. **[`CLOUDFLARE_AND_INFRASTRUCTURE.md`](./docs/CLOUDFLARE_AND_INFRASTRUCTURE.md)** — Cloudflare WAF, DNS, SSL/TLS, DDoS, and edge caching setup.
7. **[`SECURITY_AND_COMPLIANCE.md`](./docs/SECURITY_AND_COMPLIANCE.md)** — JWT HttpOnly cookies, capability RBAC, zero-client price trust, and OWASP Top 10 hardening.
8. **[`ENVIRONMENT_AND_SECRETS.md`](./docs/ENVIRONMENT_AND_SECRETS.md)** — Catalog of environment variables and secret management rules.
9. **[`IMPLEMENTATION_ROADMAP.md`](./docs/IMPLEMENTATION_ROADMAP.md)** — Step-by-step milestone execution roadmap.

---

## 🚀 Quick Start

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:4000
```

### 3. Database Studio
```bash
cd backend
npx prisma studio --schema=src/prisma/schema.prisma
# Running on http://localhost:5555
```
