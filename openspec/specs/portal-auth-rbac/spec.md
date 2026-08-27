# Capability: Unified Portal Authentication & Granular RBAC

## Overview
A unified single portal login system for Admin and Staff with dynamic capability-based access control. Permissions are granted via granular capability flags rather than coarse roles.

## Requirements

### Requirement 1: Unified Login with HttpOnly Cookies
* The portal MUST provide a single login route at `/portal/login`.
* Upon successful credentials verification, the server MUST set an `httpOnly`, `Secure`, `SameSite=Strict` refresh token cookie and issue a short-lived (15-min) JWT access token.

#### Scenario: Staff logs in successfully
* **Given** a valid staff user exists with email `staff@sutradara.in` and password `validPassword123`
* **When** they submit their credentials on `/portal/login`
* **Then** the backend returns a 200 response with their assigned capabilities array
* **And** sets the secure refresh token cookie.

### Requirement 2: Granular Capability Authorization
* All protected API routes MUST enforce specific capability flags (e.g. `finance:view`, `products:create_edit`, `staff:payroll_manage`).
* The frontend sidebar MUST dynamically render only the modules corresponding to the authenticated user's capabilities.

#### Scenario: Staff without finance capability attempts to view profit margins
* **Given** a staff user lacks the `finance:view` capability
* **When** they attempt to access `/api/v1/products/margins` or view cost prices in the portal
* **Then** the API returns a 403 Forbidden status
* **And** the frontend hides the cost price and profit columns.
