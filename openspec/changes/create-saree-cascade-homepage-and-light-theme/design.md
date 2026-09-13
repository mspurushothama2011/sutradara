## Context

Sutraಧಾರ is a luxury Indian handloom saree e-commerce platform. The current storefront uses a dark-dominated aesthetic (`#1a140e` / `#110c08`) that conceals the rich color textures of Indian heritage weaves and lacks an impactful startup welcoming sequence. We are introducing a high-fashion Saree Cascade intro animation and migrating the storefront design tokens to a Royal Ivory and Indian Jewel-Tone Light Theme.

## Goals / Non-Goals

**Goals:**
- Implement an organic, non-linear full-screen Saree Cascade introductory animation with pure CSS hardware acceleration (`translate3d`, stratified jitter, specular sheen, and gold zari fringe).
- Provide session awareness (`sessionStorage`) and a "Skip ✕" control so visitors are never blocked on subsequent visits.
- Re-architect global design tokens in `frontend/src/app/globals.css` to a warm Royal Kora Ivory (`#FAF8F5`) and Sandalwood (`#F4EFEA`) light theme with Deep Imperial Espresso typography (`#1A130D`, 14.2:1 contrast ratio) and rich heritage jewel accents (Banarasi Ruby, Peacock Emerald, Paithani Plum, Saffron Amber, Antique Gold).
- Update the default customer boutique home page (`/`) and storefront components (`LandingNavbar`, `FeaturedShowcase`) to use the new light tokens.

**Non-Goals:**
- Modifying backend APIs, database schemas, or authentication logic.
- Rewriting the Three.js 240-frame product scroll engine (which will retain its frame pipeline and seamlessly integrate with the light palette).

## Decisions

### 1. Stratified Jitter vs. Pure Random Positioning
- **Decision**: Divide horizontal viewport into 9 anchor buckets with random `±4%` offsets, variable widths (`22vw` to `34vw`), and randomized z-indices.
- **Rationale**: Pure random positions cause accidental clustering and empty gaps. Stratified jitter guarantees complete screen coverage during the settle phase while preserving a casual, organic, hand-tossed cloth aesthetic.

### 2. Pure CSS Hardware-Accelerated Transforms vs. Heavy JS Physics
- **Decision**: Drive the drop, cloth settle, and float-up cycle entirely through GPU-accelerated CSS keyframes (`transform: translate3d(x, y, 0) rotate(deg)`).
- **Rationale**: Ensures 60fps on mobile devices and 120fps on ProMotion displays with zero CPU main-thread blocking or layout thrashing.

### 3. Light Theme Contrast Hierarchy
- **Decision**: Pair `#FAF8F5` (Kora Ivory) with `#1A130D` (Deep Espresso text) and `#FFFFFF` (Alabaster cards with fine `#B38938` gold borders).
- **Rationale**: Delivers a warm, opulent Indian palace ambiance without sterile white glare, maintaining WCAG AAA compliance (14.2:1 text contrast).

## Risks / Trade-offs

- **[Performance on low-end devices]** → Handled via `will-change: transform`, unmounting the DOM overlay immediately after the 3.5s cycle, and respecting `prefers-reduced-motion`.
- **[Repetitive intro annoyance]** → Mitigated via `sessionStorage` guard (plays once per session) and a top-right `Skip ✕` button.
