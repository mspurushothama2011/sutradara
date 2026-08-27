## Context

Sutradara requires a unified backend and portal engine to transition from a static 3D landing page into a live commerce and operations platform. The system must support Admin and Staff logging into a single portal interface with dynamic capability-based access control (RBAC), supported by a PostgreSQL database managed via Prisma ORM and an Express API server.

## Goals / Non-Goals

**Goals:**
- Initialize the complete PostgreSQL Prisma schema (`User`, `Product`, `Order`, `OrderItem`, `Coupon`, `Attendance`, `WorkLog`, `Announcement`, `AuditLog`).
- Implement unified JWT authentication with `httpOnly; Secure; SameSite=Strict` cookies and granular capability checks (`requireCapability`).
- Build the Next.js Unified Portal shell (`/portal/*`) featuring dynamic sidebar navigation filtered by active capabilities.
- Create `/portal/login` with luxury obsidian & gold styling.

**Non-Goals:**
- Razorpay payment gateway webhook integration (deferred to Milestone 5).
- Live Shiprocket courier API sync (deferred to Milestone 5).
- Customer-facing checkout flow (deferred to Milestone 5).

## Decisions

1. **Decision: Express.js Backend over Next.js API Routes**
   - *Rationale:* Long-running server architecture gives complete ownership over middleware, connection pooling, rate limiting, and background workers without serverless execution timeout limits.
   - *Alternatives Considered:* Next.js App Router route handlers (rejected due to 10s serverless timeout limitations for future background tasks and webhooks).

2. **Decision: Granular Capability Flags over Rigid Roles**
   - *Rationale:* Rather than a binary "ADMIN" vs "STAFF" role, assigning individual capabilities (`products:create_edit`, `finance:view`, `inventory:quick_update`) allows the owner to give specific staff members customized access without exposing sensitive profit data.
   - *Alternatives Considered:* Standard 3-role RBAC (rejected because it lacks flexibility when specific staff members need custom privileges).

3. **Decision: HttpOnly Secure Cookie Storage for Session Tokens**
   - *Rationale:* Storing refresh tokens in `httpOnly` cookies makes them completely inaccessible to client-side JavaScript, eliminating token theft via Cross-Site Scripting (XSS).
   - *Alternatives Considered:* `localStorage` (rejected due to high vulnerability to XSS attacks).

## Risks / Trade-offs

- **[Risk] Cross-Origin Cookie Sharing between `localhost:3000` (Frontend) and `localhost:4000` (Backend)**
  - *Mitigation:* Configure Express `cors` with `credentials: true` and explicit origin whitelisting (`http://localhost:3000`), with `SameSite: 'lax'` in development and `'strict'` in production behind Cloudflare.
- **[Risk] Database Migration Desynchronization**
  - *Mitigation:* Use Prisma Migrate (`prisma migrate dev`) to maintain schema migrations as version-controlled SQL files.
