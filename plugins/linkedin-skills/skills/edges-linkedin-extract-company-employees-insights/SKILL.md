---
name: edges-linkedin-extract-company-employees-insights
description: >-
  Extract employee insights and headcount breakdown from a LinkedIn company page via the
  Edges API. This skill should be used when the user wants to see employee distribution
  by department, location, or school, analyze a company's workforce composition, or
  get headcount by function and seniority. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-company-employees-insights/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-company-employees-insights/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-company-employees-insights/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field (one of)
**`linkedin_company_url`** (string, URI) — LinkedIn company URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:sales\/)?(?:school|pub|company|showcase)\/[\w%-]+(?:\/(?:\w+)?)?/i`

OR

**`linkedin_company_id`** (number) — LinkedIn company numeric ID.

Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `affiliates` | boolean | `false` | Include insights from affiliated entities |

## Output Schema (LinkedinExtractCompanyEmployeesInsightsOutput)
- `linkedin_company_url` (string)
- `linkedin_company_handle` (string)
- `linkedin_company_id` (integer)
- `locations` (array of `{name: string, count: integer}`)
- `schools` (array of `{name: string, linkedin_school_id: integer, count: integer}`)
- `functions` (array of `{name: string, count: integer}`)
- `skills` (array of `{name: string, count: integer}`)
- `fields_of_study` (array of `{name: string, count: integer}`)
- `connection_degrees` (array of `{connection_degree: string, count: integer}`)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractCompanyEmployeesInsights({
  identity_mode: "managed",
  parameters: {
    affiliates: false
  },
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

const { data } = await ed.linkedin.extractCompanyEmployeesInsightsAsync({
  identity_mode: "managed",
  parameters: {
    affiliates: false
  },
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
- **`edges-linkedin-extract-company`** — Full company profile data. Use this skill for employee insights breakdown.
- **`edges-salesnavigator-extract-employees-distribution`** — SN-powered department/seniority/location breakdown.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `functions` | array | Employee distribution by department/function |
| `locations` | array | Employee distribution by location |
| `schools` | array | Employee distribution by school/university |
| `linkedin_company_id` | integer | Immutable company ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
