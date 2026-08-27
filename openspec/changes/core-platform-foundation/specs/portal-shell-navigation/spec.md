## ADDED Requirements

### Requirement: Capability-Driven Portal Sidebar Navigation
The frontend portal layout SHALL dynamically filter and render navigation sidebar links based on the authenticated user's active capability flags.

#### Scenario: Staff with inventory capability views sidebar
- **WHEN** user with `["inventory:quick_update", "products:view"]` views `/portal/dashboard`
- **THEN** sidebar renders "Dashboard", "Saree Catalog", and "Quick Stock"
- **AND** hides "Marketing", "Staff Payroll", and "Audit Logs"

### Requirement: Unified Portal Login Screen
The frontend SHALL provide a luxury-styled login interface at `/portal/login` styled with Sutradara's dark obsidian and champagne gold theme.

#### Scenario: User navigates to protected portal route while unauthenticated
- **WHEN** an unauthenticated visitor navigates to `/portal/dashboard`
- **THEN** client automatically redirects them to `/portal/login`
