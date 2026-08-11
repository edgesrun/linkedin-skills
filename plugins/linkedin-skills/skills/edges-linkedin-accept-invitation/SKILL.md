---
name: edges-linkedin-accept-invitation
description: >-
  Accept a single LinkedIn connection invitation via the Edges API. Use this skill when the user wants to accept a pending connection request. Requires a connected identity (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-accept-invitation/run/live` — synchronous (single input)
- `POST /actions/linkedin-accept-invitation/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-accept-invitation/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
Accepts one of: `linkedin_invitation_urn` OR `linkedin_invitation_secret`

**`linkedin_invitation_urn`** (required, string)
  The invitation URN. e.g., urn:li:fsd_invitation:1234567890
  Must match: `/^urn:li:fsd_invitation:\d+$/`

**`linkedin_invitation_secret`** (required, string)
  The shared secret for the invitation.


Optional: `custom_data` (object) — Custom metadata to pass through.

## Output Schema (LinkedinAcceptInvitationOutput)
- `linkedin_invitation_id` (string)
- `linkedin_invitation_urn` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.acceptInvitation({
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

const { data } = await ed.linkedin.acceptInvitationAsync({
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
