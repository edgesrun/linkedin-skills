---
name: edges-salesnavigator-extract-leads-list
description: >-
  Extract leads from a Sales Navigator saved list via the Edges API. Use this skill when the user wants to export leads from a SN list, extract a saved leads list, or pull contacts from a Sales Navigator list URL. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/salesnavigator-extract-leads-list/run/live` — synchronous (single input)
- `POST /actions/salesnavigator-extract-leads-list/run/async` — asynchronous (batch inputs)
- `POST /actions/salesnavigator-extract-leads-list/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`sales_navigator_profile_list_url`** (required, string, uri) — A Sales Navigator Leads List URL should start with 'https://www.linkedin.com/sales/lists/people'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/lists\/people.+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
- `exclude_viewed_leads` (boolean) default: `false` — Remove viewed Leads from search.

## Pagination
- `page_size`: 25 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (SalesnavigatorExtractLeadsListOutput)
- `company_name` (string)
- `connection_degree` (integer)
- `current_company` (string)
- `first_name` (string)
- `full_name` (string)
- `headline` (string)
- `job_title` (string)
- `last_name` (string)
- `linkedin_profile_url` (string (uri))
- `location` (string)
- `linkedin_profile_id` (integer)
- `profile_image_url` (string (uri))
- `sales_navigator_company_id` (string)
- `sales_navigator_company_url` (string (uri))
- `sales_navigator_profile_id` (string)
- `sales_navigator_profile_url` (string (uri))
- `sales_navigator_search_url` (string (uri))
- `tenure_end` (string)
- `tenure_length` (string)
- `tenure_start` (string)
- `viewed` (boolean)
- `linkedin_people_post_search_url` (string (uri))
- `recently_hired` (boolean)
- `recently_promoted` (boolean)
- `sales_navigator_profile_list_url` (string (uri))

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.extractLeadsList({
  identity_mode: "managed",
  input: {
    sales_navigator_profile_list_url: "https://www.linkedin.com/sales/lists/people/1234567890"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.extractLeadsListAsync({
  identity_mode: "managed",
  inputs: [
    {
      sales_navigator_profile_list_url: "URL_1"
    },
    {
      sales_navigator_profile_list_url: "URL_2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-salesnavigator-extract-accounts-list`** — Extract companies from a SN saved accounts list.
- **`edges-salesnavigator-search-people`** — Search leads with filters (not from a list).

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Lead's display name |
| `headline` | string | Profile headline |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | integer | Immutable profile ID |
| `job_title` | string | Current job title |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
