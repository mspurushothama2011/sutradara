## Why

Patrons of the Sutraಧಾರ luxury handloom boutique require a dedicated registration and authentication experience with Google One-Tap/OAuth 2.0 alongside email OTP. To protect the platform against automated bot sweeps and OTP SMS/email exhaustion attacks, Cloudflare Turnstile CAPTCHA verification must guard OTP generation. Furthermore, to comply with privacy rights (India DPDP Act 2023 & GDPR Right to Erasure) while adhering to mandatory 7-year GST/tax audit retention, patrons must be able to deactivate/delete their accounts through a secure two-step confirmation (typing "DELETE" + OTP verification) with soft-deletion and PII anonymization. To ensure order invoices remain immutable regardless of future profile edits or account deactivation, orders must capture a snapshot of the customer's name, email, and phone at checkout.

## What Changes

- **Dedicated Registration Page (`/register` / `/signup`)**: A luxury onboarding page collecting Full Name, Mobile Number, and Email with Turnstile CAPTCHA and patron privilege badges.
- **Google Sign-In & Registration (Google OAuth 2.0 / GIS)**: 1-click Google authentication on `/login`, `/register`, and `/checkout` with backend token verification and automatic customer account linking.
- **Cloudflare Turnstile CAPTCHA Integration**: Frontline bot defense requiring Turnstile token verification on `POST /api/v1/customer/auth/send-otp` before OTP generation.
- **Customer Account Deletion & Anonymization Flow**: Two-tier verification (type "DELETE" + confirm via OTP) that marks the customer as deactivated (`deletedAt`), anonymizes PII, purges delivery address records, and revokes JWT sessions while retaining order relationships.
- **Order Customer Snapshot**: Adding `customerName`, `customerEmail`, and `customerPhone` columns to the `Order` model in Prisma, populated at checkout time to guarantee permanent historical fidelity.

## Capabilities

### New Capabilities
- `customer-auth-and-registration`: Dedicated registration page, login page, Google OAuth 2.0 sign-in/up, and Cloudflare Turnstile CAPTCHA verification before OTP generation.
- `customer-account-deletion`: Secure 2-step account deactivation and PII anonymization preserving tax/order history.
- `order-customer-snapshot`: Snapshotting customer identity (name, email, phone) directly on the Order model at checkout.

### Modified Capabilities
<!-- No requirement changes to existing portal-auth-rbac or staff-operations specs -->

## Impact

- **Database / Prisma Schema**:
  - `Customer`: Add `deletedAt DateTime?`, `googleId String?` (optional index).
  - `Order`: Add `customerName String?`, `customerEmail String?`, `customerPhone String?`.
- **Backend APIs**:
  - `POST /api/v1/customer/auth/send-otp` (updated with Turnstile CAPTCHA token validation).
  - `POST /api/v1/customer/auth/google` (new: Google ID Token verification via GIS).
  - `POST /api/v1/customer/account/delete-request-otp` (new: sends OTP for deletion).
  - `DELETE /api/v1/customer/account` (new: verifies "DELETE" phrase + deletion OTP, anonymizes profile, purges addresses).
  - `POST /api/v1/orders` (updated: snapshots customerName, customerEmail, customerPhone from body or verified profile).
- **Frontend App**:
  - `src/app/register/page.tsx` (new: luxury registration page).
  - `src/app/login/page.tsx` (updated: Turnstile CAPTCHA, Google One-Tap/button).
  - `src/app/account/page.tsx` (updated: Account Deletion modal with 2-step verification).
  - `src/components/auth/TurnstileCaptcha.tsx` (new: Cloudflare Turnstile widget with graceful dev fallback).
  - `src/components/auth/GoogleSignInButton.tsx` (new: Google GIS button component).
- **Dependencies**:
  - Backend: `google-auth-library` or fetch-based Google token verification.
  - Frontend: `@marsidev/react-turnstile` or native Cloudflare Turnstile script integration.
