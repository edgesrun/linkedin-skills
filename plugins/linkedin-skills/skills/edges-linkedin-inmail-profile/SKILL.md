---
name: edges-linkedin-inmail-profile
description: >-
  Send an InMail to a LinkedIn profile via the Edges API. This skill should be used when
  the user wants to send an InMail, message someone without being connected, or reach
  out to a non-connection via InMail credits. Requires a connected identity (direct
  mode) with InMail credits available.
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-inmail-profile/run/live` — synchronous (single input)
- `POST /actions/linkedin-inmail-profile/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-inmail-profile/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_profile_url`** (required, string, uri) — A LinkedIn Profile URL should start with 'https://www.linkedin.com/sales/people/', 'https://www.linkedin.com/sales/lead/', 'https://www.linkedin.com/pub/' or 'https://www.linkedin.com/in/'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:in|pub|sales\/people|sales\/lead)\/[^\s/]+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Parameters
- `message` (string) default: `""` — The message to send
- `subject` (string) default: `""` — The subject of the message
- `files` (array) — Optional list of files to attach to the message. Each attachment must be provided as a Base64-encoded file along with its original filename.

## Output Schema (LinkedinInmailProfileOutput)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)
- `message` (string)
- `linkedin_thread_id` (string)
- `linkedin_thread_url` (string (uri))
- `is_sent` (boolean)
- `linkedin_people_post_search_url` (string (uri))
- `delivered_at` (string (date-time))
- `linkedin_message_id` (string)
- `attachments` (array)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.inmailProfile({
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

const { data } = await ed.linkedin.inmailProfileAsync({
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
- **`edges-linkedin-message-profile`** — Message via DM (must be 1st-degree connection).
- **`edges-linkedin-connect-profile`** — Send connection request instead.
- **`edges-salesnavigator-inmail-profile`** — InMail via Sales Navigator.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `is_sent` | boolean | Whether the InMail was sent successfully |
| `message` | string | Status message |
| `linkedin_thread_id` | string | Thread ID |
| `linkedin_thread_url` | URI | URL to the conversation |
| `linkedin_profile_id` | integer | Recipient profile ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
