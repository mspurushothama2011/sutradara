# Capability: Product Catalog & Floor Quick-Stock Engine

## Overview
Comprehensive saree cataloging with handloom craft specifications (fabric, zari type, craft region, Silk Mark number, 30s drape video), 1-of-1 heirloom badging, and a high-speed warehouse/floor quick-stock adjuster.

## Requirements

### Requirement 1: Rich Saree Cataloging
* Products MUST support handloom metadata: `fabric`, `zariType`, `craftRegion`, `weaveStyle`, and `silkMarkNumber`.
* Cost price MUST be stored in the database but only serialized in responses to users possessing `finance:view`.

#### Scenario: Admin adds a new Banarasi heirloom saree
* **Given** an authenticated user with `products:create_edit` capability
* **When** they submit a saree payload with fabric `"Pure Katan Silk"`, zari `"Pure Gold Zari"`, and `isHeirloom1of1: true`
* **Then** the product is persisted in PostgreSQL with a unique SKU and slug
* **And** appears on the public storefront with the *"1-of-1 Exclusive Heirloom"* badge.

### Requirement 2: Floor-Level Quick-Stock Adjuster
* The portal MUST provide a mobile-optimized floor interface at `/portal/quick-stock`.
* Staff MUST be able to increment, decrement, or toggle stock between `In Stock` and `Out of Stock` with a single tap.
* Every stock adjustment MUST write an immutable record into the `AuditLog` table.

#### Scenario: Staff marks an offline-sold saree as out of stock
* **Given** an authenticated user with `inventory:quick_update`
* **When** they search for SKU `"BAN-042"` on `/portal/quick-stock` and tap `"Out of Stock"`
* **Then** the product stock is updated to `0` in PostgreSQL
* **And** an `AuditLog` record is created logging the staff member's ID and old/new stock values.
