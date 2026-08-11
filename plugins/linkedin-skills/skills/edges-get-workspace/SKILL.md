---
name: edges-get-workspace
description: >-
  Retrieve workspace metrics including identity counts, billing info, and plan details via the Edges API. Use this skill when the user asks about their Edges workspace, account info, or wants to see workspace-level statistics.
license: Apache-2.0
---

## Endpoint
- `GET /workspaces`

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
const { data } = await ed.core.getWorkspaces();
console.log(data);
```

## Error Codes
- **400**: Bad parameters
- **404**: Resource not found
- **500**: Internal server error
