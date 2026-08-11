# Search People — Full Response Schema

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Full display name |
| `first_name` | string | First name |
| `last_name` | string | Last name |
| `job_title` | string | Current job title |
| `current_title` | string | Current title (may differ from job_title in formatting) |
| `company_name` | string | Current company name |
| `headline` | string | Profile headline |
| `location` | string | Location from profile |
| `linkedin_profile_url` | URI | LinkedIn profile URL |
| `linkedin_profile_handle` | string | Profile URL slug (mutable) |
| `profile_image_url` | string | Profile photo URL |
| `linkedin_profile_id` | integer | Immutable LinkedIn profile ID |
| `sales_navigator_profile_id` | string | Immutable SN profile ID |
| `connection_degree` | string | Degree of connection (1st, 2nd, 3rd) |
| `shared_connection_search_url` | URI | URL to view shared connections |
| `number_shared_connections` | integer | Count of mutual connections |
| `shared_connection_profile_urls` | array | URLs of shared connections |
| `linkedin_people_post_search_url` | URI | URL to search this person's posts |
