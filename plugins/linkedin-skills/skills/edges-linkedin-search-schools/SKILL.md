---
name: edges-linkedin-search-schools
description: >-
  Search for schools on LinkedIn via the Edges API. Use this skill when the user wants to find universities, educational institutions, or schools on LinkedIn by keyword. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-search-schools/run/live` — synchronous (single input)
- `POST /actions/linkedin-search-schools/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-search-schools/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_school_search_url`** (required, string, uri) — A LinkedIn School Search URL should start with 'https://www.linkedin.com/search/results/schools'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/search\/results\/schools\/\?\S+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 10 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinSearchSchoolsOutput)
- `school_name` (string)
- `description` (string)
- `location` (string)
- `members` (string)
- `linkedin_school_url` (string)
- `linkedin_school_id` (string)
- `linkedin_school_handle` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchSchools({
  identity_mode: "managed",
  input: {
    linkedin_school_search_url: "https://www.linkedin.com/school/example"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchSchoolsAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_school_search_url: "URL_1"
    },
    {
      linkedin_school_search_url: "URL_2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-school-alumnis`** — Extract alumni from a found school.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `school_name` | string | School name |
| `linkedin_school_url` | string | School LinkedIn URL |
| `location` | string | School location |
| `members` | string | Alumni/member count |
| `description` | string | School description |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
