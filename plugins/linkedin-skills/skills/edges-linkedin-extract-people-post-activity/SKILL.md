---
name: edges-linkedin-extract-people-post-activity
description: >-
  Extract posts PUBLISHED BY a specific person on LinkedIn via the Edges API.
  This skill returns posts that the person authored — their own content feed.
  Do NOT use this for finding posts that mention someone — use
  edges-linkedin-search-content for that instead. Use when the user wants to
  see what someone has been posting, analyze their content strategy, or get
  their recent LinkedIn posts.
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-people-post-activity/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-people-post-activity/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-people-post-activity/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field (one of)
**`linkedin_profile_url`** (string, URI) — LinkedIn profile URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/in\/[-\w\d%]+/gi`

OR

**`sales_navigator_profile_id`** (string) — Sales Navigator profile ID.
Must match: `/^AC[o-rw-z][\w-]+/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 20 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractPeoplePostActivityOutput)
- `comment_count` (integer)
- `reaction_count` (integer)
- `repost_count` (integer)
- `linkedin_post_id` (string)
- `linkedin_post_url` (URI)
- `published_date` (date)
- `content_text` (string)
- `linkedin_post_type` (enum: `"original"` | `"reshare"`)
- `linkedin_activity_id` (string)
- `author` (object — post author)
- `source_post` (object, nullable — referenced post)
- `activity_author` (object — timeline owner)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPeoplePostActivity({
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

const { data } = await ed.linkedin.extractPeoplePostActivityAsync({
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
