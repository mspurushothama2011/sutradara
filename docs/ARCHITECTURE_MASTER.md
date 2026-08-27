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
│ • L3/L4/L7 DDoS Shield + Bot Fight Mode + Edge SSL/TLS 1.3             │
│ • Firewall Rules (Rate Limiting, Geo-Fencing, Webhook Bypass)          │
└────────────────────┬───────────────────────────────────┬───────────────┘
                     │ (Static/Page Requests)            │ (API Requests)
                     ▼                                   ▼
┌────────────────────────────────────────┐ ┌─────────────────────────────┐
│ FRONTEND: Next.js 15 App Router        │ │ BACKEND: Node.js + Express  │
│ (React 19 + TypeScript + R3F Three.js) │ │ (TypeScript + Prisma ORM)   │
│ • 3D Scroll Canvas (240 Loom Frames)   │ │ • Granular Capability RBAC  │
│ • Dynamic Customer Catalog & Filters   │ │ • Payment & Shipping Engine │
│ • Unified Portal Shell (/portal/*)     │ │ • Staff HR & Work Log Engine│
│ • Live Order Tracking (/track/*)       │ │ • Audit & Security Logging  │
└────────────────────────────────────────┘ └──────────────┬──────────────┘
                                                          │ SSL Mode Require
                                                          ▼
                                           ┌─────────────────────────────┐
                                           │ DATABASE: PostgreSQL        │
                                           │ (Supabase Managed Engine)   │
                                           │ • Relational Schema         │
                                           │ • Parameterized Queries     │
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
│   │   ├── app/                  # Next.js App Router (pages, layouts)
│   │   ├── components/           # UI & 3D WebGL Canvas components
│   │   ├── modules/              # Pluggable feature modules
│   │   └── hooks/                # Custom React hooks (scroll, auth)
│   └── package.json
│
├── backend/                      # Node.js + Express API Backend
│   ├── src/
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/           # Auth, RBAC capabilities, rate limiting
│   │   ├── routes/               # Modular REST endpoints
│   │   ├── services/             # Razorpay, Shiprocket, Cloudinary integrations
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
    └── IMPLEMENTATION_ROADMAP.md
```

---

## 🔑 3. Core Technical Decisions & Rationale

| Layer | Chosen Technology | Rationale |
| :--- | :--- | :--- |
| **Edge / CDN** | **Cloudflare (Free Tier)** | Zero-cost enterprise DDoS, local Indian CDN nodes, bot fight mode. |
| **Frontend** | **Next.js 15 (App Router) + TS** | SSR/SSG for search engine rankings on saree terms + React 19 component architecture. |
| **3D Experience** | **Three.js / React Three Fiber** | GPU texture rendering for 240 loom frames; auto DPI handling. |
| **Backend** | **Node.js + Express + TS** | Dedicated, long-running server control; no serverless execution timeout limits. |
| **Database** | **PostgreSQL (via Supabase)** | High-integrity relational transactions for orders, stock counts, and payments. |
| **ORM** | **Prisma** | End-to-end type safety, automated migrations, parameterized query security. |
| **Payments** | **Razorpay** | Best UPI / Card / Netbanking / EMI support for Indian commerce with HMAC webhooks. |
| **Shipping** | **Shiprocket API** | Multi-courier aggregation (BlueDart, Delhivery), automated AWB & tracking webhooks. |
