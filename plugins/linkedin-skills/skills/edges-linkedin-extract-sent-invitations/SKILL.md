---
name: edges-linkedin-extract-sent-invitations
description: >-
  Extract pending outbound LinkedIn connection invitations via the Edges API. Use this skill when the user wants to see connection requests they have sent that are still pending, audit outreach pipeline, or find invitations to withdraw. Requires a connected identity (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-sent-invitations/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-sent-invitations/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-sent-invitations/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**No URL input field** — This action requires `identity_ids` with a specific identity UUID.
**IMPORTANT:** You MUST use `identity_ids` with exactly one identity UUID.

## Pagination
- `page_size`: 100 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractSentInvitationsOutput)
- `linkedin_invitation_id` (string)
- `linkedin_invitation_urn` (string)
- `sent_date` (string)
- `linkedin_profile_url` (string (uri))
- `job_title` (string)
- `full_name` (string)
- `first_name` (string)
- `last_name` (string)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractSentInvitations({
  identity_ids: ["0a92b125-6ba6-4b8a-a506-82716a02638d"],
  input: {}
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractSentInvitationsAsync({
  identity_ids: ["0a92b125-6ba6-4b8a-a506-82716a02638d"],
  inputs: [
    {}
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-received-invitations`** — Inbound invitations (the reverse direction).
- **`edges-linkedin-withdraw-invitation`** — Withdraw a pending sent invitation.
- **`edges-linkedin-connect-profile`** — Send new connection requests.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Invitee's display name |
| `linkedin_invitation_id` | string | Invitation ID (needed to withdraw) |
| `sent_date` | string | When the invitation was sent |
| `linkedin_profile_url` | URI | Invitee's profile URL |
| `linkedin_profile_id` | integer | Immutable LinkedIn profile ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
