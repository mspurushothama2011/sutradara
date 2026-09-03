## ADDED Requirements

### Requirement: Customer Passwordless OTP Authentication
The system SHALL allow patrons to request a 6-digit Email OTP and verify it against the PostgreSQL `Customer` table to establish a customer session.

#### Scenario: Successful OTP Generation and Verification
- **WHEN** customer submits email `patron@example.com` on `/login`
- **THEN** system generates a 6-digit OTP, records it with a 10-minute expiry, and logs/returns it in development mode
- **WHEN** customer enters the 6-digit OTP
- **THEN** system validates OTP, marks `Customer.isVerified = true`, issues a JWT token, and redirects to `/account` or the checkout flow

#### Scenario: Expired or Invalid OTP
- **WHEN** customer submits an incorrect or expired OTP
- **THEN** system rejects verification with 401 Unauthorized and keeps the session unauthenticated
