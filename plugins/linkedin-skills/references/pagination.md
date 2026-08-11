# Pagination

## Live Mode — Cursor-Based Pagination

Live mode uses cursor-based pagination. The SDK exposes the next page via `response.nextPage` (the `X-Pagination-Next` header value). Pass the `cursor` query param from that URL on the next call.

### How It Works

1. **First request:** call the live SDK method with the normal body (no cursor)
2. **Read `nextPage`:** if present, it is a full URL containing a `cursor` query param
3. **Next page:** call the same method with `cursor` set (same body otherwise)
4. **Last page:** when `nextPage` is `null`, all results have been fetched

### Rules

- **NEVER** append `&page=N` to URLs — this causes result cycling and duplicate data
- **NEVER** construct cursor values manually — always use the value from `nextPage`
- Cursors expire after **24 hours** — restart from page 1 if expired
- Add a **2-second delay** between page requests (recommended)
- Always **deduplicate** results by `sales_navigator_profile_id` or `linkedin_profile_id` — search results naturally overlap at page boundaries

### TypeScript Example

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const input = {
  sales_navigator_profile_search_url:
    'https://www.linkedin.com/sales/search/people?query=...',
};

const allResults: unknown[] = [];
let cursor: string | undefined;

while (true) {
  const page = await ed.salesnavigator.searchPeople({
    identity_mode: 'managed',
    cursor,
    input,
  });

  const batch = Array.isArray(page.data) ? page.data : [];
  allResults.push(...batch);

  if (!page.nextPage) break;

  cursor = new URL(page.nextPage).searchParams.get('cursor') ?? undefined;
  if (!cursor) break;

  await new Promise((r) => setTimeout(r, 2000));
}

// Deduplicate by profile ID
const seen = new Set<string>();
const unique = allResults.filter((r: any) => {
  const pid = r?.sales_navigator_profile_id;
  if (!pid || seen.has(pid)) return false;
  seen.add(pid);
  return true;
});

console.log(`Raw: ${allResults.length}, Unique: ${unique.length}`);
```

## Async/Schedule Mode — Automatic Pagination

In async and schedule mode, Edges handles pagination internally. Set `parameters.max_results` to control the total number of results returned. No manual cursor handling needed.

```typescript
const result = await ed.salesnavigator.searchPeopleAsync({
  identity_mode: 'managed',
  inputs: [{ sales_navigator_profile_search_url: '...' }],
  parameters: { max_results: 500 },
  callback: { url: 'https://your-app.com/webhook', on: 'final' },
});
```

## When to Use Each

| Scenario | Approach |
|---|---|
| Small result set (< 100) | Live mode + manual pagination |
| Large result set (1,000+) | Async mode with `max_results` — no cursor expiry concern |
| Recurring search | Schedule mode — automatic pagination per run |
