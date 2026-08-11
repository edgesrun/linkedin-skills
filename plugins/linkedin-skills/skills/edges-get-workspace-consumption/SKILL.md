---
name: edges-get-workspace-consumption
description: >-
  Get current workspace credit usage and plan details via the Edges API. Use this skill when the user asks about credits, billing, how many credits are left, workspace plan, or consumption stats.
license: Apache-2.0
---

## Endpoint
- `GET /workspaces/consumption`

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Response Schema
- `credits_left` (number)
- `credits_used` (number)
- `credits_max` (number)
- `current_month_start` (string (date-time))
- `current_month_end` (string (date-time))
- `consumptions` (array)

## Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
const { data } = await ed.core.getWorkspaceConsumption();
console.log(data);
```

## Error Codes
- **400**: Bad parameters
- **404**: Resource not found
- **500**: Internal server error
