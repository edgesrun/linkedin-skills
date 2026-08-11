---
name: edges-salesnavigator-extract-employees-count
description: >-
  Get employee count and headcount trends for a company via Sales Navigator and the Edges
  API. This skill should be used when the user wants to know how many employees a
  company has, track headcount growth, or get employee tenure data. Cookieless (managed
  mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/salesnavigator-extract-employees-count/run/live` — synchronous (single input)
- `POST /actions/salesnavigator-extract-employees-count/run/async` — asynchronous (batch inputs)
- `POST /actions/salesnavigator-extract-employees-count/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`sales_navigator_company_url`** (required, string, uri) — A Sales Navigator Company URL should start with 'https://www.linkedin.com/sales/company/'
Must match: `/^^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/company\/.+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Output Schema (SalesnavigatorExtractEmployeesCountOutput)
- `sales_navigator_employee_url` (string (uri))
- `sales_navigator_company_id` (string)
- `employee_median_tenure` (number)
- `total_employee_count` (integer)
- `monthly_headcounts` (array)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.extractEmployeesCount({
  identity_mode: "managed",
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

const { data } = await ed.salesnavigator.extractEmployeesCountAsync({
  identity_mode: "managed",
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
- **`edges-salesnavigator-extract-employees-distribution`** — Department/seniority/location breakdown.
- **`edges-linkedin-extract-company`** — Full company profile with basic employee count.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `total_employee_count` | integer | Total employees |
| `employee_median_tenure` | number | Median employee tenure |
| `monthly_headcounts` | array | Historical headcount data |
| `sales_navigator_company_id` | string | SN company ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
