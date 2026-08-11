---
name: edges-linkedin-visit-company
description: >-
  Visit a company page on LinkedIn to leave a view trace via the Edges API. This does NOT extract company data — it only registers a page view. To get company information, use edges-linkedin-extract-company instead. Use this as part of an outreach warm-up or monitoring workflow. Requires a connected identity (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-visit-company/run/live` — synchronous (single input)
- `POST /actions/linkedin-visit-company/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-visit-company/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_company_url`** (required, string, uri) — A LinkedIn Company URL should start with 'https://www.linkedin.com/sales/company', 'https://www.linkedin/showcase' 'https://www.linkedin.com/company' or 'https://www.linkedin.com/school'"
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:sales\/)?(?:school|pub|company|showcase)\/[\w%-]+(?:\/(?:\w+)?)?/i`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Output Schema (LinkedinVisitCompanyOutput)
- `linkedin_company_id` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.visitCompany({
  identity_ids: ["your-identity-uuid"],
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

const { data } = await ed.linkedin.visitCompanyAsync({
  identity_ids: ["your-identity-uuid"],
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

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
