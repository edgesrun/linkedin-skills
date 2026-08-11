---
name: edges-salesnavigator-extract-accounts-list
description: >-
  Extract companies from a Sales Navigator saved accounts list via the Edges API. This
  skill should be used when the user wants to export accounts from a SN list, extract
  a saved accounts list, or pull company data from a Sales Navigator list URL. Cookieless
  (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/salesnavigator-extract-accounts-list/run/live` — synchronous (single input)
- `POST /actions/salesnavigator-extract-accounts-list/run/async` — asynchronous (batch inputs)
- `POST /actions/salesnavigator-extract-accounts-list/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`sales_navigator_company_list_url`** (required, string, uri) — A Sales Navigator Accounts List URL should start with 'https://www.linkedin.com/sales/lists/company' or 'https://www.linkedin.com/sales/accounts/dashboard'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/(lists\/company.+|accounts|\/dashboard)/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 25 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (SalesnavigatorExtractAccountsListOutput)
- `category` (string)
- `sales_navigator_company_id` (string)
- `company_name` (string)
- `sales_navigator_employees_url` (string (uri))
- `location` (string)
- `number_employees` (string)
- `sales_navigator_company_url` (string (uri))
- `sales_navigator_company_list_url` (string (uri))

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.extractAccountsList({
  identity_mode: "managed",
  input: {
    sales_navigator_company_list_url: "https://www.linkedin.com/sales/lists/company/1234567890"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.extractAccountsListAsync({
  identity_mode: "managed",
  inputs: [
    {
      sales_navigator_company_list_url: "https://www.linkedin.com/company/example1"
    },
    {
      sales_navigator_company_list_url: "https://www.linkedin.com/company/example2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-salesnavigator-extract-leads-list`** — Extract leads from a SN saved leads list.
- **`edges-salesnavigator-search-companies`** — Search companies with filters (not from a list).

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `company_name` | string | Company name |
| `sales_navigator_company_id` | string | SN company ID |
| `sales_navigator_company_url` | URI | SN company URL |
| `number_employees` | string | Employee count |
| `location` | string | Company location |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
