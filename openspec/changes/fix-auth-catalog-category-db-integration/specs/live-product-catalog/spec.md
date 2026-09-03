## ADDED Requirements

### Requirement: Database-Driven Catalog and Product Retrieval
The system SHALL retrieve authentic sarees, active filters, and individual product details directly from the PostgreSQL `Product` table with physical isolation of confidential cost prices.

#### Scenario: Catalog Multi-Attribute Filtering
- **WHEN** client requests `/api/v1/products?craftRegion=Varanasi&isHeirloom1of1=true`
- **THEN** system queries PostgreSQL with corresponding where clauses and returns matching products with public retail prices and high-res image arrays

#### Scenario: Single Saree Lookup by Slug
- **WHEN** client navigates to `/product/varanasi-royal-kadhwa-pure-katan-silk-saree`
- **THEN** system queries `Product.findFirst({ where: { slug } })` and returns the saree details, Silk Mark verification number, and active stock count
