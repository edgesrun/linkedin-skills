---
name: edges-linkedin-extract-connections
description: >-
  Extract the full connections list from a LinkedIn identity's network via the Edges API.
  This skill should be used when the user wants to get all their LinkedIn connections,
  export their network, audit connection quality, or build a list of 1st-degree contacts.
  Requires a connected identity (direct mode). Supports incremental sync for monitoring
  new connections.
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-connections/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-connections/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-connections/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**No URL input field** — This action extracts YOUR connections (the identity's connections).
Requires `identity_ids` with a specific identity UUID.

**IMPORTANT:** This action does NOT support `identity_mode: "managed"` or account rotation.
You MUST use `identity_ids` with exactly one identity UUID.

## Pagination
- `page_size`: 40 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractConnectionsOutput)
- `connected_at` (date-time)
- `first_name`, `last_name`, `full_name` (string)
- `job_title` (string)
- `linkedin_profile_handle` (string)
- `linkedin_profile_url` (URI)
- `linkedin_profile_id` (integer)
- `profile_image_url` (URI)
- `sales_navigator_profile_id` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractConnections({
  identity_ids: ["0a92b125-6ba6-4b8a-a506-82716a02638d"],
  input: {}
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractConnectionsAsync({
  identity_ids: ["0a92b125-6ba6-4b8a-a506-82716a02638d"],
  inputs: [
    {}
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-followers`** — Followers of your profile (different from connections).
- **`edges-linkedin-extract-conversations`** — Conversation list — use together to detect real relationships.
- **`edges-linkedin-extract-people`** — Enrich individual connections with full profile data.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Connection's display name |
| `job_title` | string | Current job title |
| `linkedin_profile_url` | URI | Profile URL |
| `connected_at` | datetime | When the connection was established |
| `linkedin_profile_id` | integer | Immutable LinkedIn profile ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
