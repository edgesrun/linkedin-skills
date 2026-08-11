# Extract People — Full Response Schema

## Basic Fields (always returned)

| Field | Type | Description |
|---|---|---|
| `linkedin_profile_handle` | string | URL slug (mutable — do not use as primary key) |
| `first_name` | string | First name |
| `last_name` | string | Last name |
| `full_name` | string | Full display name |
| `birth_date` | string | Birth date if visible |
| `headline` | string | Profile headline |
| `profile_image_url` | URI | Profile photo URL |
| `sales_navigator_profile_id` | string | Immutable SN profile ID |
| `linkedin_profile_id` | string | Immutable LinkedIn profile ID |
| `linkedin_profile_url` | URI | Current profile URL |
| `linkedin_people_post_search_url` | URI | URL to search this person's posts |
| `profile_country` | string | Country code |
| `profile_language` | string | Profile language |
| `location` | string | Location text |
| `open_to_work` | boolean | Open to Work badge status |

## With `sections: true`

| Field | Type | Description |
|---|---|---|
| `summary` | string | About / summary section |
| `job_title` | string | Current job title |
| `company_name` | string | Current company name |
| `linkedin_company_url` | URI | Current company LinkedIn URL |
| `linkedin_company_id` | integer | Current company numeric ID |
| `education` | array | Education entries (see below) |
| `languages` | array of strings | Spoken languages |
| `volunteer_experiences` | array | Volunteer work entries |

### Education Entry Fields

| Field | Type | Description |
|---|---|---|
| `title` | string | Degree or program title |
| `school_name` | string | School name |
| `school_description` | string | School description |
| `linkedin_school_url` | URI | School LinkedIn URL |
| `linkedin_school_id` | integer | School ID |
| `date` | string | Date range |
| `degree_name` | string | Degree type |
| `field_of_study` | string | Field of study |
| `company_logo_url` | URI | School logo |

## With `experiences: true`

Returns the **last 5 positions only** (LinkedIn constraint).

| Field | Type | Description |
|---|---|---|
| `experiences` | array | Array of experience objects (see below) |
| `past_company_name` | string | Previous company name |
| `past_job_title` | string | Previous job title |
| `past_sales_navigator_company_id` | string | Previous company SN ID |
| `past_linkedin_company_id` | integer | Previous company LinkedIn ID |
| `past_linkedin_company_url` | URI | Previous company LinkedIn URL |

### Experience Entry Fields

| Field | Type | Description |
|---|---|---|
| `title` | string | Job title |
| `company_name` | string | Company name |
| `company_description` | string | Company description |
| `linkedin_company_url` | URI | Company LinkedIn URL |
| `linkedin_company_id` | integer | Company numeric ID |
| `location` | string | Job location |
| `date` | string | Date range (e.g., "Jan 2020 - Present") |
| `job_time_period` | string | Duration |
| `job_contract_type` | string | Contract type |
| `company_logo_url` | URI | Company logo |

## With `skills: true`

| Field | Type | Description |
|---|---|---|
| `skills` | array | Array of `{ name: string }` — partial list (1-2 main skills) |

## With `highlights: true`

| Field | Type | Description |
|---|---|---|
| `number_connections` | integer | Connection count |
| `number_followers` | integer | Follower count |
| `connection_degree` | string | Degree of connection (1st, 2nd, 3rd) |
| `linkedin_thread_id` | string | Conversation thread ID (for messaging) |
| `connected_at` | datetime | When connection was established |
