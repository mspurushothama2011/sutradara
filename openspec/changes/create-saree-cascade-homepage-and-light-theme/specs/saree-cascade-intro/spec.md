## ADDED Requirements

### Requirement: Fullscreen Organic Saree Cascade Animation
The system SHALL display an organic, non-linear silk saree cascade intro animation when a patron arrives at the customer storefront, rendering 7-9 layered silk fabric panels with authentic textures, rich jewel tones, and gold zari trims.

#### Scenario: First session visit triggering cascade intro
- **WHEN** patron opens the customer storefront for the first time in a browsing session
- **THEN** system renders the fullscreen saree cascade overlay with staggered descent, central royal crest seal, and graceful upward float-out before unmounting.

#### Scenario: Natural cloth physics and stratified jitter
- **WHEN** the saree panels descend across the viewport
- **THEN** system applies stratified jitter positioning across viewport width buckets, subtle cloth bounce at the bottom, and diagonal specular light shimmer across the fabric.

#### Scenario: User skips introductory unveiling
- **WHEN** patron clicks the "Skip ✕" control in the top-right corner of the cascade overlay
- **THEN** system immediately dismisses the intro overlay and reveals the default homepage sanctuary.

#### Scenario: Subsequent visit in the same session
- **WHEN** patron navigates back to the homepage (`/`) after already viewing the intro in the current session
- **THEN** system checks `sessionStorage` and renders the default homepage directly without repeating the cascade intro.

#### Scenario: Reduced motion accessibility
- **WHEN** patron has `prefers-reduced-motion: reduce` enabled on their operating system
- **THEN** system bypasses the vertical drape motion and transitions directly to the homepage with a gentle 300ms crossfade.
