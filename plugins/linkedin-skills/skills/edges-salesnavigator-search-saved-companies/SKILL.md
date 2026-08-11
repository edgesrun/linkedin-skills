---
name: edges-salesnavigator-search-saved-companies
description: >-
  Execute a saved company search on Sales Navigator via the Edges API. Use this skill when the user has a saved company search in SN and wants to run it. Requires a connected Sales Navigator identity (`identity_ids`). Does not support managed mode.
license: Apache-2.0
---

## Endpoint
- `POST /actions/salesnavigator-search-saved-companies/run/live` — synchronous (single input)
- `POST /actions/salesnavigator-search-saved-companies/run/async` — asynchronous (batch inputs)
- `POST /actions/salesnavigator-search-saved-companies/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Identity Mode
**Direct mode required** — pass a connected Sales Navigator identity.

```json
{ "identity_ids": ["your-identity-uuid"] }
```

**IMPORTANT:** This action does NOT support `identity_mode: "managed"`. You MUST use `identity_ids`.

## Input Field
**`sales_navigator_company_search_url`** (required, string, uri) — A Sales Navigator Company Search URL should start with 'https://www.linkedin.com/sales/search/company'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/search\/company(?=.*\bsavedSearchId=).+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 25 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (SalesnavigatorSearchSavedCompaniesOutput)
- `sales_navigator_search_url` (string (uri))
- `company_name` (string)
- `sales_navigator_company_url` (string (uri))
- `description` (string)
- `category` (string)
- `number_employees` (string)
- `sales_navigator_employees_url` (string (uri))
- `sales_navigator_company_id` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.searchSavedCompanies({
  identity_ids: ["your-identity-uuid"],
  input: {
    sales_navigator_company_search_url: "https://www.linkedin.com/sales/search/company?savedSearchId=123"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.searchSavedCompaniesAsync({
  identity_ids: ["your-identity-uuid"],
  inputs: [
    {
      sales_navigator_company_search_url: "https://www.linkedin.com/sales/search/company?savedSearchId=111"
    },
    {
      sales_navigator_company_search_url: "https://www.linkedin.com/sales/search/company?savedSearchId=222"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-salesnavigator-search-companies`** — Run a new SN company search (not a saved search).
- **`edges-salesnavigator-extract-accounts-list`** — Extract from a saved accounts list (not a saved search).

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `company_name` | string | Company name |
| `sales_navigator_company_url` | URI | SN company URL |
| `sales_navigator_company_id` | string | SN company ID |
| `category` | string | Industry category |
| `description` | string | Company description |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
