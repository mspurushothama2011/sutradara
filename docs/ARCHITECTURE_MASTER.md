# Sutradara — Master Architecture & Technical Blueprint

This is the definitive architectural specification for the **Sutradara** handloom saree e-commerce platform.

---

## 🏛️ 1. High-Level System Architecture

```
[ Global Shoppers & Staff ]
            │
            ▼
┌────────────────────────────────────────────────────────────────────────┐
│ CLOUDFLARE EDGE REVERSE PROXY & WAF (sutradara.in)                      │
│ • Anycast DNS & Edge Caching (Mumbai, Delhi, Bengaluru, Chennai CDN)   │
│ • L3/L4/L7 DDoS Shield + Turnstile CAPTCHA + Edge SSL/TLS 1.3          │
│ • Firewall Rules (Rate Limiting, Geo-Fencing, Webhook Bypass)          │
└────────────────────┬───────────────────────────────────┬───────────────┘
                     │ (Static/Page Requests)            │ (API Requests)
                     ▼                                   ▼
┌────────────────────────────────────────┐ ┌─────────────────────────────┐
│ FRONTEND: Next.js 15 App Router        │ │ BACKEND: Node.js + Express  │
│ (React 19 + TypeScript + R3F Three.js) │ │ (TypeScript + Prisma ORM)   │
│ • 3D Scroll Canvas (240 Loom Frames)   │ │ • Granular Capability RBAC  │
│ • Customer Domain (/(customer)/*)      │ │ • Master Order & Fulfillment│
│ • Master Checkout & Address Engine     │ │ • Staff HR & Work Log Engine│
│ • Admin Domain (/(admin)/portal/*)     │ │ • Audit & Security Logging  │
│ • Live Order Tracking (/track/*)       │ │                             │
└────────────────────────────────────────┘ └──────────────┬──────────────┘
                                                          │ SSL Mode Require
                                                          ▼
                                           ┌─────────────────────────────┐
                                           │ DATABASE: PostgreSQL        │
                                           │ • Relational Schema         │
                                           │ • Parameterized Queries     │
                                           │ • JSONB Tracking Timelines  │
                                           └─────────────────────────────┘
```

---

## 📂 2. Clean Monorepo Layout

```
sutradara/
├── frontend/                     # Next.js 15 Frontend Application
│   ├── public/
│   │   └── frames/               # 240 scroll loom frames (WebP/JPG)
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── (customer)/       # Storefront, catalog, checkout, track
│   │   │   └── (admin)/portal/   # Admin dashboard, orders, inventory, staff
│   │   ├── components/           # UI & 3D WebGL Canvas components
│   │   ├── context/              # Cart & Buy-Now context state
│   │   └── lib/                  # API clients, Indian locations, Razorpay loader
│   └── package.json
│
├── backend/                      # Node.js + Express API Backend
│   ├── src/
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/           # Auth, RBAC capabilities, rate limiting, validate
│   │   ├── routes/               # Customer, Admin & Public REST endpoints
│   │   ├── services/             # Razorpay, Cloudinary & Logistics services
│   │   └── prisma/               # schema.prisma database schema & migrations
│   └── package.json
│
├── shared/                       # Shared TypeScript types & interfaces
│   └── types/index.ts            # Common models across Frontend & Backend
│
└── docs/                         # Master Documentation Hub
    ├── ARCHITECTURE_MASTER.md
    ├── CLOUDFLARE_AND_INFRASTRUCTURE.md
    ├── SECURITY_AND_COMPLIANCE.md
    ├── BUSINESS_MODULES_SPEC.md
    ├── ENVIRONMENT_AND_SECRETS.md
    ├── IMPLEMENTATION_ROADMAP.md
    ├── PAYMENT_AND_LOGISTICS_INTEGRATION_SPEC.md
    └── PROJECT_STRUCTURE.md
```

---

## 🔑 3. Core Technical Decisions & Rationale

| Layer | Chosen Technology | Rationale |
| :--- | :--- | :--- |
| **Edge / CDN** | **Cloudflare (Free Tier)** | Zero-cost enterprise DDoS, local Indian CDN nodes, bot fight mode, Turnstile. |
| **Frontend** | **Next.js 15 (App Router) + TS** | SSR/SSG for search engine rankings on saree terms + React 19 component architecture. |
| **Domain Separation** | **Route Group Architecture** | Clean physical isolation between `(customer)` storefront and `(admin)/portal` workspaces. |
| **3D Experience** | **Three.js / React Three Fiber** | GPU texture rendering for 240 loom frames; auto DPI handling. |
| **Backend** | **Node.js + Express + TS** | Dedicated, long-running server control; no serverless execution timeout limits. |
| **Database** | **PostgreSQL** | High-integrity relational transactions for orders, stock counts, and JSONB tracking histories. |
| **ORM** | **Prisma** | End-to-end type safety, automated migrations, parameterized query security. |
| **Payments** | **Razorpay** | Best UPI / Card / Netbanking / EMI support for Indian commerce with HMAC webhooks. |
| **Logistics Desk** | **Multi-Carrier Dispatch Desk** | In-house multi-courier tracking (BlueDart, Delhivery, DTDC, Speed Post) with public satellite timelines. |
