## Why

The current storefront uses a dark-dominated palette that obscures the vibrancy, weaving textures, and authentic luster of traditional Indian handloom sarees. Additionally, the initial site arrival lacks theatrical visual storytelling. Introducing an organic full-screen silk saree cascading animation (*The Royal Silk Unveiling*) on initial arrival and shifting the entire storefront to a warm, royal ivory and jewel-tone light theme will create an unforgettable first impression while dramatically elevating product visibility and luxury brand appeal.

## What Changes

- **Startup Saree Cascade Animation**: Full-screen organic cascade of pure silk sarees (deep maroon, emerald green, royal sapphire, antique gold, burnt orange, magenta, and peacock teal) that drop from the top, briefly settle to envelop the viewport with the Sutraಧಾರ royal seal, and gracefully float back up into the ceiling.
- **Organic Non-Linear Motion Physics**: Implement stratified jitter positioning and variable draping speeds to prevent repetitive grid patterns, with natural cloth settle, diagonal silk specular light sheen, and gold zari fringe tassels.
- **Royal Ivory & Jewel-Tone Light Theme**: Redefine global CSS design tokens and surfaces from dark obsidian (`#1a140e`) to warm Kora Silk Ivory (`#FAF8F5`), Sandalwood Cream (`#F4EFEA`), and Pure Alabaster cards with fine antique gold borders (`rgba(179, 137, 56, 0.22)`) and Deep Imperial Espresso typography (`#1A130D`, 14.2:1 AAA contrast).
- **Default Boutique Homepage (`/`)**: Make `/` the default customer storefront home featuring the silk cascade intro, interactive hero showcase, six craft dynasties cluster portals, and live heirloom saree acquisitions.
- **UX & Accessibility Safeguards**: Support `sessionStorage` intro memory (plays on initial visit, bypassed on sub-navigation), top-right `Skip ✕` control, and automatic reduced-motion handling.

## Capabilities

### New Capabilities
- `saree-cascade-intro`: GPU-accelerated full-screen organic silk saree drop, settle, and float-up intro animation with stratified jitter and authentic fabric sheen.
- `royal-light-theme`: Comprehensive ivory and rich jewel-tone light theme design system tokens, card surfaces, and high-contrast typography across the customer storefront.

### Modified Capabilities
- `customer-storefront`: Refactor customer homepage (`/`) and storefront components to integrate the intro animation and light theme tokens.

## Impact

- **Frontend**: `frontend/src/app/globals.css`, `frontend/src/app/(customer)/page.tsx`, `frontend/src/components/intro/SilkCascadeIntro.tsx`, `frontend/src/components/landing/LandingNavbar.tsx`, `frontend/src/components/landing/FeaturedShowcase.tsx`.
- **Dependencies**: No external heavy libraries required; pure hardware-accelerated CSS keyframe transforms and React state management.
- **Performance**: 60fps/120fps GPU execution via `translate3d`, zero cumulative layout shifts (CLS), clean unmount upon animation completion.
