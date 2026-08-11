---
name: edges-linkedin-follow-profile
description: >-
  Follow a LinkedIn profile via the Edges API. This skill should be used when the user
  wants to follow someone on LinkedIn, subscribe to their content updates, or add a
  follow action to an outreach sequence. Requires a connected identity (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-follow-profile/run/live` — synchronous (single input)
- `POST /actions/linkedin-follow-profile/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-follow-profile/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
Accepts one of: `linkedin_profile_url` OR `sales_navigator_profile_id`

**`linkedin_profile_url`** (required, string (uri))
  A LinkedIn Profile URL should start with 'https://www.linkedin.com/sales/people/', 'https://www.linkedin.com/sales/lead/', 'https://www.linkedin.com/pub/' or 'https://www.linkedin.com/in/'
  Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:in|pub|sales\/people|sales\/lead)\/[^\s/]+/`

**`sales_navigator_profile_id`** (required, string)
  A sales_navigator_profile_id should start with 'ACo', 'ACw' or 'ACr'
  Must match: `/^AC[o-rw-z][\w-]+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
- `unfollow` (boolean) default: `false` — Check this to unfollow the profiles.

## Output Schema (LinkedinFollowProfileOutput)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)
- `followed` (boolean)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.followProfile({
  identity_ids: ["your-identity-uuid"],
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

const { data } = await ed.linkedin.followProfileAsync({
  identity_ids: ["your-identity-uuid"],
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

## Related Skills
- **`edges-linkedin-visit-profile`** — Visit profile (lighter engagement, recommended first).
- **`edges-linkedin-connect-profile`** — Send connection request (stronger engagement).

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `followed` | boolean | Whether the follow was successful |
| `sales_navigator_profile_id` | string | SN profile ID |
| `linkedin_profile_id` | integer | LinkedIn profile ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
