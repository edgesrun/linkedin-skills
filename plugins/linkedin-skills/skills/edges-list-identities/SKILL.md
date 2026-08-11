---
name: edges-list-identities
description: >-
  List all identities in the Edges workspace via the Edges API. Use this skill when the user wants to see their LinkedIn accounts, list available identities, check which accounts are connected, or find an identity UUID for outreach actions. Always include retrieve_accounts=true to show connection status.
license: Apache-2.0
---

## Endpoint
- `GET /identities`

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Query Parameters
- `retrieve_accounts` (string) — **Always set to `true`**. Without this, the response omits integration/account data and you cannot tell if LinkedIn is connected. Increases response time slightly but is essential for useful output.
- `query` (string, optional) — Search identities by name.
- `page` (integer, optional) — Page number (1-based).

## Key Notes
- **Always use `retrieve_accounts=true`** — without it, every identity looks disconnected even if LinkedIn accounts are connected. This is the #1 mistake with this endpoint.
- Each identity can have integrations (LinkedIn accounts) connected to it. The `retrieve_accounts` parameter reveals these.
- Identity UUIDs are needed for direct mode actions (outreach, messaging, ConnectionOf searches).

## Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
const { data } = await ed.core.getIdentities({ retrieve_accounts: true });
console.log(data);
```

## Response (key fields per identity)
| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Identity UUID — use this for `identity_ids` in API calls |
| `name` | string | Display name |
| `accounts` | array | Connected integrations (only present with `retrieve_accounts=true`) |
| `accounts[].type` | string | Integration type (e.g., "linkedin") |
| `accounts[].status` | string | Connection status |

## Errors
- **400**: Bad parameters
- **404**: Resource not found
