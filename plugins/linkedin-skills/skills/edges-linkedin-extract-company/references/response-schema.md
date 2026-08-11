# Extract Company — Full Response Schema

## Company Info

| Field | Type | Description |
|---|---|---|
| `company_name` | string | Company name |
| `linkedin_company_id` | string | Immutable numeric company ID |
| `description` | string | Company about / description |
| `type` | string | Company type (public, private, nonprofit, etc.) |
| `tagline` | string | Company tagline |
| `specialties` | array | List of company specialties |

## URLs & Contact

| Field | Type | Description |
|---|---|---|
| `linkedin_company_url` | URI | LinkedIn company page URL |
| `website` | string | Company website |
| `domain` | string | Company domain |
| `linkedin_company_phone` | string | Company phone number |
| `sales_navigator_company_url` | URI | Sales Navigator company URL |
| `linkedin_job_search_url` | URI | URL to search jobs at this company |

## Size

| Field | Type | Description |
|---|---|---|
| `number_employees` | number | Employee count |
| `employees_range` | string | Employee range bracket (e.g., "201-500") |
| `followers_count` | integer | Company page followers |

## Location

| Field | Type | Description |
|---|---|---|
| `country` | string | Country |
| `city` | string | City |
| `postal_code` | string | Postal/ZIP code |
| `geographic_area` | string | State/region |
| `headquarters` | string | HQ location string |
| `locations` | array | All office locations |

## Funding

| Field | Type | Description |
|---|---|---|
| `crunchbase_company_url` | URI | Crunchbase profile URL |
| `last_funding_date` | string | Date of last funding round |
| `last_funding_type` | string | Type (Series A, B, etc.) |
| `last_funding_raised` | string | Amount raised |
| `last_funding_currency` | string | Currency code |
| `last_funding_investors` | array | Investor names |

## Other

| Field | Type | Description |
|---|---|---|
| `industries` | array | Industry classifications |
| `logo_url` | URI | Company logo image URL |
| `linkedin_page_claimed` | boolean | Whether the page is claimed/managed |
| `updated_at` | string | Last update timestamp |
| `affiliates` | array | Affiliated companies |
| `linkedin_school_id` | string | School ID (if education institution) |
