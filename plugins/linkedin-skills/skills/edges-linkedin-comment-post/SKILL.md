---
name: edges-linkedin-comment-post
description: >-
  Comment on a LinkedIn post via the Edges API. This skill should be used when the user
  wants to comment on a post, add a reply to LinkedIn content, or engage with someone's
  post with a written response. Requires a connected identity (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-comment-post/run/live` — synchronous (single input)
- `POST /actions/linkedin-comment-post/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-comment-post/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
Accepts one of: `linkedin_post_url` OR `linkedin_comment_url`

**`linkedin_post_url`** (required, string (uri))
  A LinkedIn Post URL should start with "https://www.linkedin.com/posts/".
  Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(posts|feed)\/[\w%-]+/`

**`linkedin_comment_url`** (required, string (uri))
  A comment URL should start with "https://www.linkedin.com/feed/update".
  Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/feed\/update\/[\w%-]+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
- `comment` (string) default: `100` — The comment to post.

## Output Schema (LinkedinCommentPostOutput)
- `linkedin_url` (string (uri))
- `thread_urn` (string)
- `comment` (string)
- `created_at` (string (date-time))

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.commentPost({
  identity_ids: ["your-identity-uuid"],
  input: {
    linkedin_post_url: "https://www.linkedin.com/feed/update/urn:li:activity:1234567890"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.commentPostAsync({
  identity_ids: ["your-identity-uuid"],
  inputs: [
    {
      linkedin_post_url: "URL_1"
    },
    {
      linkedin_post_url: "URL_2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-like-post`** — Like a post (lighter engagement signal).
- **`edges-linkedin-extract-post`** — Get post details first.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `comment` | string | Comment text posted |
| `linkedin_url` | URI | URL of the comment |
| `thread_urn` | string | Comment thread URN |
| `created_at` | datetime | When the comment was posted |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
