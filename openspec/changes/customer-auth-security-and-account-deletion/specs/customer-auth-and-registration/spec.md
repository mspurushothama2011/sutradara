## ADDED Requirements

### Requirement: Cloudflare Turnstile Verification on OTP Send
The system SHALL require and verify a valid Cloudflare Turnstile CAPTCHA token on all customer OTP send requests before generating the OTP or dispatching an email.

#### Scenario: Successful OTP send with valid Turnstile token
- **WHEN** user submits email with a valid Cloudflare Turnstile token to `POST /api/v1/customer/auth/send-otp`
- **THEN** system verifies the token against Cloudflare's API, generates the 6-digit OTP, and returns a success response.

#### Scenario: Block OTP send when Turnstile token is missing or invalid
- **WHEN** a request arrives at `POST /api/v1/customer/auth/send-otp` with a missing or invalid Turnstile token
- **THEN** system rejects the request with HTTP 400 and an error message `"Captcha verification failed. Please complete the security check."` without generating any OTP.

### Requirement: Dedicated Customer Registration Page
The frontend SHALL provide a dedicated `/register` page allowing patrons to register with Full Name, Mobile Number, and Email Address, protected by Turnstile CAPTCHA and offering Google Sign-in.

#### Scenario: Customer registers via dedicated registration flow
- **WHEN** customer completes the form on `/register` with Name, Phone, and Email, passes Turnstile, and verifies the 6-digit OTP
- **THEN** system creates their verified customer record with Name, Phone, and Email in PostgreSQL and returns an active 30-day JWT session redirecting to `/account`.

### Requirement: Google Identity Services (OAuth 2.0) Customer Authentication
The system SHALL support 1-click Google Sign-In and Registration via Google Identity Services on `/login`, `/register`, and `/checkout`.

#### Scenario: Customer signs in with Google ID token
- **WHEN** customer selects "Sign in with Google" and provides a valid Google ID token to `POST /api/v1/customer/auth/google`
- **THEN** system cryptographically validates the token with Google, creates or links the `Customer` record in PostgreSQL with verified email and name, and returns a 30-day JWT session.
