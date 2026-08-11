---
name: edges-linkedin-withdraw-invitations
description: >-
  Withdraw multiple pending LinkedIn connection invitations in batch via the Edges API. Use this skill when the user wants to cancel several connection requests at once. Requires a connected identity (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-withdraw-invitations/run/live` — synchronous (single input)
- `POST /actions/linkedin-withdraw-invitations/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-withdraw-invitations/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**No URL input field** — This action requires `identity_ids` with a specific identity UUID.
**IMPORTANT:** You MUST use `identity_ids` with exactly one identity UUID.

## Parameters
- `max_results` (integer) default: `100` — The maximum number of invitations to withdraw.
- `last_page_start` (boolean) default: `false` — In order to start withdrawing the oldest connection requests first, you should tick this box.
- `max_pages` (integer) default: `1` — The number of pages to withdraw.

## Example (SDK — async; no live method in @edgesrun/sdk)

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.withdrawInvitationsAsync({
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
