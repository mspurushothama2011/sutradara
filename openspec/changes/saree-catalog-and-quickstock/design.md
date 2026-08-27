## Context

Milestone 2 bridges the gap between administrative inventory management and customer storefront discovery. The product engine must serve two distinct user interfaces:
1. **Administrative & Floor Interfaces:** High-density management tables with cost price visibility controls and mobile-friendly 1-tap stock counter.
2. **Luxury Customer Storefront:** Fast, visual-first catalog browsing and product showcase with high-trust handloom badges.

## Goals / Non-Goals

**Goals:**
- Implement `products.controller.ts` and `products.routes.ts` with filtering, search, and capability-controlled cost price redaction.
- Create `/portal/catalog` for adding/editing sarees with multi-image URLs, Silk Mark tags, and 1-of-1 Heirloom toggles.
- Create `/portal/quick-stock` for fast warehouse/floor inventory updates.
- Create `/catalog` with instant client-side and server-side filtering.
- Create `/product/[slug]` with image gallery, Silk Mark verification, and luxury storytelling.

**Non-Goals:**
- Coupon discount validation (handled in Milestone 3).
- Direct payment checkout (handled in Milestone 5).

## Decisions

1. **Decision: Automatic Cost Price Redaction at Controller Layer**
   - *Rationale:* Never rely on frontend masking for sensitive financial data. The controller checks `req.user?.capabilities.includes('finance:view')` before returning `costPrice`.
2. **Decision: Fast Mobile Floor Mode with Optimistic UI**
   - *Rationale:* Staff updating stock on a tablet should not wait for server network roundtrips. The UI updates optimistically with instant audio/visual feedback and reconciles in the background.

## Risks / Trade-offs

- **[Risk] High-resolution image load speed on mobile**
  - *Mitigation:* Use Next.js `<Image>` with priority hints and responsive srcsets, serving optimized WebP assets.
