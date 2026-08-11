# Extract Contact — Full Response Schema

| Field | Type | Description |
|---|---|---|
| `email` | email | Email address (if publicly visible on profile) |
| `phone` | string | Primary phone number (if visible) |
| `phones` | array of strings | All phone numbers listed on profile |
| `website` | URI | Personal website URL |
| `twitter` | URI | Twitter profile URL |
| `twitter_handles` | array of strings | Twitter handles |
| `connected_at` | datetime | When connection was established (if connected) |
| `linkedin_profile_handle` | string | Profile URL slug (mutable — do not use as primary key) |
| `linkedin_profile_url` | URI | Full LinkedIn profile URL |
| `linkedin_profile_id` | integer | Immutable LinkedIn profile ID |
| `sales_navigator_profile_id` | string | Immutable Sales Navigator profile ID |
