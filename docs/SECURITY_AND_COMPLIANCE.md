# Sutradara — Security Architecture & Compliance Standard

This document details all security protocols, authentication mechanics, cryptography implementations, and compliance rules.

---

## 🔐 1. Authentication & Granular RBAC Engine

### A. JWT Architecture & Storage Strategy
* **Access Token:** Short-lived (15 minutes). Sent in Authorization header or checked via secure cookies.
* **Refresh Token:** Long-lived (7 days). Stored in **`httpOnly; Secure; SameSite=Strict`** cookies. JavaScript (`document.cookie`) has zero access, neutralizing XSS token theft.
* **Token Rotation:** Every time a refresh token is used to issue a new access token, the old refresh token is invalidated in the database.

### B. Capability-Based Permission Matrix
Access is evaluated per **Capability Flag**, not just a broad role:

```typescript
export const CAPABILITIES = {
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_EDIT: 'products:create_edit',
  INVENTORY_QUICK_STOCK: 'inventory:quick_update',
  ORDERS_MANAGE: 'orders:manage',
  MARKETING_MANAGE: 'marketing:manage',
  FINANCE_VIEW: 'finance:view',             // Restricts cost price & profit margin
  STAFF_ATTENDANCE_VIEW: 'staff:attendance_view',
  STAFF_PAYROLL_MANAGE: 'staff:payroll_manage',
  ANNOUNCEMENTS_POST: 'announcements:post',
  AUDIT_LOG_VIEW: 'audit:view'
} as const;
```

---

## 💳 2. Payment Fraud Prevention (Zero Client Trust)

### A. Server-Side Price Calculation
1. Client sends only: `[ { productId: "banarasi-kadhwa-01", quantity: 1 } ]`.
2. Backend queries the database directly to fetch the real `sellingPrice`.
3. Total amount is computed on the server.
4. Backend invokes Razorpay API to generate `razorpay_order_id` with the authentic amount.
5. *Result:* Any browser DevTools price tampering is mathematically impossible.

### B. Webhook Cryptographic Verification (HMAC-SHA256)
All Razorpay status updates (e.g. `payment.captured`) are cryptographically verified before touching database order state:

```typescript
import crypto from 'crypto';

export function verifyPaymentWebhook(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## 🛡️ 3. Application Hardening & OWASP Mitigations

| Vulnerability | Attack Vector | Sutradara Implementation Defense |
| :--- | :--- | :--- |
| **SQL Injection** | Attacker injects SQL fragments | **Prisma ORM:** 100% parameterized queries. Zero raw string interpolation. |
| **Cross-Site Scripting (XSS)** | Malicious HTML injected in descriptions/reviews | **React Auto-Escaping** + **sanitize-html** library on all rich text inputs before database write. |
| **Cross-Site Request Forgery (CSRF)** | Third-party site triggers forged requests | `SameSite=Strict` cookie policy prevents browsers from attaching credentials to foreign requests. |
| **Mass Assignment** | Client sends `{ role: "ADMIN" }` in registration | **Zod Schemas:** Strict object parsing strips all non-whitelisted request keys. |
| **Clickjacking** | Site framed inside an invisible malicious iframe | `X-Frame-Options: DENY` and `Content-Security-Policy: frame-ancestors 'none'`. |
| **MIME Sniffing** | Browser executes malicious upload as script | `X-Content-Type-Options: nosniff`. |

---

## 📜 4. Immutable Audit Trail

Every sensitive change triggers an entry in the `AuditLog` table:
* **Fields Captured:** `id`, `userId`, `action` (e.g. `PRICE_CHANGE`, `STOCK_OVERRIDE`, `ROLE_UPDATE`), `entityId`, `oldValues` (JSON), `newValues` (JSON), `ipAddress`, `createdAt`.
* Staff cannot delete or edit audit records.
