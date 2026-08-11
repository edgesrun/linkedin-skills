---
name: edges-linkedin-extract-people-educations
description: >-
  Extract education history from a LinkedIn profile via the Edges API.
  This skill should be used when the user wants to get someone's schools, degrees,
  fields of study, or education background. Cookieless (managed mode). Provides more
  detail than the education data returned by extract-people with sections: true.
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-people-educations/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-people-educations/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-people-educations/run/schedule` — scheduled

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

## Output Schema (LinkedinExtractPeopleEducationsOutput)
- `linkedin_profile_id` (number)
- `sales_navigator_profile_id` (string)
- `educations` (array of objects):
  - `title` (string)
  - `degree_name` (string)
  - `field_of_study` (string)
  - `school_name` (string)
  - `school_description` (string)
  - `linkedin_school_url` (URI)
  - `linkedin_school_id` (integer)
  - `date` (string)
  - `company_logo_url` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPeopleEducations({
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

const { data } = await ed.linkedin.extractPeopleEducationsAsync({
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
- **`edges-linkedin-extract-people`** — Returns basic education with `sections: true`. Use this skill for full education detail.
- **`edges-linkedin-extract-people-experiences`** — Work history for the same person.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `school_name` | string | School name |
| `degree_name` | string | Degree type |
| `field_of_study` | string | Field of study |
| `date` | string | Date range |
| `linkedin_school_url` | URI | School LinkedIn URL |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
