## ADDED Requirements

### Requirement: Unified Portal Authentication via HttpOnly Cookies
The backend API SHALL provide a unified login endpoint at `POST /api/v1/auth/login`. Upon verifying email and password credentials, the server MUST issue an `httpOnly`, `Secure`, `SameSite=Strict` refresh token cookie and return a short-lived (15-minute) JWT access token with the user's assigned capabilities.

#### Scenario: Staff member logs into unified portal
- **WHEN** user submits valid email and password to `/api/v1/auth/login`
- **THEN** server returns 200 OK with access token and user profile
- **AND** server sets `httpOnly; Secure; SameSite=Strict` refresh token cookie

#### Scenario: Invalid credentials submitted
- **WHEN** user submits invalid email or password to `/api/v1/auth/login`
- **THEN** server returns 401 Unauthorized with descriptive error message

### Requirement: Granular Capability RBAC Enforcement
The backend API SHALL verify specific capability strings (e.g. `finance:view`, `products:create_edit`) on protected endpoints before executing database transactions. If a user lacks the required capability and is not an `ADMIN`, the request MUST be rejected.

#### Scenario: Staff lacks capability for requested endpoint
- **WHEN** a user without `finance:view` calls an endpoint requiring `finance:view`
- **THEN** server returns 403 Forbidden with `{ error: "Forbidden: Missing capability" }`
