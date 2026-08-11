---
name: edges-linkedin-extract-company-affiliates
description: >-
  Extract company affiliates (subsidiaries and parent companies) from LinkedIn via the
  Edges API. This skill should be used when the user wants to find subsidiaries,
  parent companies, related entities, or corporate structure of a company. Cookieless
  (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-company-affiliates/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-company-affiliates/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-company-affiliates/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field (one of)
**`linkedin_company_url`** (string, URI) — LinkedIn company URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:sales\/)?(?:school|pub|company|showcase)\/[\w%-]+(?:\/(?:\w+)?)?/i`

OR

**`linkedin_company_id`** (number) — LinkedIn company numeric ID.

Optional: `custom_data` (object) — Custom metadata to pass through.

## Output Schema (LinkedinExtractCompanyAffiliatesOutput)
- `industry` (string)
- `followers_count` (number)
- `linkedin_company_id` (string)
- `company_name` (string)
- `linkedin_company_url` (URI)
- `affiliate_status` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractCompanyAffiliates({
  identity_mode: "managed",
  input: {
    linkedin_company_url: "https://www.linkedin.com/company/example"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractCompanyAffiliatesAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_company_url: "https://www.linkedin.com/company/example1"
    },
    {
      linkedin_company_url: "https://www.linkedin.com/company/example2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-company`** — Full company profile. Use this skill specifically for affiliate relationships.
- **`edges-linkedin-extract-similar-companies`** — Competitor/similar companies (not affiliates).

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `company_name` | string | Affiliate company name |
| `linkedin_company_url` | URI | Affiliate LinkedIn URL |
| `linkedin_company_id` | string | Immutable company ID |
| `industry` | string | Affiliate industry |
| `affiliate_status` | string | Relationship type (subsidiary, parent) |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
