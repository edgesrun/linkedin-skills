---
name: edges-salesnavigator-visit-company
description: >-
  Visit a company page on Sales Navigator via the Edges API. Use this skill when the user wants to view a company on SN to get growth signals, activity data, or leave a view trace. Requires a connected identity with SN subscription (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/salesnavigator-visit-company/run/live` — synchronous (single input)
- `POST /actions/salesnavigator-visit-company/run/async` — asynchronous (batch inputs)
- `POST /actions/salesnavigator-visit-company/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`sales_navigator_company_url`** (required, string, uri) — A Sales Navigator Company URL should start with 'https://www.linkedin.com/sales/company/'
Must match: `/^^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/company\/.+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Output Schema (SalesnavigatorVisitCompanyOutput)
- `sales_navigator_company_id` (integer)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.visitCompany({
  identity_ids: ["your-identity-uuid"],
  input: {
    sales_navigator_company_url: "https://www.linkedin.com/sales/company/1234567890"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.visitCompanyAsync({
  identity_ids: ["your-identity-uuid"],
  inputs: [
    {
      sales_navigator_company_url: "https://www.linkedin.com/company/example1"
    },
    {
      sales_navigator_company_url: "https://www.linkedin.com/company/example2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-visit-company`** — Visit via standard LinkedIn.
- **`edges-salesnavigator-search-company-employees`** — Search employees at the visited company.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `sales_navigator_company_id` | integer | SN company ID of visited company |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
