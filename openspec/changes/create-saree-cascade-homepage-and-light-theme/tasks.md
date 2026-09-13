## 1. Global Light Theme Design Tokens & CSS Variables

- [x] 1.1 Update `frontend/src/app/globals.css` with Royal Kora Silk Ivory (`--bg: #FAF8F5`), Sandalwood (`--bg-deep: #F4EFEA`), Alabaster card surfaces, Deep Imperial Espresso typography (`--text: #1A130D`, `--text-dim: #5A4838`), and rich Indian jewel-tone accent variables (`--gold: #B38938`, `--ruby: #8C1D2F`, `--emerald: #145A52`, `--plum: #5C1D6E`, `--saffron: #C96517`)
- [x] 1.2 Refactor global scrollbar, focus rings, preloader, and card container styling for the light theme

## 2. Saree Cascade Full-Screen Intro Component

- [x] 2.1 Create `frontend/src/components/intro/SilkCascadeIntro.tsx` with 9 pure silk drapes, rich jewel palettes, stratified jitter positioning, and gold zari fringe borders
- [x] 2.2 Add GPU-accelerated CSS keyframes for organic drop momentum, cloth settle bounce, central royal crest seal, and smooth upward float-out
- [x] 2.3 Implement session storage memory (`sessionStorage.getItem('hasSeenSilkIntro')`), top-right `Skip ✕` control, and `prefers-reduced-motion` crossfade

## 3. Customer Storefront Homepage Refactor

- [x] 3.1 Integrate `SilkCascadeIntro` into `frontend/src/app/(customer)/page.tsx` as the default boutique homepage
- [x] 3.2 Update `frontend/src/components/landing/LandingNavbar.tsx` with frosted alabaster glass, gold hairline border, and high-contrast navigation links
- [x] 3.3 Update `frontend/src/components/landing/FeaturedShowcase.tsx` and homepage sections with alabaster cards, jewel-tone badges, and refined pricing typography

## 4. Verification & Polish

- [x] 4.1 Verify intro animation lifecycle in browser (first visit drop & float-up, session persistence, and skip button)
- [x] 4.2 Verify light theme contrast ratios, card elevation, and responsiveness across desktop and mobile screens
- [x] 4.3 Run typecheck and production build on frontend (`npm run build`) with zero errors
