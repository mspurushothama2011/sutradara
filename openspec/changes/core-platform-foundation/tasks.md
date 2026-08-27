## 1. Backend Database & Prisma Setup

- [x] 1.1 Complete PostgreSQL models in `backend/src/prisma/schema.prisma` (`User`, `Product`, `Order`, `OrderItem`, `Coupon`, `Attendance`, `WorkLog`, `Announcement`, `AuditLog`)
- [x] 1.2 Generate Prisma client and create initial database migration
- [x] 1.3 Create seed script `backend/src/prisma/seed.ts` with initial Admin and Staff demo accounts

## 2. Backend Server & Auth API

- [x] 2.1 Implement JWT token utility (`signAccessToken`, `signRefreshToken`, `verifyToken`) in `backend/src/utils/jwt.ts`
- [x] 2.2 Create authentication and capability RBAC middleware `requireAuth` and `requireCapability` in `backend/src/middleware/auth.middleware.ts`
- [x] 2.3 Implement authentication controller and routes (`POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/auth/me`)
- [x] 2.4 Configure Express server in `backend/src/index.ts` with CORS, cookie-parser, and rate limiting

## 3. Frontend Unified Portal Foundation

- [x] 3.1 Implement capability permissions hook `usePermissions.ts` in `frontend/src/hooks/`
- [x] 3.2 Create API client utility `frontend/src/lib/api.ts` with credentials interceptor
- [x] 3.3 Build Unified Portal Shell layout `frontend/src/app/portal/layout.tsx` with dynamic capability-filtered sidebar
- [x] 3.4 Build luxury styled login page `frontend/src/app/portal/login/page.tsx`
- [x] 3.5 Build placeholder dashboard overview `frontend/src/app/portal/dashboard/page.tsx` displaying user role, active capabilities, and quick stats

## 4. Verification & Testing

- [x] 4.1 Verify backend auth endpoints (login, refresh, me) with valid and invalid credentials
- [x] 4.2 Test capability-based route protection on backend
- [x] 4.3 Verify portal login and dynamic sidebar rendering on frontend
