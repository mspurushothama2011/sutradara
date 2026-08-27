## Context

The Sutradara monorepo requires a clean separation of concerns between external luxury shoppers and internal operations staff, reinforced by bank-grade security, anti-brute-force defense without shared IP collisions, and race condition prevention on high-value 1-of-1 heirlooms.

## Goals / Non-Goals

**Goals:**
- Separate backend controllers and routes into `customer/` and `portal/` subdirectories.
- Structure frontend into `app/(storefront)/` (customer layout, header, footer) and `app/portal/` (staff shell).
- Implement multi-factor composite rate limiting using `(email, _sutradara_did, browserFingerprint, ip)`.
- Implement Email OTP authentication for customer registration and login.
- Implement atomic 10-minute pessimistic checkout reservation locks for 1-of-1 heirlooms.
- Implement 3-stage database price/coupon re-verification (Zero-Client-Price Trust).
- Implement physical Barcode/QR camera and USB scanner for quick stock intake and fulfillment dispatch.
- Implement discovery pages (`/categories`, `/collections`, `/search`).
- Implement brand & legal pages (`/about`, `/authenticity`, `/contact`, `/privacy-policy`, `/terms`, `/refunds`, `/shipping`).

**Non-Goals:**
- Physical telecom SMS gateway binding in local environment (Email OTP is primary and verified via mock/transactional mailer).

## Decisions

1. **Decision: Next.js Route Groups `(storefront)` for Customer Pages**
   - *Rationale:* Allows all public pages to share a unified luxury navbar and multi-column footer while keeping URLs clean (e.g. `/catalog`, `/about`, `/account`) without an extra path prefix.
2. **Decision: Composite Multi-Factor Rate Limiter Middleware**
   - *Rationale:* Evaluates `targetEmail ? targetEmail:deviceId : ip:deviceId:fingerprint` so family/office networks on shared NATs are never locked out.
3. **Decision: 10-Minute Pessimistic Heirloom Reservation Locks**
   - *Rationale:* Protects 1-of-1 sarees from double-spend conditions during checkout.
