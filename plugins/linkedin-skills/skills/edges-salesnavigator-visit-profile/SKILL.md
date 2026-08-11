---
name: edges-salesnavigator-visit-profile
description: >-
  Visit a lead's profile on Sales Navigator via the Edges API. Use this skill when the user wants to view a lead on SN, appear in their "who viewed" section, or warm up before connecting. Requires a connected identity with SN subscription (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/salesnavigator-visit-profile/run/live` — synchronous (single input)
- `POST /actions/salesnavigator-visit-profile/run/async` — asynchronous (batch inputs)
- `POST /actions/salesnavigator-visit-profile/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`sales_navigator_profile_url`** (required, string, uri) — A Sales Navigator Profile URL should start with 'https://www.linkedin.com/sales/people/'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/(people|lead)\/.+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
- `extract_interests` (boolean) default: `false` — Extract Interests

## Output Schema (SalesnavigatorVisitProfileOutput)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.visitProfile({
  identity_ids: ["your-identity-uuid"],
  input: {
    sales_navigator_profile_url: "https://www.linkedin.com/sales/people/ACwAAA1234"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.visitProfileAsync({
  identity_ids: ["your-identity-uuid"],
  inputs: [
    {
      sales_navigator_profile_url: "URL_1"
    },
    {
      sales_navigator_profile_url: "URL_2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-visit-profile`** — Visit via standard LinkedIn (requires direct mode).
- **`edges-salesnavigator-connect-profile`** — Send connection request via SN (next outreach step).

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `sales_navigator_profile_id` | string | SN profile ID of visited person |
| `linkedin_profile_id` | integer | LinkedIn profile ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
