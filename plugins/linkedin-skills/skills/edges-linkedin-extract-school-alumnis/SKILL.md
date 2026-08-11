---
name: edges-linkedin-extract-school-alumnis
description: >-
  Extract alumni from a LinkedIn school page via the Edges API. Use this skill when the user wants to find graduates from a university, build an alumni list, or prospect by school network. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-school-alumnis/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-school-alumnis/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-school-alumnis/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_school_url`** (required, string, URI) — LinkedIn school URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/school\/[\w-]+/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 10 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractSchoolAlumnisOutput)
- `full_name` (string)
- `headline` (string)
- `linkedin_profile_handle` (string)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)
- `connection_degree` (string)
- `profile_image_url` (URI)
- `linkedin_profile_url` (URI)
- `school_name` (string)
- `linkedin_people_post_search_url` (URI)
- `sales_navigator_profile_url` (URI)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractSchoolAlumnis({
  identity_mode: "managed",
  input: {
    linkedin_school_url: "https://www.linkedin.com/school/harvard-university"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractSchoolAlumnisAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_school_url: "https://www.linkedin.com/school/harvard-university"
    },
    {
      linkedin_school_url: "https://www.linkedin.com/school/stanford-university"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-search-schools`** — Search for schools by keyword first.
- **`edges-linkedin-extract-people`** — Enrich individual alumni with full profile data.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Alumnus display name |
| `headline` | string | Profile headline |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | integer | Immutable profile ID |
| `school_name` | string | School name |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
