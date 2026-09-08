## Context

Sutraಧಾರ currently features passwordless email OTP verification on `/login` and inline within `/checkout`. To provide a world-class customer onboarding journey, defend against automated bot OTP spam, comply with data privacy laws (DPDP Act / GDPR) without violating Indian tax/GST audit retention regulations, and protect order records from downstream profile modifications, we are establishing a comprehensive customer identity and security layer.

## Goals / Non-Goals

**Goals:**
- Provide a dedicated `/register` page and upgraded `/login` page with Cloudflare Turnstile CAPTCHA and Google Sign-In (OAuth 2.0 / GIS).
- Enforce Cloudflare Turnstile verification on `POST /api/v1/customer/auth/send-otp` before OTP generation and email dispatch.
- Implement customer account deletion through a secure two-step verification (typing "DELETE" + Email OTP validation), executing soft deletion and PII anonymization in PostgreSQL while preserving historical order records.
- Snapshot customer identity attributes (`customerName`, `customerEmail`, `customerPhone`) directly in the `Order` table at checkout to ensure orders remain historically immutable.

**Non-Goals:**
- Replacing the staff portal authentication system (`portal-auth-rbac`). Staff authentication continues to use password/capability RBAC.
- Hard-deleting order records from the database upon customer account deletion (prohibited by GST audit laws).

## Decisions

### 1. Cloudflare Turnstile CAPTCHA Middleware
- **Decision**: Integrate Cloudflare Turnstile as the frontline CAPTCHA system.
- **Rationale**: Turnstile delivers zero friction for legitimate human patrons (no distorted characters or puzzles), is privacy-preserving, and completely free.
- **Backend Flow**: Frontend obtains a `turnstileToken` from widget and sends `{ email, turnstileToken }` to `POST /api/v1/customer/auth/send-otp`.
- **Backend Validation**: Validates `turnstileToken` against `https://challenges.cloudflare.com/turnstile/v0/siteverify` using `CLOUDFLARE_TURNSTILE_SECRET_KEY`.
- **Dev Fallback**: If `CLOUDFLARE_TURNSTILE_SECRET_KEY` is not set or set to test keys (`1x0000000000000000000000000000000AA`), allow graceful local validation so development is never blocked.

### 2. Google Identity Services (GIS) Sign-In
- **Decision**: Use Google Identity Services ID Token flow (`POST /api/v1/customer/auth/google`).
- **Rationale**: Frictionless 1-click authentication. Verified email and name are extracted from the cryptographic ID token.
- **Account Linking**: If a customer with the verified Google email already exists, link and authenticate immediately. If new, create customer with `isVerified = true`.
- **Session Duration**: Issues standard 30-day customer JWT (`role: 'CUSTOMER'`).

### 3. Account Deletion: 2-Step Soft Deletion & PII Anonymization
- **Decision**: Require user to type confirmation phrase "DELETE" and verify a dedicated deletion OTP before soft-deleting and anonymizing.
- **Rationale**: Prevents accidental deletion or unauthorized session hijacking deletions while fulfilling Right to Erasure requirements.
- **Database Action**:
  - `Customer.name` ➜ `"Deactivated Patron"`
  - `Customer.phone` ➜ `null`
  - `Customer.email` ➜ `"deleted_${customer.id}@anonymized.sutradara.in"`
  - `Customer.deletedAt` ➜ `DateTime.now()`
  - `Customer.isVerified` ➜ `false`
  - `Address` records linked to customer ➜ Cascade deleted to purge street addresses.
  - Revoke JWT and clear client-side storage.

### 4. Order Customer Snapshot at Checkout
- **Decision**: Add `customerName`, `customerEmail`, and `customerPhone` columns directly to the `Order` model in Prisma.
- **Rationale**: Prevents historical order invoices or staff shipping queues from being corrupted or altered if a user changes their name/phone or deletes their account later.
- **Checkout Action**: When `POST /api/v1/orders` creates an order, it saves the current patron's name, email, and recipient phone directly in the order record.

## Risks / Trade-offs

- **[Risk] Turnstile API Outage or Network Timeout** → **Mitigation**: Implement 5-second timeout on Cloudflare API verification call with graceful error feedback requesting the user to retry.
- **[Risk] User tries to log in with an anonymized/deleted account** → **Mitigation**: If user registers again with their original email in the future, Prisma upserts a fresh active `Customer` record without restoring old purged addresses.
- **[Risk] Google Sign-In missing client credentials in dev** → **Mitigation**: Frontend renders an interactive mock Google sign-in button when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is unset for rapid local testing.
