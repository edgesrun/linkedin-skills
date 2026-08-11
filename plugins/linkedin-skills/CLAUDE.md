# LinkedIn Skills — Rules for AI Agents

## Setup
```bash
export EDGES_API_KEY=your_key    # Get from https://app.edges.run -> Developer Settings
npm install                       # Installs @edgesrun/sdk
```

## Rule 1: Skills Are the Source of Truth
Every Edges action has a skill with the correct endpoint, field name, and example.
Invoke the skill first to get the authoritative reference. Never guess field names.

## Rule 2: Use the Edges SDK — Never Write Throwaway Scripts
The `@edgesrun/sdk` TypeScript SDK is the **only** execution method. Use it for
everything. Do NOT write curl commands or Python `requests` scripts.

```typescript
import { Edges } from '@edgesrun/sdk';
const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

// Single extraction (live mode)
const { data } = await ed.linkedin.extractPeople({
  input: { linkedin_profile_url: "https://www.linkedin.com/in/someone" },
  parameters: { experiences: true, skills: true, sections: true, highlights: true }
});

// Batch extraction (async mode) — for >15 items
const result = await ed.linkedin.extractPeopleAsync({
  inputs: [{ linkedin_profile_url: "..." }, { linkedin_profile_url: "..." }]
});

// Pagination — follow response.nextPage (cursor query param)
let cursor: string | undefined;
const allResults: unknown[] = [];
while (true) {
  const page = await ed.salesnavigator.searchPeople({
    identity_mode: 'managed',
    cursor,
    input: { sales_navigator_profile_search_url: "..." },
  });
  allResults.push(...(Array.isArray(page.data) ? page.data : []));
  if (!page.nextPage) break;
  cursor = new URL(page.nextPage).searchParams.get('cursor') ?? undefined;
  if (!cursor) break;
}
```

**If the SDK is not installed**, run `npm install` in `plugins/linkedin-skills/` first.

**Priority: SDK only. Never write new HTTP clients or scripts from scratch.**

## Rule 3: Live vs Async Body Schema
- Live: `"input": { ... }` — SINGULAR, one object → `ed.<client>.<action>(...)`
- Async: `"inputs": [ ... ]` — PLURAL, array of objects → `ed.<client>.<action>Async(...)`
- Wrong one = 400 error. Threshold: <=15 items live, >15 async.

## Rule 4: Identity Mode Default
Default to `"identity_mode": "managed"` for extraction and search (cookieless).
Use `"identity_ids": ["uuid"]` for outreach, messaging, user-specific actions.
See `edges-identity-guide` skill for the full decision table.

## Rule 5: Authentication
SDK handles the `X-API-Key` header from `apiKey`. Never Bearer token.

## Rule 6: Store Immutable IDs
Always store `linkedin_profile_id` and `sales_navigator_profile_id`.
Profile handles (URL slugs) change. IDs don't.

## Rule 7: URL Construction
Invoke `edges-url-construction` for ConnectionOf, new hires, boolean search,
and all Sales Navigator URL patterns.

## Rule 8: Outreach Safety
Before outreach, invoke `edges-outreach-sequence` for timing, de-duplication,
and error handling patterns.

## Rule 9: Pagination
Use cursor-based pagination via `response.nextPage` → `cursor` query param.
Never append `&page=N`.

## Rule 10: Prefer Sales Navigator + Always Resolve URLs First
ALWAYS prefer Sales Navigator actions over standard LinkedIn equivalents.

| Task | Use This | Not This |
|------|----------|----------|
| Search people | `salesnavigator-search-people` | `linkedin-search-people` |
| Search employees at company | `salesnavigator-search-company-employees` | `linkedin-search-company-employees` |
| Search companies | `salesnavigator-search-companies` | `linkedin-search-companies` |

**NEVER guess LinkedIn URL slugs.** Always resolve first:
1. `find-company-url` or `search-companies` to get verified company URL
2. `extract-company` to get `linkedin_company_id`
3. Then use the verified URL/ID in your search

**Maximize coverage:** Use `search-metrics` first, make multiple query combinations
(title + keyword variations), always paginate.

## Rule 11: Skill Routing — Common Mistakes

| User Says | Right Skill | Wrong Skill | Why |
|-----------|-------------|-------------|-----|
| "posts mentioning [person]" | `search-content` | `extract-people-post-activity` | post-activity = posts BY, not mentioning |
| "posts by [person]" | `extract-people-post-activity` | `search-content` | post-activity = what they published |
| "who liked this post?" | `extract-post-likers` | `extract-people-reaction-activity` | reaction-activity = posts person reacted TO |
| "enrich this profile" | `extract-people` (all params) | `extract-contact` | extract-people = full profile data |
| "get their email" | `extract-contact` | `extract-people` | extract-contact returns visible email/phone |
| "visit this profile" | `visit-profile` | `extract-people` | visit = leave trace, extract = get data |
| "check for replies" | `extract-conversations` | `extract-messages` | conversations = list threads |
| "find employees at [company]" | `sn-search-company-employees` | `linkedin-search-company-employees` | SN has richer data |

## Rule 12: Async Workflow Pattern
For batch >15 items (async mode):

```typescript
const result = await ed.linkedin.extractPeopleAsync({
  inputs: [...],
  callback: { url: "...", on: "final" }
});
```

Or poll with `ed.core.getRunStatus` / `ed.core.getRunOutputs`.

## Rule 13: Always Show LinkedIn URLs
Every object displayed — person, company, post, job — MUST include a clickable
LinkedIn URL. Never show a name without its URL.

## Rule 14: Enrich Before Filtering
When the user specifies a filter (industry, size, stage, role), enrich results
to get the data needed for filtering, then filter. Never silently ignore a filter.

## Shared References
- `references/identity-modes.md`, `execution-modes.md`, `pagination.md`
- `references/error-handling.md`, `url-construction.md`, `linkedin-constraints.md`
