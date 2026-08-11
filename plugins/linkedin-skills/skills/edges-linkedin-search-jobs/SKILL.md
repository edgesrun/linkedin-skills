---
name: edges-linkedin-search-jobs
description: >-
  Search for job postings on LinkedIn via the Edges API. This skill should be used when
  the user wants to find jobs by keyword, company, or location, search open positions,
  monitor hiring activity, or track job postings by region. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-search-jobs/run/live` — synchronous (single input)
- `POST /actions/linkedin-search-jobs/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-search-jobs/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_job_search_url`** (required, string, uri) — A LinkedIn Job Search URL should start with 'https://www.linkedin.com/jobs/search/'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/jobs\/search\/?\?\S+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 50 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinSearchJobsOutput)
- `linkedin_job_id` (integer)
- `linkedin_job_url` (string (uri))
- `sponsored` (boolean)
- `linkedin_job_application_url` (string (uri))
- `new` (boolean)
- `job_location` (string)
- `target_job_title` (string)
- `remote` (boolean)
- `listed_at` (string (date-time))
- `expire_at` (string (date-time))
- `source_domain` (string)
- `initial_query` (string)
- `applicants_count` (integer)
- `posted_at` (string (date-time))

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchJobs({
  identity_mode: "managed",
  input: {
    linkedin_job_search_url: "https://www.linkedin.com/jobs/search/?keywords=engineer"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchJobsAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_job_search_url: "URL_1"
    },
    {
      linkedin_job_search_url: "URL_2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-job`** — Extract full details from a found job listing.
- **`edges-linkedin-extract-company`** — Get company data for the hiring company.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `target_job_title` | string | Job title |
| `linkedin_job_url` | URI | Job listing URL |
| `linkedin_job_id` | integer | Job ID |
| `job_location` | string | Job location |
| `applicants_count` | integer | Number of applicants |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
