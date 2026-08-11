---
name: edges-linkedin-search-groups
description: >-
  Search for groups on LinkedIn via the Edges API. This skill should be used when the
  user wants to find LinkedIn groups by topic, discover industry groups, or search
  for communities. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-search-groups/run/live` — synchronous (single input)
- `POST /actions/linkedin-search-groups/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-search-groups/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_group_search_url`** (required, string, uri) — A LinkedIn Group Search URL should start with 'https://www.linkedin.com/search/results/groups'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/search\/results\/groups\/\?\S+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 10 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinSearchGroupsOutput)
- `group_name` (string)
- `description` (string)
- `members` (string)
- `linkedin_group_url` (string (uri))
- `linkedin_group_id` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchGroups({
  identity_mode: "managed",
  input: {
    linkedin_group_search_url: "https://www.linkedin.com/groups/1234567"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchGroupsAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_group_search_url: "URL_1"
    },
    {
      linkedin_group_search_url: "URL_2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-group-members`** — Extract members from a found group.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `group_name` | string | Group name |
| `linkedin_group_url` | URI | Group URL |
| `linkedin_group_id` | string | Group ID |
| `members` | string | Member count |
| `description` | string | Group description |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
