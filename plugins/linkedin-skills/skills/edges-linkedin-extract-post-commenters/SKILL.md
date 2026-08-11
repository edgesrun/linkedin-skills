---
name: edges-linkedin-extract-post-commenters
description: >-
  Extract people who commented on a LinkedIn post via the Edges API. Use this skill when the user wants to get commenters on a specific post, build a list of engaged prospects, or analyze comment engagement. Live mode returns 20 per page (paginate). For full list without manual pagination, use async mode. Note: nested replies are not accessible. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-post-commenters/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-post-commenters/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-post-commenters/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_post_url`** (required, string, URI) — LinkedIn post URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(posts|feed)\/[\w%-]+/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sort_order` | string | `"newest"` | Sort order: `newest` or `relevant` |

## Pagination
- `page_size`: 10 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractPostCommentersOutput)
- `first_name`, `last_name`, `full_name` (string)
- `linkedin_profile_id` (integer)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_handle` (string)
- `linkedin_profile_picture` (string)
- `summary` (string)
- `linkedin_profile_url` (URI)
- `linkedin_connection_degree` (string)
- `comment_text` (string)
- `comment_time` (date-time)
- `comment_like_count` (number)
- `comment_reply_count` (number)
- `last_reply` (string)
- `linkedin_comment_url` (URI)
- `linkedin_comment_id` (string)
- `linkedin_post_url` (URI)
- `linkedin_post_id` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPostCommenters({
  identity_mode: "managed",
  parameters: {
    sort_order: "newest"
  },
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

const { data } = await ed.linkedin.extractPostCommentersAsync({
  identity_mode: "managed",
  parameters: {
    sort_order: "newest"
  },
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

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Commenter's display name |
| `comment_text` | string | Comment content |
| `comment_time` | datetime | When the comment was posted |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | integer | Immutable profile ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
