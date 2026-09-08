## MODIFIED Requirements

### Requirement: Unified Login with HttpOnly Cookies
* The portal MUST provide an admin/staff login route at `/portal/login` separated from customer login.
* Upon successful credentials verification, the server MUST set an `httpOnly`, `Secure`, `SameSite=Strict` refresh token cookie and issue a short-lived (15-min) JWT access token.

#### Scenario: Staff logs in successfully
- **WHEN** staff submits their credentials on `/portal/login`
- **THEN** the backend admin auth controller returns a 200 response with their assigned capabilities array
- **AND** sets the secure refresh token cookie.

### Requirement: Granular Capability Authorization
* All protected admin API routes located in `backend/src/routes/admin/` MUST enforce specific capability flags (e.g. `finance:view`, `products:create_edit`, `staff:payroll_manage`).
* The frontend admin portal layout and sidebar MUST dynamically render only the modules corresponding to the authenticated user's capabilities.

#### Scenario: Staff without finance capability attempts to view profit margins
- **WHEN** a staff user lacks the `finance:view` capability
- **THEN** the API returns a 403 Forbidden status
- **AND** the frontend hides the cost price and profit columns in the admin catalog console.
