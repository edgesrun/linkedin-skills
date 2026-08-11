---
name: edges-linkedin-like-post
description: >-
  Like a LinkedIn post via the Edges API. This skill should be used when the user wants
  to like a post on LinkedIn, react to content, or engage with someone's post as part
  of an outreach warmup. Requires a connected identity (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-like-post/run/live` — synchronous (single input)
- `POST /actions/linkedin-like-post/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-like-post/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_post_url`** (required, string, uri) — A LinkedIn Post URL should start with "https://www.linkedin.com/posts/".
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(posts|feed)\/[\w%-]+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
- `interaction_type` (string) values: `insightful`, `love`, `support`, `celebrate`, `like`, `funny`, `random` — Interaction

## Output Schema (LinkedinLikePostOutput)
- `reaction` (string)
- `linkedin_post_url` (string (uri))

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.likePost({
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

const { data } = await ed.linkedin.likePostAsync({
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
- **`edges-linkedin-comment-post`** — Comment on a post (stronger engagement signal).
- **`edges-linkedin-extract-post`** — Get post details first.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `reaction` | string | Reaction type applied |
| `linkedin_post_url` | URI | Post URL |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
