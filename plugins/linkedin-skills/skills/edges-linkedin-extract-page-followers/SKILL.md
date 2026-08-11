---
name: edges-linkedin-extract-page-followers
description: >-
  Extract followers of a LinkedIn company page via the Edges API. Use this skill when the user wants to get a list of people following a company page, audit company page followers, or prospect from a company's audience. Requires admin access to the company page (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-page-followers/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-page-followers/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-page-followers/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field (one of)
**`linkedin_company_url`** (string, URI) — LinkedIn company/school/showcase page URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:sales\/)?(?:school|pub|company|showcase)\/[\w%-]+(?:\/(?:\w+)?)?/i`

OR

**`linkedin_company_id`** (number) — LinkedIn company numeric ID.

Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 40 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractPageFollowersOutput)
- `first_name`, `last_name`, `full_name` (string)
- `sales_navigator_profile_id` (string)
- `headline` (string)
- `linkedin_profile_handle` (string)
- `linkedin_profile_url` (URI)
- `followed_at` (string)
- `profile_image_url` (URI)
- `linkedin_people_post_search_url` (URI)
- `linkedin_profile_id` (integer)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPageFollowers({
  identity_ids: ["your-identity-uuid"],
  input: {
    linkedin_company_url: "https://www.linkedin.com/company/example"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPageFollowersAsync({
  identity_ids: ["your-identity-uuid"],
  inputs: [
    {
      linkedin_company_url: "https://www.linkedin.com/company/example1"
    },
    {
      linkedin_company_url: "https://www.linkedin.com/company/example2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-followers`** — Followers of a personal profile (not a company page).
- **`edges-linkedin-extract-company`** — Company profile data.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Follower's display name |
| `headline` | string | Profile headline |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | integer | Immutable profile ID |
| `profile_image_url` | URI | Profile photo URL |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
