## Why

The storefront currently employs solid opaque ivory background fills across parent containers, which fully occlude the newly added interactive GPU silk canvas sitting at the base layer. This change unblocks layer transparency, boosts ambient orb and particle luminosity, and applies luxury glassmorphic surfaces so the storefront feels organic, alive, and interactive without degrading typography contrast.

## What Changes

- **Unblock Background Occlusion**: Replace opaque `#FAF8F5` page and section background fills with transparent and translucent luxury backplates (`rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(14px)`).
- **Vibrant Living Canvas Engine**:
  - Boost ambient gradient orbs in heritage olive (`#5A6844`) and antique gold (`#B38938`) to 320px–480px with 18%–28% opacity.
  - Implement a dynamic, spring-damped **cursor light field** that glides smoothly behind cards as the mouse moves.
  - Increase particle count and size (`1.2px` – `3.2px`) with gentle drifting motion and cursor repulsion physics.
- **Glassmorphic Surface Utility Tokens**: Add `.glass-card-luxury` classes in global CSS for consistent atmospheric depth across hero and catalog sections.
- **Contrast & Performance Retention**: Maintain 14:1 AAA typography contrast and lock 60fps rendering with DPR clamping and visibility throttling.

## Capabilities

### New Capabilities
- `living-silk-background`: GPU-composited organic ambient background with mouse-reactive light fields, floating silk dust particles, and luxury translucent surfaces.

### Modified Capabilities
- None

## Impact

- Affected Code: `frontend/src/components/shared/ui/InteractiveSilkCanvas.tsx`, `frontend/src/app/globals.css`, `frontend/src/app/(customer)/page.tsx`, `frontend/src/components/landing/FeaturedShowcase.tsx`.
- Dependencies: Pure vanilla HTML5 Canvas + Next.js 15 App Router. No new external libraries.
