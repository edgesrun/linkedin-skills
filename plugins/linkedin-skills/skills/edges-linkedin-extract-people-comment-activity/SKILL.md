---
name: edges-linkedin-extract-people-comment-activity
description: >-
  Extract posts that a specific person COMMENTED ON via the Edges API. This returns posts where the person left a comment — their commenting activity, not comments on their posts. To get people who commented on a specific post, use edges-linkedin-extract-post-commenters instead. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-people-comment-activity/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-people-comment-activity/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-people-comment-activity/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_profile_url`** (required, string, URI) — LinkedIn profile URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/in\/[-\w\d%]+/gi`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 20 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractPeopleCommentActivityOutput)
- `comment_like_count` (number)
- `comment_reply_count` (number)
- `linkedin_comment_id` (string)
- `linkedin_comment_url` (URI)
- `comment_text` (string)
- `author_comment_reply` (string)
- `comment_time` (string)
- `linkedin_post_id` (string)
- `linkedin_post_url` (URI)
- `comment_type` (string)
- `linkedin_activity_id` (string)
- `author` (object — person or company)
- `source_post` (object, nullable)
- `activity_author` (object)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPeopleCommentActivity({
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

const { data } = await ed.linkedin.extractPeopleCommentActivityAsync({
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

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
