---
name: edges-salesnavigator-connect-profile
description: >-
  Send a connection request via Sales Navigator via the Edges API. Use this skill when the user wants to connect with someone from within Sales Navigator. For standard LinkedIn connection requests, use edges-linkedin-connect-profile. Requires a connected identity with SN subscription (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/salesnavigator-connect-profile/run/live` — synchronous (single input)
- `POST /actions/salesnavigator-connect-profile/run/async` — asynchronous (batch inputs)
- `POST /actions/salesnavigator-connect-profile/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
Accepts one of: `sales_navigator_profile_url` OR `sales_navigator_profile_id`

**`sales_navigator_profile_url`** (required, string (uri))
  A Sales Navigator Profile URL should start with 'https://www.linkedin.com/sales/people/'
  Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/(people|lead)\/.+/`

**`sales_navigator_profile_id`** (required, string)
  A sales_navigator_profile_id should start with 'ACo', 'ACw' or 'ACr'
  Must match: `/^AC[o-rw-z][\w-]+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
- `message` (string) default: `"Hello {{first_name}}, \n\nI'm a huge fan of XXX.\nWould you be willing to share your best techniques regarding XXX?\n\nHave a nice day,\nJohn"` — Your custom message, maximum length is 300 (to take into account when using liquid)

## Output Schema (SalesnavigatorConnectProfileOutput)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)
- `connected` (boolean)
- `pending` (boolean)
- `message` (string)
- `connection_sent_date` (string (date))

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.connectProfile({
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

const { data } = await ed.salesnavigator.connectProfileAsync({
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
- **`edges-linkedin-connect-profile`** — Connection request via standard LinkedIn.
- **`edges-salesnavigator-visit-profile`** — Visit profile first (recommended before connecting).
- **`edges-salesnavigator-inmail-profile`** — Send InMail via SN instead.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `connected` | boolean | Whether already connected |
| `pending` | boolean | Whether invitation is now pending |
| `connection_sent_date` | date | Date invitation was sent |
| `sales_navigator_profile_id` | string | SN profile ID |
| `linkedin_profile_id` | integer | LinkedIn profile ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
