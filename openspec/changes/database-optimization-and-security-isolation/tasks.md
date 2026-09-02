## 1. Database Schema & Prisma Architecture

- [ ] 1.1 Update `backend/src/prisma/schema.prisma` with `Customer`, `StaffAccount`, `ProductProcurement`, `Category`, `SubCategory`, and JSONB `trackingHistory` on `Order`
- [ ] 1.2 Update shared domain types in `shared/types/index.ts` to mirror the new separated models
- [ ] 1.3 Update `DATABASE_SPECIFICATION.md` with the new optimized schema and procurement isolation details

## 2. Identity Segregation (Customer vs Staff)

- [ ] 2.1 Update `backend/src/controllers/customer/customer-auth.controller.ts` to query and persist to `Customer`
- [ ] 2.2 Update `backend/src/controllers/auth.controller.ts` (portal auth) to authenticate exclusively against `StaffAccount`
- [ ] 2.3 Update staff management, attendance, work log, and audit log controllers to associate with `StaffAccount`

## 3. Wholesale Procurement & Margin Isolation

- [ ] 3.1 Extract `costPrice` out of public product controllers (`backend/src/controllers/products.controller.ts`)
- [ ] 3.2 Create protected procurement controller `backend/src/controllers/portal/procurement.controller.ts` requiring `finance:view`

## 4. Category Hierarchy & Order Tracking Optimization

- [ ] 4.1 Implement `Category` and `SubCategory` routes with max-3 validation guard
- [ ] 4.2 Update `backend/src/controllers/customer/orders.controller.ts` to append to JSONB `trackingHistory` and read timelines directly

## 5. Verification & Testing

- [ ] 5.1 Run TypeScript type check (`npx tsc --noEmit`) across `backend/` and `frontend/`
- [ ] 5.2 Verify Customer OTP login, Staff portal login, public product catalog, and order tracking responses
