---
name: edges-linkedin-extract-job
description: >-
  Extract details of a LinkedIn job posting via the Edges API. Use this skill when the user wants to get job listing details including title, company, description, requirements, and location from a LinkedIn job URL. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-job/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-job/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-job/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_job_url`** (required, string, URI) — LinkedIn job listing URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/jobs\/view\/\d+(?:\/[\w?=%&]+)?/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Output Schema (LinkedinExtractJobOutput)
- `linkedin_job_id` (integer)
- `job_location` (string)
- `linkedin_job_url` (URI)
- `field` (string)
- `job_description` (string)
- `type` (string)
- `title` (string)
- `remote_allowed` (boolean)
- `skills` (array of strings)
- `linkedin_company_id` (string)
- `linkedin_company_url` (string)
- `company_name` (string)
- `linkedin_job_application_url` (URI)
- `profile_full_name` (string)
- `linkedin_profile_id` (integer)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_url` (URI)
- `posted_at` (date-time)
- `reposted_at` (date-time)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractJob({
  identity_mode: "managed",
  input: {
    linkedin_job_url: "https://www.linkedin.com/jobs/view/1234567890"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractJobAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_job_url: "https://www.linkedin.com/jobs/view/1234567890"
    },
    {
      linkedin_job_url: "https://www.linkedin.com/jobs/view/0987654321"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-search-jobs`** — Search for job postings by keyword, company, or region.
- **`edges-linkedin-extract-company`** — Get company profile data for the hiring company.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `title` | string | Job title |
| `company_name` | string | Hiring company |
| `job_location` | string | Job location |
| `linkedin_job_url` | URI | Job listing URL |
| `linkedin_job_id` | integer | Job ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
