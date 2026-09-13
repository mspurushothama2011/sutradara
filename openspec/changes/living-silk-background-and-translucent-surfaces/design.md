## Context

The Sutradara luxury storefront uses a royal ivory (`#FAF8F5`) and sandalwood aesthetic. When implementing dynamic ambient canvas effects behind page content, parent wrappers with solid background colors blocked visual penetration of the canvas layer. This design outlines how to construct transparent layer hierarchies and amplify canvas physics while guaranteeing locked 60 FPS performance and WCAG AAA readability.

## Goals / Non-Goals

**Goals:**
- Make the interactive canvas clearly visible and responsive across all pages without layout shift.
- Render dynamic cursor light fields and drifting silk particles with smooth spring dampening (`lerp: 0.05`).
- Ensure cards, search bars, and pillar badges use luxury frosted glass styling (`.glass-card-luxury`).
- Preserve text contrast ratio $\ge 12:1$ for headlines and product prices.

**Non-Goals:**
- Heavy WebGL shaders or 3D scene re-renders (using 2D canvas context for optimal mobile battery performance).
- Modifying backend APIs or database schemas.

## Decisions

1. **2D Canvas with Multi-Point Radial Orbs & Cursor Flare**:
   - *Rationale*: HTML5 2D canvas with `createRadialGradient` provides silky 60fps performance across desktop and mobile without the memory footprint of Three.js postprocessing.
   - *Alternative Considered*: CSS animated mesh gradients. Rejected due to inability to do smooth cursor physics repulsion.

2. **Translucent Content Architecture with Backplate Glassmorphism**:
   - *Rationale*: Setting parent page wrappers to `background: transparent` allows the fixed canvas at `z-index: 0` to illuminate the entire page, while `rgba(255, 255, 255, 0.85)` + `backdrop-filter: blur(14px)` on cards guarantees text clarity.

3. **Performance Throttling & Clamping**:
   - *Rationale*: Clamping DPR to 2.0 and adding `visibilitychange` listener ensures zero GPU drain when tabs are hidden.

## Risks / Trade-offs

- [Risk: Low-end mobile devices dropping frames] → Mitigation: Clamped particle count (18 on mobile vs 36 on desktop) and disabled expensive shadow blurs on individual particles.
- [Risk: Text contrast degradation over moving orbs] → Mitigation: Kept maximum orb opacity at 0.28, ensuring base ivory tone dominates and dark espresso typography (`#1A130D`) stays above 12:1 contrast.
