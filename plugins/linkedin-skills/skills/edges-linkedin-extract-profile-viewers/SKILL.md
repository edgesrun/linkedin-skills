---
name: edges-linkedin-extract-profile-viewers
description: >-
  Extract people who viewed your LinkedIn profile via the Edges API. Use this skill when the user wants to see who viewed their profile, monitor profile visits, or identify warm leads who showed interest. Requires a connected identity (direct mode). Supports incremental sync.
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-profile-viewers/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-profile-viewers/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-profile-viewers/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**No URL input field** — This action extracts who viewed YOUR profile (the identity's viewers).
Requires `identity_ids` with a specific identity UUID.

**IMPORTANT:** This action does NOT support `identity_mode: "managed"` or account rotation.
You MUST use `identity_ids` with exactly one identity UUID.

## Pagination
- `page_size`: 10 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractProfileViewersOutput)
- `view_timestamp` (integer)
- `view_date` (date-time)
- `connection_degree` (string)
- `linkedin_profile_handle` (string)
- `headline` (string)
- `linkedin_profile_url` (URI)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)
- `profile_image_url` (URI)
- `linkedin_people_post_search_url` (URI)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractProfileViewers({
  identity_ids: ["0a92b125-6ba6-4b8a-a506-82716a02638d"],
  input: {}
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractProfileViewersAsync({
  identity_ids: ["0a92b125-6ba6-4b8a-a506-82716a02638d"],
  inputs: [
    {}
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-visit-profile`** — Visit someone else's profile (the reverse action).
- **`edges-linkedin-extract-people`** — Enrich viewers with full profile data.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `headline` | string | Viewer's headline |
| `linkedin_profile_url` | URI | Viewer's profile URL |
| `view_date` | datetime | When they viewed your profile |
| `connection_degree` | string | Degree of connection |
| `linkedin_profile_id` | integer | Immutable LinkedIn profile ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
