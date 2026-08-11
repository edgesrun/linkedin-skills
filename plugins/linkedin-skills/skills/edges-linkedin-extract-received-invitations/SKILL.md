---
name: edges-linkedin-extract-received-invitations
description: >-
  Extract pending inbound LinkedIn connection invitations via the Edges API. Use this skill when the user wants to see who sent them connection requests, review pending invitations, or manage inbound connection requests. Requires a connected identity (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-received-invitations/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-received-invitations/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-received-invitations/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**No URL input field** — This action requires `identity_ids` with a specific identity UUID.
**IMPORTANT:** You MUST use `identity_ids` with exactly one identity UUID.

## Pagination
- `page_size`: 100 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractReceivedInvitationsOutput)
- `linkedin_invitation_id` (string)
- `linkedin_invitation_urn` (string)
- `message` (string)
- `sent_date` (string (date-time))
- `invitation_secret` (string)
- `linkedin_profile_handle` (string)
- `linkedin_profile_url` (string (uri))
- `first_name` (string)
- `last_name` (string)
- `full_name` (string)
- `title` (string)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)
- `linkedin_profile_image_url` (string (uri))

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractReceivedInvitations({
  identity_ids: ["0a92b125-6ba6-4b8a-a506-82716a02638d"],
  input: {}
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractReceivedInvitationsAsync({
  identity_ids: ["0a92b125-6ba6-4b8a-a506-82716a02638d"],
  inputs: [
    {}
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-sent-invitations`** — Outbound invitations (the reverse direction).
- **`edges-linkedin-accept-invitation`** — Accept a received invitation.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Sender's display name |
| `linkedin_invitation_id` | string | Invitation ID (needed to accept) |
| `message` | string | Note included with the invitation |
| `sent_date` | datetime | When the invitation was received |
| `linkedin_profile_url` | URI | Sender's profile URL |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
