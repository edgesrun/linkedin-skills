# Sales Navigator Search Company Employees — Full Response Schema

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Full display name |
| `first_name` | string | First name |
| `last_name` | string | Last name |
| `company_name` | string | Company name from search context |
| `current_company` | string | Current company name |
| `sales_navigator_company_id` | string | SN company ID |
| `sales_navigator_company_url` | string | SN company page URL |
| `linkedin_profile_id` | integer | Immutable LinkedIn profile ID |
| `sales_navigator_profile_id` | string | Immutable SN profile ID — use for deduplication |
| `sales_navigator_profile_url` | string | SN profile URL |
| `linkedin_profile_url` | string | LinkedIn profile URL |
| `connection_degree` | integer | Degree of connection (1, 2, 3) |
| `job_title` | string | Current job title |
| `headline` | string | Profile headline |
| `profile_image_url` | URI | Profile photo URL |
| `sales_navigator_search_url` | string | Normalized search URL that produced these results |
| `location` | string | Location |
| `position_started_at` | string | When current position started |
| `linkedin_people_post_search_url` | string | URL to search this person's posts |
| `viewed` | boolean | Whether this lead was previously viewed |
| `tenure_start` | string | Start date at current position |
| `tenure_end` | string | End date (if applicable) |
| `tenure_length` | string | Duration in current role |
| `recently_hired` | boolean | Changed jobs recently |
| `recently_promoted` | boolean | Promoted recently |
