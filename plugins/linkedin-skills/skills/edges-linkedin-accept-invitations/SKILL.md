---
name: edges-linkedin-accept-invitations
description: >-
  Accept multiple LinkedIn connection invitations in batch via the Edges API. Use this skill when the user wants to accept several pending connection requests at once. Requires a connected identity (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-accept-invitations/run/live` — synchronous (single input)
- `POST /actions/linkedin-accept-invitations/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-accept-invitations/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**No URL input field** — This action requires `identity_ids` with a specific identity UUID.
**IMPORTANT:** You MUST use `identity_ids` with exactly one identity UUID.

## Example (SDK — async; no live method in @edgesrun/sdk)

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.acceptInvitationsAsync({
  identity_ids: ["your-identity-uuid"],
  inputs: [{}]
});
console.log(data);
```

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
