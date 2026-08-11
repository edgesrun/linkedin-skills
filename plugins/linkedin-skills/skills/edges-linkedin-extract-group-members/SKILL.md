---
name: edges-linkedin-extract-group-members
description: >-
  Extract members of a LinkedIn group via the Edges API. Use this skill when the user wants to get a list of people in a LinkedIn group, prospect from a group, or analyze group membership. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-group-members/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-group-members/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-group-members/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_group_url`** (required, string, URI) — LinkedIn group URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/groups\/\d+(?:\/)?/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `group_owner` | boolean | `true` | Extract group owner |
| `group_member` | boolean | `true` | Extract members |
| `group_manager` | boolean | `true` | Extract managers |

## Pagination
- `page_size`: 10 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractGroupMembersOutput)
- `membership_status` (string)
- `joined_at` (string)
- `linkedin_group_id` (string)
- `linkedin_profile_picture` (string)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)
- `linkedin_profile_handle` (string)
- `linkedin_connection_degree` (string)
- `summary` (string)
- `first_name`, `last_name`, `full_name` (string)
- `linkedin_profile_url` (URI)
- `linkedin_people_post_search_url` (URI)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractGroupMembers({
  identity_mode: "managed",
  parameters: {
    group_owner: true,
    group_member: true,
    group_manager: true
  },
  input: {
    linkedin_group_url: "https://www.linkedin.com/groups/8952/"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractGroupMembersAsync({
  identity_mode: "managed",
  parameters: {
    group_owner: true,
    group_member: true,
    group_manager: true
  },
  inputs: [
    {
      linkedin_group_url: "https://www.linkedin.com/groups/8952/"
    },
    {
      linkedin_group_url: "https://www.linkedin.com/groups/12345/"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-search-groups`** — Search for groups by keyword first.
- **`edges-linkedin-extract-people`** — Enrich individual members with full profile data.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Member's display name |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | integer | Immutable profile ID |
| `membership_status` | string | Membership status |
| `linkedin_connection_degree` | string | Degree of connection |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
