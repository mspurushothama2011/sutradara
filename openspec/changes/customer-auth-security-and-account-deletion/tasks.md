## 1. Database Schema & Shared Types

- [x] 1.1 Update Prisma schema in `backend/src/prisma/schema.prisma` with `deletedAt DateTime?` on `Customer` and `customerName String?`, `customerEmail String?`, `customerPhone String?` on `Order`
- [x] 1.2 Run Prisma schema push/generate to update Prisma client
- [x] 1.3 Update shared type definitions in `shared/types/index.ts` for Customer, Order snapshot fields, and Turnstile/Google auth payloads

## 2. Backend Security & Turnstile Verification Middleware

- [x] 2.1 Implement Cloudflare Turnstile verification utility in `backend/src/utils/turnstile.ts` with test key dev fallback
- [x] 2.2 Update `POST /api/v1/customer/auth/send-otp` in `customer-auth.controller.ts` to require and verify `turnstileToken` before generating OTP
- [x] 2.3 Add Google ID Token verification utility in `backend/src/utils/google-auth.ts` and `POST /api/v1/customer/auth/google` endpoint in `customer-auth.controller.ts`

## 3. Backend Account Deletion & Order Snapshot Endpoints

- [x] 3.1 Implement `POST /api/v1/customer/account/delete-request-otp` to generate and send account deletion OTP
- [x] 3.2 Implement `DELETE /api/v1/customer/account` in `customer-auth.controller.ts` to verify "DELETE" phrase + OTP, anonymize PII, purge `Address` records, set `deletedAt`, and invalidate sessions
- [x] 3.3 Update `POST /api/v1/orders` and order creation services to capture and snapshot `customerName`, `customerEmail`, and `customerPhone` directly on `Order`

## 4. Frontend Turnstile & Google Sign-In Components

- [x] 4.1 Create `TurnstileCaptcha.tsx` component in `frontend/src/components/auth/` with script loading and dev fallback
- [x] 4.2 Create `GoogleAuthButton.tsx` component in `frontend/src/components/auth/` for Google Identity Services 1-click authentication
- [x] 4.3 Update API client in `frontend/src/lib/api.ts` to handle deletion endpoints and Google auth payloads

## 5. Frontend Dedicated Registration Page & Login Upgrades

- [x] 5.1 Build dedicated `/register` page (`frontend/src/app/register/page.tsx`) with Full Name, Phone, Email, Turnstile CAPTCHA, OTP step, and Google button
- [x] 5.2 Upgrade `/login` page (`frontend/src/app/login/page.tsx`) with Turnstile CAPTCHA, Google One-Tap/Button, and link to `/register`
- [x] 5.3 Add Google Auth button and Turnstile CAPTCHA to checkout authentication step if unauthenticated

## 6. Frontend Account Deletion Modal & Checkout Verification

- [x] 6.1 Implement 2-step Account Deletion confirmation modal on `/account` page (`frontend/src/app/account/page.tsx`) requiring typing "DELETE" and entering deletion OTP
- [x] 6.2 Update Checkout flow (`frontend/src/app/checkout/page.tsx`) to pass snapshot customer details to order creation
- [x] 6.3 Update Order Details and Customer Dashboard to display snapshot contact information

## 7. Verification & End-to-End Testing

- [x] 7.1 Verify Turnstile bot prevention blocks automated OTP generation without valid token
- [x] 7.2 Verify Google Sign-In and Registration flow creates and logs in customer
- [x] 7.3 Verify 2-step Account Deletion anonymizes customer PII, purges addresses, and logs out while preserving historical orders
- [x] 7.4 Verify newly created orders retain permanent immutable snapshot customer name, email, and phone
