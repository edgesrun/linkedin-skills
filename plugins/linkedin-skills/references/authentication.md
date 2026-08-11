# Authentication

All Edges API requests authenticate via API key. Prefer the TypeScript SDK — it sets the `X-API-Key` header for you. Never use `Authorization: Bearer`.

## Setup

1. Go to https://app.edges.run -> Developer Settings
2. Copy your API key
3. Set the environment variable:

```bash
export EDGES_API_KEY="your-api-key-here"
```

## Request Pattern (SDK)

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPeople({
  identity_mode: 'managed',
  input: { linkedin_profile_url: 'https://www.linkedin.com/in/satya-nadella' },
});
```

Install: `npm install @edgesrun/sdk` (pinned in this plugin’s `package.json`).

## Verify Your Key

Extract a known profile to confirm authentication works:

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data, ok, status } = await ed.linkedin.extractPeople({
  identity_mode: 'managed',
  input: { linkedin_profile_url: 'https://www.linkedin.com/in/satya-nadella' },
});

if (!ok) {
  throw new Error(`Auth/API failed with status ${status}`);
}
console.log(data);
```

A successful response returns HTTP 200 with profile JSON. A 401 means the key is invalid.
