---
name: edges-salesnavigator-search-metrics
description: >-
  Get the result count for a Sales Navigator search without extracting results via the Edges API. Use this skill BEFORE running a full search to check how many results a query returns. Helps plan pagination and query refinement — use multiple query combinations and check metrics before extracting. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/salesnavigator-search-metrics/run/live` — synchronous (single input)
- `POST /actions/salesnavigator-search-metrics/run/async` — asynchronous (batch inputs)
- `POST /actions/salesnavigator-search-metrics/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
Accepts one of: `sales_navigator_company_id` OR `sales_navigator_profile_search_url`

**`sales_navigator_company_id`** (required, string)
  Must match: `/^\d+$/`

**`sales_navigator_profile_search_url`** (required, string (uri))
  A Sales Navigator Company Search URL should start with 'https://www.linkedin.com/sales/search/people'
  Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/search\/people.+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
- `geo` (string) default: `""` — Filter employees by geography. Sales Navigator/LinkedIn numbers describing the location you want to search people in. For example 'Paris, Ile-de-France' is 101240143, 'Greater Lyon Area' is 90009674 and 'France' is 105015875. To cumulate several location, you must seprate each location with a comma.
- `geography_excluded` (array) default: `[]` — Filter by locations (e.g. United States).
- `function` (string) default: `""` — Filter employees by function using Sales Navigator numbers that describe the department you want to search people in. For example, 'Sales' is represented by 25, and 'Business Development' by 4. To select multiple functions, separate each number with a comma without spaces.
- `function_excluded` (array) default: `[]` — Filter employees by function using Sales Navigator numbers that describe the department you want to search people in. For example, 'Sales' is represented by 25, and 'Business Development' by 4. To select multiple functions, separate each number with a comma without spaces.
- `seniority` (array) default: `[]` — Filter employees by their seniority level.
- `seniority_level_excluded` (array) default: `[]` — Filter employees by their seniority level.
- `employees_title` (string) default: `""` — Add a title to the employees search.
- `current_job_title_excluded` (array) default: `[]` — Filter employees by title.
- `exclude_saved_leads` (boolean) default: `false` — Remove saved leads from search.
- `exclude_crm_contacts` (boolean) default: `false` — Remove CRM contacts from search.
- `exclude_viewed_leads` (boolean) default: `false` — Remove viewed Leads from search.
- `keywords` (string) default: `""` — Add keywords to the employees search.

## Output Schema (SalesnavigatorSearchMetricsOutput)
- `sales_navigator_company_url` (string (uri))
- `company_name` (string)
- `sales_navigator_company_id` (integer)
- `linkedin_company_url` (string (uri))
- `total_leads` (integer)
- `new_leads` (string)
- `leads_posted_recently` (string)
- `leads_mentioned_in_news` (string)
- `leads_with_common_experience` (string)
- `leads_following_your_company` (string)
- `leads_past_colleague` (string)
- `leads_teamlink_your_executives` (string)
- `leads_viewed_profile_recently` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.searchMetrics({
  identity_mode: "managed",
  input: {
    sales_navigator_company_id: "EXAMPLE_VALUE"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.searchMetricsAsync({
  identity_mode: "managed",
  inputs: [
    {
      sales_navigator_company_id: "value1"
    },
    {
      sales_navigator_company_id: "value2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-salesnavigator-search-people`** — Run the actual search to get profiles.
- **`edges-salesnavigator-search-companies`** — Search companies on SN.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `total_leads` | integer | Total lead count for the search |
| `new_leads` | string | New leads since last check |
| `leads_posted_recently` | string | Leads who posted recently |
| `company_name` | string | Company name (if company-scoped search) |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
