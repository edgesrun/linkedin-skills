---
name: edges-linkedin-search-content
description: >-
  Search LinkedIn posts and articles by keyword via the Edges API. Use this skill when the user wants to find posts about a topic, search LinkedIn content, find posts mentioning a person or company, monitor company mentions, or discover content by keyword. Also use for finding posts FROM a company page (fromOrganization) or posts MENTIONING a company (mentionsOrganization). This is the right skill for "posts mentioning [someone]" — NOT extract-people-post-activity which returns posts published BY a person. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-search-content/run/live` — synchronous (single input)
- `POST /actions/linkedin-search-content/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-search-content/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_content_search_url`** (required, string, uri) — A LinkedIn Content Search URL should start with 'https://www.linkedin.com/search/results/content'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/search\/results\/(content|CONTENT)\/\?\S+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
- `only_extract_unique_profile` (boolean) — Indicate if we want only extract unique profile

## Pagination
- `page_size`: 10 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinSearchContentOutput)
- `author_name` (string)
- `content_text` (string)
- `headline` (string)
- `linkedin_post_url` (string (uri))
- `linkedin_post_id` (string)
- `linkedin_profile_url` (string (uri))
- `comment_count` (integer)
- `reaction_count` (integer)
- `repost_count` (integer)
- `published_time` (string)
- `published_date` (string (date))
- `profile_image_url` (string (uri))
- `linkedin_profile_handle` (string)
- `content_image_url` (string (uri))
- `linkedin_job_url` (string)
- `linkedin_profile_id` (integer)
- `linkedin_company_id` (integer)
- `linkedin_company_url` (string (uri))

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchContent({
  identity_mode: "managed",
  input: {
    linkedin_content_search_url: "https://www.linkedin.com/search/results/content/?keywords=AI"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchContentAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_content_search_url: "URL_1"
    },
    {
      linkedin_content_search_url: "URL_2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-post`** — Extract full details from a found post.
- **`edges-linkedin-extract-post-commenters`** — Get commenters on a found post.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `author_name` | string | Post author name |
| `content_text` | string | Post text content |
| `linkedin_post_url` | URI | Post URL |
| `linkedin_post_id` | string | Post ID |
| `reaction_count` | integer | Total reactions |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
