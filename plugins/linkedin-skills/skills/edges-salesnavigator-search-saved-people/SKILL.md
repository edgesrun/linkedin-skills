---
name: edges-salesnavigator-search-saved-people
description: >-
  Execute a saved leads search on Sales Navigator via the Edges API. Use this skill when the user has a saved people search in SN and wants to run it. Requires a connected Sales Navigator identity (`identity_ids`). Does not support managed mode.
license: Apache-2.0
---

## Endpoint
- `POST /actions/salesnavigator-search-saved-people/run/live` — synchronous (single input)
- `POST /actions/salesnavigator-search-saved-people/run/async` — asynchronous (batch inputs)
- `POST /actions/salesnavigator-search-saved-people/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Identity Mode
**Direct mode required** — pass a connected Sales Navigator identity.

```json
{ "identity_ids": ["your-identity-uuid"] }
```

**IMPORTANT:** This action does NOT support `identity_mode: "managed"`. You MUST use `identity_ids`.

## Input Field
**`sales_navigator_profile_search_url`** (required, string, uri) — A Sales Navigator Profile Search URL should start with 'https://www.linkedin.com/sales/search/people'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/search\/people(?=.*\bsavedSearchId=).+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
- `exclude_crm_contacts` (boolean) default: `false` — Exclude CRM contacts
- `exclude_viewed_leads` (boolean) default: `false` — Remove viewed Leads from search; note that this option only works if there's a 'Visit' step in your workflow.

## Pagination
- `page_size`: 25 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (SalesnavigatorSearchSavedPeopleOutput)
- `full_name` (string)
- `first_name` (string)
- `last_name` (string)
- `company_name` (string)
- `sales_navigator_company_id` (string)
- `linkedin_profile_id` (integer)
- `connection_degree` (integer)
- `job_title` (string)
- `profile_image_url` (string (string))
- `sales_navigator_search_url` (string (string))
- `sales_navigator_profile_url` (string (string))
- `linkedin_profile_url` (string (string))
- `sales_navigator_profile_id` (string)
- `sales_navigator_company_url` (string (string))
- `location` (string)
- `linkedin_people_post_search_url` (string (string))
- `viewed` (boolean)
- `tenure_start` (string)
- `tenure_end` (string)
- `tenure_length` (string)
- `recently_hired` (boolean)
- `recently_promoted` (boolean)
- `current_company` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.searchSavedPeople({
  identity_ids: ["your-identity-uuid"],
  input: {
    sales_navigator_profile_search_url: "https://www.linkedin.com/sales/search/people?savedSearchId=123"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.searchSavedPeopleAsync({
  identity_ids: ["your-identity-uuid"],
  inputs: [
    {
      sales_navigator_profile_search_url: "https://www.linkedin.com/sales/search/people?savedSearchId=111"
    },
    {
      sales_navigator_profile_search_url: "https://www.linkedin.com/sales/search/people?savedSearchId=222"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-salesnavigator-search-people`** — Run a new SN people search (not a saved search).
- **`edges-salesnavigator-extract-leads-list`** — Extract from a saved leads list (not a saved search).

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Lead's display name |
| `job_title` | string | Current job title |
| `linkedin_profile_url` | string | Profile URL |
| `linkedin_profile_id` | integer | Immutable profile ID |
| `sales_navigator_profile_id` | string | Immutable SN profile ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
