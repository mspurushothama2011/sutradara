## Why

The platform needs a complete, luxury customer storefront experience (Guest Browsing & Cart, Customer Authentication with Email OTP, Account & Order History, Category Cluster Directory, Curated Collections, Search, Brand Trust & Provenance, and Legal Policies) backed by bank-grade security:
1. Multi-factor composite rate limiting (Account + Device Cookie + Hardware Fingerprint) to eliminate false bans on shared IPs (NAT/Wi-Fi).
2. 1-of-1 Heirloom pessimistic 10-minute reservation locks to prevent checkout race conditions.
3. 3-stage database re-verification ensuring Zero-Client-Price Trust.
4. Physical Barcode/QR scanner integration for warehouse floor stock updates and order dispatch.
5. Strict domain folder separation across frontend and backend.

## What Changes

* **Domain Folder Separation:**
  * **Backend:** Organizes controllers and routes into `backend/src/controllers/customer/` and `backend/src/controllers/portal/`, and `backend/src/routes/customer/` and `backend/src/routes/portal/`.
  * **Frontend:** Uses Next.js Route Groups `frontend/src/app/(storefront)/` for all customer-facing routes and `frontend/src/app/portal/` for internal staff/admin operations.
* **Customer Guest Flow & Cart:**
  * Visitors can freely browse all sarees, search clusters, view Silk Mark certificates, and add items to cart without logging in.
  * Checkout is protected by a mandatory Customer Login gateway.
* **Security & Verification Suite:**
  * **Email OTP Authentication:** Fast, branded 6-digit verification code with 5-minute TTL.
  * **Multi-Factor Composite Rate Limiting:** Limits per (Target Email + Device ID + Hardware Hash), preventing brute force while protecting shared NAT/Wi-Fi IPs from false blocks.
  * **1-of-1 Heirloom Double-Spend Lock:** 10-minute pessimistic checkout reservation lock.
  * **3-Stage Zero-Client-Price Trust:** Cart and Place Order prices/discounts/stock recalculated directly against the database in atomic transactions.
  * **Physical Barcode/QR Scanner:** Camera & USB scanner integration on `/portal/quick-stock` and `/portal/orders`.
* **Customer Storefront Suite:**
  * `/login`: Customer sign-in & email OTP authentication.
  * `/account` & `/account/orders`: Customer profile, saved addresses, and past order tracking history.
  * `/categories`: Craft cluster visual directory (Varanasi, Kanchipuram, Yeola, Chanderi).
  * `/collections` & `/collections/[slug]`: Curated collections (1-of-1 Vault, Bridal Sanctuary, Festive Silks).
  * `/search`: Instant live search by technique, motif, and region.
  * `/about` & `/authenticity`: Direct master weaver provenance story, Silk Mark guarantee, 2G gold zari testing standards.
  * `/privacy-policy`, `/terms`, `/refunds`, `/shipping`: Full legal and operational compliance.
  * Multi-column luxury footer across all storefront pages.

## Capabilities

### New Capabilities
- `customer-storefront-suite`: Complete customer authentication, account profile, order history, categories, collections, search, brand trust, and legal policies.
- `domain-folder-separation`: Structural division of backend and frontend into isolated customer and portal modules.
- `security-and-verification-engine`: Multi-factor composite rate limiting, 10-minute heirloom lock, 3-stage DB price validation, email OTP, and barcode/QR scanner integration.

### Modified Capabilities
<!-- None -->

## Impact

- **Backend:** Restructures backend into clean subdirectories (`customer/` and `portal/`), adds composite rate-limiting middleware, 10-minute product reservation lock, email OTP engine, and transactional checkout validation.
- **Frontend:** Houses customer pages under `app/(storefront)/` with a unified luxury navbar/footer, provides barcode scanner support on `/portal/quick-stock`, and protects staff routes under `app/portal/`.
