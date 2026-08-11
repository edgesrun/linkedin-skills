---
name: edges-linkedin-withdraw-invitation
description: >-
  Withdraw a single pending LinkedIn connection invitation via the Edges API. Use this skill when the user wants to cancel a connection request they sent. Requires a connected identity (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-withdraw-invitation/run/live` — synchronous (single input)
- `POST /actions/linkedin-withdraw-invitation/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-withdraw-invitation/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_invitation_urn`** (required, string) — The invitation URN. e.g., urn:li:fsd_invitation:1234567890
Must match: `/^urn:li:fsd_invitation:\d+$/`

Optional: **`linkedin_invitation_type`** (string)
  The type of the invitation (e.g., CONNECTION, FOLLOWER, etc.)

Optional: `custom_data` (object) — Custom metadata to pass through.

## Output Schema (LinkedinWithdrawInvitationOutput)
- `linkedin_invitation_id` (string)
- `linkedin_invitation_urn` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.withdrawInvitation({
  identity_ids: ["your-identity-uuid"],
  input: {
    linkedin_invitation_urn: "EXAMPLE_VALUE"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.withdrawInvitationAsync({
  identity_ids: ["your-identity-uuid"],
  inputs: [
    {
      linkedin_invitation_urn: "value1"
    },
    {
      linkedin_invitation_urn: "value2"
    }
  ]
});
console.log(data);
```

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
