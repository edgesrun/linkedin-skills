---
name: edges-linkedin-extract-similar-companies
description: >-
  Extract companies similar to a given company on LinkedIn via the Edges API. Use this skill when the user wants to find competitors, discover companies in the same space, or expand a target account list. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-similar-companies/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-similar-companies/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-similar-companies/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field (one of)
**`linkedin_company_url`** (string, URI) — LinkedIn company URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:sales\/)?(?:school|pub|company|showcase)\/[\w%-]+(?:\/(?:\w+)?)?/i`

OR

**`linkedin_company_id`** (number) — LinkedIn company numeric ID.

Optional: `custom_data` (object) — Custom metadata to pass through.

## Output Schema (LinkedinExtractSimilarCompaniesOutput)
- `company_name` (string)
- `linkedin_company_id` (string)
- `linkedin_company_url` (URI)
- `industry` (string)
- `followers_count` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractSimilarCompanies({
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

const { data } = await ed.linkedin.extractSimilarCompaniesAsync({
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
- **`edges-linkedin-extract-company`** — Full company profile. Use this skill for competitor discovery.
- **`edges-linkedin-extract-company-affiliates`** — Subsidiaries/parent companies (not competitors).

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `company_name` | string | Similar company name |
| `linkedin_company_url` | URI | Company LinkedIn URL |
| `linkedin_company_id` | string | Immutable company ID |
| `industry` | string | Industry classification |
| `followers_count` | string | Company followers count |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
