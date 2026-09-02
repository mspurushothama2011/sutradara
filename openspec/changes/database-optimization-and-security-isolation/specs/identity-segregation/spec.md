## ADDED Requirements

### Requirement: Customer Account Isolation
The system SHALL maintain public patron identity in a dedicated `Customer` model separate from staff and administrative accounts.

#### Scenario: Customer registers or signs in with Email OTP
- **WHEN** a patron submits their email to `/api/v1/customer/auth/send-otp` and verifies the 6-digit OTP
- **THEN** the system creates or retrieves the record exclusively from the `Customer` table with role `CUSTOMER`
- **THEN** the resulting JWT payload contains `customerId` and has no administrative capability strings

#### Scenario: Privilege escalation prevention
- **WHEN** a customer sends a modified payload attempting to update `role` to `ADMIN`
- **THEN** the request is rejected with 400 Bad Request because the `Customer` model has no `role` field

### Requirement: Staff Account Isolation
The system SHALL maintain staff and executive identities in a dedicated `StaffAccount` model protected by Argon2id password hashing and capability strings.

#### Scenario: Staff signs into unified portal
- **WHEN** an employee submits credentials to `/api/v1/portal/auth/login`
- **THEN** the system validates credentials against `StaffAccount`
- **THEN** customer accounts cannot authenticate against the portal login endpoint
