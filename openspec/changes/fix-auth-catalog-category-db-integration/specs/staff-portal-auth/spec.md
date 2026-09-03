## ADDED Requirements

### Requirement: Staff & Admin Portal Authentication
The system SHALL verify staff credentials against the PostgreSQL `User` table, issue JWT authentication tokens in both cookies and response payload, and enforce role capabilities.

#### Scenario: Admin Login Verification
- **WHEN** user submits `admin@sutradara.in` and `AdminPassword@2026` on `/portal/login`
- **THEN** system compares bcrypt password hash, issues a signed JWT containing `role: "ADMIN"` and full capability array, sets `_sutradara_token` cookie, and grants access to `/portal/dashboard`

#### Scenario: Staff Login with Restricted Capabilities
- **WHEN** user submits `staff@sutradara.in` and `StaffPassword@2026` on `/portal/login`
- **THEN** system verifies credentials, returns `role: "STAFF"` with restricted permissions (e.g. `products:view`, `orders:manage`), and hides administrative tabs (such as wholesale costs and payroll)
