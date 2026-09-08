## ADDED Requirements

### Requirement: Two-Step Customer Account Deletion Verification
The system SHALL enforce a two-step confirmation flow for account deactivation: the patron MUST explicitly type the word "DELETE" and verify a dedicated deletion OTP sent to their registered email address.

#### Scenario: Patron requests account deletion OTP
- **WHEN** an authenticated customer clicks "Delete Account" and types "DELETE" in the confirmation modal
- **THEN** system invokes `POST /api/v1/customer/account/delete-request-otp` and dispatches a dedicated deletion OTP to the customer's email.

#### Scenario: Patron confirms account deletion with valid OTP
- **WHEN** customer submits the deletion OTP and confirmation text to `DELETE /api/v1/customer/account`
- **THEN** system verifies the deletion OTP, soft-deletes the customer record, anonymizes all PII, purges linked delivery addresses, invalidates active sessions, and logs the customer out.

### Requirement: Account Soft-Deletion and PII Anonymization
The system SHALL preserve order records for tax and GST compliance while anonymizing personal identifiable information (PII) upon account deletion.

#### Scenario: PII Anonymization on deletion
- **WHEN** account deletion is successfully executed
- **THEN** system updates `Customer.email` to an anonymized placeholder, sets `Customer.name` to "Deactivated Patron", clears `Customer.phone`, sets `Customer.deletedAt` timestamp, and deletes all linked records from the `Address` table.
