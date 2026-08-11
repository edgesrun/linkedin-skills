---
name: edges-salesnavigator-inmail-profile
description: >-
  Send an InMail via Sales Navigator and the Edges API. This skill should be used when
  the user wants to message someone through SN InMail, send a message without being
  connected, or reach out to a lead via Sales Navigator InMail. Requires a connected
  identity (direct mode) with InMail credits.
license: Apache-2.0
---

## Endpoint
- `POST /actions/salesnavigator-inmail-profile/run/live` — synchronous (single input)
- `POST /actions/salesnavigator-inmail-profile/run/async` — asynchronous (batch inputs)
- `POST /actions/salesnavigator-inmail-profile/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`sales_navigator_profile_url`** (required, string, uri) — A Sales Navigator Profile URL should start with 'https://www.linkedin.com/sales/people/' or 'https://www.linkedin.com/sales/lead/' and should contain 'name' or 'NAME_SEARCH'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/(?:people|lead)\/([\w-]+),(?:name|NAME_SEARCH),([\w-]+)/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
- `subject` (string) default: `""` — The subject of the message
- `message` (string) default: `""` max 1900 chars — The message to send
- `files` (array) — Optional list of files to attach to the message. Each attachment must be provided as a Base64-encoded file along with its original filename.
- `smart_links` (object)

## Output Schema (SalesnavigatorInmailProfileOutput)
- `message` (string)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)
- `linkedin_thread_id` (string)
- `linkedin_message_id` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.inmailProfile({
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

const { data } = await ed.salesnavigator.inmailProfileAsync({
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
- **`edges-linkedin-inmail-profile`** — InMail via standard LinkedIn.
- **`edges-salesnavigator-connect-profile`** — Send connection request instead.
- **`edges-linkedin-message-profile`** — Message via LinkedIn (must be connected).

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `message` | string | Status message |
| `sales_navigator_profile_id` | string | SN profile ID |
| `linkedin_profile_id` | integer | LinkedIn profile ID |
| `linkedin_thread_id` | string | Thread ID |
| `linkedin_message_id` | string | Message ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
