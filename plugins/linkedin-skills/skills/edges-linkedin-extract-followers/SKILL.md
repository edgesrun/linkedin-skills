---
name: edges-linkedin-extract-followers
description: >-
  Extract the list of people following a LinkedIn profile via the Edges API. Use this skill when the user wants to see who follows their profile, audit their follower base, or analyze follower quality. Requires a connected identity (direct mode). Supports incremental sync for monitoring new followers.
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-followers/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-followers/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-followers/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**No URL input field** — This action extracts YOUR followers (the identity's followers).
Requires `identity_ids` with a specific identity UUID.

**IMPORTANT:** This action does NOT support `identity_mode: "managed"` or account rotation.
You MUST use `identity_ids` with exactly one identity UUID.

## Pagination
- `page_size`: 20 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractFollowersOutput)
- `first_name`, `last_name`, `full_name` (string)
- `job_title` (string)
- `linkedin_profile_handle` (string)
- `linkedin_profile_url` (URI)
- `linkedin_profile_id` (integer)
- `sales_navigator_profile_id` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractFollowers({
  identity_ids: ["0a92b125-6ba6-4b8a-a506-82716a02638d"],
  input: {}
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractFollowersAsync({
  identity_ids: ["0a92b125-6ba6-4b8a-a506-82716a02638d"],
  inputs: [
    {}
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-connections`** — 1st-degree connections (different from followers).
- **`edges-linkedin-extract-page-followers`** — Followers of a company page (not a personal profile).

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Follower's display name |
| `job_title` | string | Current job title |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | integer | Immutable LinkedIn profile ID |
| `sales_navigator_profile_id` | string | Immutable SN profile ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
