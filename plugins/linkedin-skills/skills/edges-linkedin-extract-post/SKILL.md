---
name: edges-linkedin-extract-post
description: >-
  Extract LinkedIn post details including content, engagement metrics, and author data
  via the Edges API. This skill should be used when the user wants to get a post's
  content, see reaction/comment/repost counts, analyze post engagement, or extract
  details from a LinkedIn post URL. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-post/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-post/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-post/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_post_url`** (required, string, URI) — LinkedIn post URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(posts|feed)\/[\w%-]+/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Output Schema (LinkedinExtractPostOutput)
- `published_date` (date-time)
- `hyperlinks` (array of URIs)
- `post_media_url` (array of URIs)
- `content_text` (string)
- `linkedin_post_id` (string)
- `linkedin_post_url` (URI)
- `full_name`, `first_name`, `last_name` (string)
- `linkedin_profile_url` (URI)
- `linkedin_profile_id` (integer)
- `linkedin_original_post_url` (URI)
- `linkedin_post_type` (string)
- `reaction_count`, `comment_count`, `repost_count` (integer)
- `linkedin_job_url` (URI)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPost({
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

const { data } = await ed.linkedin.extractPostAsync({
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
- **`edges-linkedin-extract-post-commenters`** — Get people who commented on the post.
- **`edges-linkedin-extract-post-likers`** — Get people who liked the post.
- **`edges-linkedin-extract-post-reposters`** — Get people who reposted.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `content_text` | string | Post text content |
| `linkedin_post_url` | URI | Post URL |
| `linkedin_post_id` | string | Post ID |
| `reaction_count` | integer | Total reactions |
| `published_date` | datetime | When the post was published |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
