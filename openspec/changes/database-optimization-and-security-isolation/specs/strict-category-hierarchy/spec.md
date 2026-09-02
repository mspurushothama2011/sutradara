## ADDED Requirements

### Requirement: Strict Category to SubCategory Hierarchy
The system SHALL organize products into regional craft clusters (`Category`) with a hard cap of at most 3 sub-categories (`SubCategory`) per cluster.

#### Scenario: Admin creates a valid sub-category
- **WHEN** an admin creates a sub-category under a craft cluster that currently has fewer than 3 sub-categories
- **THEN** the system creates the `SubCategory` and links it to the parent `Category`

#### Scenario: Admin exceeds 3 sub-categories limit
- **WHEN** an admin attempts to create a 4th sub-category under a craft cluster
- **THEN** the system rejects the request with a 400 Bad Request error stating `"A category can have a maximum of 3 sub-categories."`
