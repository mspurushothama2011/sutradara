## ADDED Requirements

### Requirement: Royal Ivory and Jewel-Tone Design Tokens
The system SHALL provide global CSS design tokens for a warm, regal light theme based on Kora Silk Ivory (`--bg: #FAF8F5`), Sandalwood Cream (`--bg-deep: #F4EFEA`), Alabaster card surfaces (`#FFFFFF`), Deep Imperial Espresso typography (`--text: #1A130D`, `--text-dim: #5A4838`), and rich Indian heritage jewel accents (`--gold: #B38938`, `--ruby: #8C1D2F`, `--emerald: #145A52`, `--plum: #5C1D6E`, `--saffron: #C96517`).

#### Scenario: Rendering high-contrast luxury typography
- **WHEN** any customer-facing storefront page is loaded
- **THEN** headings, body copy, and navigation labels render in Deep Imperial Espresso with at least 14:1 contrast ratio against the ivory background.

#### Scenario: Product card and surface styling
- **WHEN** product cards and showcase items are rendered on the homepage or catalog
- **THEN** cards display pure alabaster surfaces with 1px antique gold borders (`rgba(179, 137, 56, 0.22)`) and warm ambient drop shadows (`box-shadow: 0 10px 30px rgba(45, 25, 8, 0.06)`).

#### Scenario: Jewel-tone authenticity and stock badges
- **WHEN** product badges (In Stock, 1-of-1 Heirloom, Deal of the Day, GI Craft Origin) are displayed
- **THEN** badges render using rich jewel tones (Emerald, Paithani Plum, Banarasi Ruby, Saffron Amber) with matching soft pastel background pills.
