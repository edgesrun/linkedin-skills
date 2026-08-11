---
name: edges-linkedin-extract-post-reposters
description: >-
  Extract people who reposted a LinkedIn post via the Edges API. Use this skill when the user wants to get people who shared a specific post, analyze repost engagement, or build a list from content sharers. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-post-reposters/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-post-reposters/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-post-reposters/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_post_url`** (required, string, URI) — LinkedIn post URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(posts|feed)\/[\w%-]+/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 10 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractPostRepostersOutput)
- `first_name`, `last_name`, `full_name` (string)
- `linkedin_profile_id` (integer)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_handle` (string)
- `linkedin_profile_url` (URI)
- `sales_navigator_profile_url` (URI)
- `reposter_connection_degree` (string)
- `linkedin_post_url` (URI)
- `linkedin_repost_url` (URI)
- `linkedin_repost_id` (integer)
- `repost_text` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPostReposters({
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

const { data } = await ed.linkedin.extractPostRepostersAsync({
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
- **`edges-linkedin-extract-post-likers`** — People who liked the same post.
- **`edges-linkedin-extract-post-commenters`** — People who commented on the same post.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Reposter's display name |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | integer | Immutable profile ID |
| `linkedin_repost_url` | URI | URL of the repost |
| `repost_text` | string | Text added with the repost |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
