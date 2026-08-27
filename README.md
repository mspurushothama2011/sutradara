# Sutradara — Handloom Saree E-Commerce Platform

A production-grade, modular monorepo for the **Sutradara** luxury handloom saree platform.

---

## 📁 Repository Structure

```
sutradara/
├── frontend/             # Next.js 15 App Router + React Three Fiber (Storefront & Portal)
├── backend/              # Node.js + Express + TypeScript + Prisma ORM (API Engine)
├── shared/               # Shared TypeScript types & interfaces
└── docs/                 # Complete Architectural & Operational Documentation Hub
```

---

## 📚 Master Documentation Suite

All system details, security configurations, and blueprints are organized in [`docs/`](./docs/):

1. **[`ARCHITECTURE_MASTER.md`](./docs/ARCHITECTURE_MASTER.md)** — High-level architecture, system topology, and tech stack rationale.
2. **[`CLOUDFLARE_AND_INFRASTRUCTURE.md`](./docs/CLOUDFLARE_AND_INFRASTRUCTURE.md)** — Cloudflare WAF, DNS, SSL/TLS, DDoS, and edge caching setup.
3. **[`SECURITY_AND_COMPLIANCE.md`](./docs/SECURITY_AND_COMPLIANCE.md)** — JWT HttpOnly cookies, capability RBAC, zero-client price trust, and OWASP Top 10 hardening.
4. **[`BUSINESS_MODULES_SPEC.md`](./docs/BUSINESS_MODULES_SPEC.md)** — Complete specification for all 8 business and staff modules.
5. **[`ENVIRONMENT_AND_SECRETS.md`](./docs/ENVIRONMENT_AND_SECRETS.md)** — Full catalog of environment variables and secret management rules.
6. **[`IMPLEMENTATION_ROADMAP.md`](./docs/IMPLEMENTATION_ROADMAP.md)** — Step-by-step milestone execution plan.

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
