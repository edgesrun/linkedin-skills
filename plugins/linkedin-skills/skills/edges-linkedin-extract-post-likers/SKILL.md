---
name: edges-linkedin-extract-post-likers
description: >-
  Extract people who liked a LinkedIn post via the Edges API. Use this skill when the user wants to get likers on a specific post, build a list of engaged prospects, or analyze reaction engagement. Live mode returns 20 per page (paginate). For full list without manual pagination, use async mode. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-post-likers/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-post-likers/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-post-likers/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_post_url`** (required, string, URI) — LinkedIn post URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(posts|feed)\/[\w%-]+/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 30 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractPostLikersOutput)
- `full_name`, `first_name`, `last_name` (string)
- `reaction_type` (string)
- `reaction_urn` (string)
- `linkedin_profile_url` (URI)
- `liker_connection_degree` (string)
- `sales_navigator_profile_id` (string)
- `sales_navigator_profile_url` (URI)
- `job_title` (string)
- `linkedin_profile_id` (integer)
- `linkedin_people_post_search_url` (URI)
- `linkedin_post_url` (URI)
- `linkedin_post_id` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPostLikers({
  identity_mode: "managed",
  input: {
    linkedin_post_url: "https://www.linkedin.com/posts/someone_topic-activity-1234567890"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPostLikersAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_post_url: "https://www.linkedin.com/posts/someone_topic-activity-1234567890"
    },
    {
      linkedin_post_url: "https://www.linkedin.com/posts/someone_topic-activity-0987654321"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-post`** — Get the post details first.
- **`edges-linkedin-extract-post-commenters`** — People who commented on the same post.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Liker's display name |
| `reaction_type` | string | Reaction type (like, celebrate, etc.) |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | integer | Immutable profile ID |
| `job_title` | string | Current job title |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
