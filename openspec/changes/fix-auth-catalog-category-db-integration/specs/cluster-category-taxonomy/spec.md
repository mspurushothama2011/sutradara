## ADDED Requirements

### Requirement: Craft Cluster and SubCategory Taxonomy
The system SHALL organize sarees under craft cluster categories with an enforced maximum of 3 sub-categories per cluster.

#### Scenario: Listing Clusters with SubCategories
- **WHEN** client requests `GET /api/v1/categories`
- **THEN** system queries `Category` including `subCategories` from PostgreSQL, returns all clusters (Varanasi, Kanchipuram, Yeola, Chanderi) and verifies that each cluster has at most 3 sub-categories

#### Scenario: Category Navigation to Catalog Filter
- **WHEN** user clicks a cluster card on `/categories` or the homepage
- **THEN** system routes to `/catalog?craftRegion=<Region>` and pre-filters the catalog to sarees matching that geographical cluster
