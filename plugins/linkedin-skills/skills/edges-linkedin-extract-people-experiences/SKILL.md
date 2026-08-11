---
name: edges-linkedin-extract-people-experiences
description: >-
  Extract complete work experience history from a LinkedIn profile via the Edges API.
  This skill should be used when the user needs full job history, wants all positions
  beyond the last 5 returned by extract-people, or needs to analyze someone's complete
  career trajectory. Cookieless (managed mode). Note: linkedin-extract-people only
  returns the last 5 experiences — use this skill for complete history paginated in
  chunks of 20.
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-people-experiences/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-people-experiences/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-people-experiences/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field (one of)
**`linkedin_profile_url`** (string, URI) — LinkedIn profile URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:in|pub|sales\/people|sales\/lead)\/[^\s/]+/`

OR

**`sales_navigator_profile_id`** (string) — Sales Navigator profile ID.
Must match: `/^AC[o-rw-z][\w-]+/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 20 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractPeopleExperiencesOutput)
- `linkedin_profile_id` (number)
- `sales_navigator_profile_id` (string)
- `experiences` (array of objects):
  - `title` (string)
  - `company_name` (string)
  - `company_description` (string)
  - `linkedin_company_url` (URI)
  - `location` (string)
  - `linkedin_company_id` (number)
  - `job_contract_type` (string)
  - `date` (string)
  - `job_time_period` (string)
  - `company_logo_url` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPeopleExperiences({
  identity_mode: "managed",
  input: {
    linkedin_profile_url: "https://www.linkedin.com/in/someone"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPeopleExperiencesAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_profile_url: "https://www.linkedin.com/in/someone1"
    },
    {
      linkedin_profile_url: "https://www.linkedin.com/in/someone2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-people`** — Returns last 5 experiences only. Use this skill for complete history.
- **`edges-linkedin-extract-people-educations`** — Education history for the same person.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `title` | string | Job title |
| `company_name` | string | Company name |
| `linkedin_company_url` | URI | Company LinkedIn URL |
| `linkedin_company_id` | number | Immutable company ID |
| `date` | string | Date range (e.g., 'Jan 2020 - Present') |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
