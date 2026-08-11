---
name: edges-getting-started
description: >-
  Get started with the Edges LinkedIn & Sales Navigator API. This skill should be used when
  the user is new to Edges, wants to make their first API call, needs to understand how Edges
  works, asks about setup or configuration, or wants an overview of what's possible with the
  Edges API. Also use as a reference for API rules, identity modes, and common mistakes.
license: Apache-2.0
---

# Getting Started with Edges

Edges is the LinkedIn & Sales Navigator API. 70+ actions to extract data, search people and companies, automate outreach, and manage LinkedIn identities — all through one REST API.

Two modes: **Cookieless** (no LinkedIn account needed) and **Identity-connected** (for messaging, connecting, monitoring).

## Setup

1. Get an API key from https://app.edges.run -> Developer Settings
2. Set the environment variable:
```bash
export EDGES_API_KEY="your-api-key-here"
```
3. Install the TypeScript SDK (recommended):
```bash
npm install @edgesrun/sdk
```

## Using the SDK (Preferred)

The `@edgesrun/sdk` is the only way to call the Edges API from these skills. Do NOT write curl or ad-hoc HTTP clients.

```typescript
import { Edges } from '@edgesrun/sdk';
const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

// Extract a profile
const { data } = await ed.linkedin.extractPeople({
  identity_mode: 'managed',
  input: { linkedin_profile_url: 'https://www.linkedin.com/in/satya-nadella' },
  parameters: { experiences: true, skills: true, sections: true, highlights: true },
});

// Paginate search results via cursor
let cursor: string | undefined;
const all: unknown[] = [];
while (true) {
  const page = await ed.salesnavigator.searchPeople({
    identity_mode: 'managed',
    cursor,
    input: { sales_navigator_profile_search_url: '...' },
  });
  all.push(...(Array.isArray(page.data) ? page.data : []));
  if (!page.nextPage) break;
  cursor = new URL(page.nextPage).searchParams.get('cursor') ?? undefined;
  if (!cursor) break;
}

// Batch async (>15 items)
const result = await ed.linkedin.extractPeopleAsync({
  inputs: urls.map((u) => ({ linkedin_profile_url: u })),
});
```

## Critical Rules

These rules are essential for correct API usage. Follow them every time.

### `input` vs `inputs` — The #1 Mistake

| Mode | Endpoint | Body Field | Shape |
|---|---|---|---|
| **Live** (sync) | `/run/live` | `"input"` (SINGULAR) | Single object |
| **Async** (batch) | `/run/async` | `"inputs"` (PLURAL) | Array of objects |

Using `inputs` on `/run/live` returns 400. Use live for 1-15 items, async for 16+.

### Authentication
SDK sets `X-API-Key` from `apiKey`. Never `Authorization: Bearer`.

### Identity Mode
- Default: `"identity_mode": "managed"` — cookieless, no LinkedIn account needed, 1.5x credits
- Outreach/messaging: `"identity_ids": ["uuid"]` — requires connected LinkedIn account, 1x credits
- Load-balanced: `"identity_mode": "auto"` — distributes across all connected accounts

### Prefer Sales Navigator
For searching people, companies, or employees — always use Sales Navigator actions over standard LinkedIn. SN has richer data (tenure, recently hired/promoted), more filters, and works cookieless.

| Task | Use This | Not This |
|------|----------|----------|
| Search people | `salesnavigator-search-people` | `linkedin-search-people` |
| Search employees | `salesnavigator-search-company-employees` | `linkedin-search-company-employees` |
| Search companies | `salesnavigator-search-companies` | `linkedin-search-companies` |

### Never Guess LinkedIn URL Slugs
When you have a company name or domain but not a LinkedIn URL, ALWAYS resolve first:
1. `edges-linkedin-find-company-url` (from domain) or `edges-linkedin-search-companies` (from name)
2. `edges-linkedin-extract-company` to get `linkedin_company_id`
3. Then use the verified URL/ID in your search

URL slugs are unreliable (`apollo-io` vs `apolloio`). Guessing wastes API calls and returns wrong results.

### Always Show LinkedIn URLs
Every object displayed — person, company, post, job — MUST include a clickable LinkedIn URL. Never show a name without its URL.

### Enrich Before Filtering
When the user specifies a filter (industry, company size, role), enrich results to get the data needed for filtering, then filter. Never silently ignore a filter the user specified.

### Skill Routing — Common Mistakes

| User Says | Right Skill | Wrong Skill | Why |
|---|---|---|---|
| "posts mentioning [person]" | `search-content` | `extract-people-post-activity` | post-activity = posts BY the person |
| "posts by [person]" | `extract-people-post-activity` | `search-content` | post-activity = what they published |
| "who liked this post?" | `extract-post-likers` | `extract-people-reaction-activity` | reaction-activity = posts person reacted TO |
| "enrich this profile" | `extract-people` (all params) | `extract-contact` | extract-people = full profile data |
| "get their email" | `extract-contact` | `extract-people` | extract-contact returns visible email/phone |
| "visit this profile" | `visit-profile` | `extract-people` | visit = leave trace, extract = get data |
| "find employees at [company]" | `sn-search-company-employees` | `linkedin-search-company-employees` | SN has richer data |

### Pagination
Follow `response.nextPage` (SDK) / the `cursor` query param. Never append `&page=N`. Always paginate — never assume results fit on one page.

### Store Immutable IDs
Always store `linkedin_profile_id` and `sales_navigator_profile_id`. Profile URL slugs change. IDs don't.

## What You Can Do

| Category | Examples |
|---|---|
| **Extract** | Profiles, companies, posts, events, jobs, skills, experiences, contact info |
| **Search** | People, companies, jobs, content, events, groups, schools — LinkedIn and Sales Navigator |
| **Outreach** | Visit, connect, message, InMail, like, comment, follow |
| **Monitor** | Connections, messages, followers, profile viewers, conversations |
| **Contact** | Visible email/phone on a profile via extract-contact |

## Composite Skills (Workflow Intelligence)

| Need | Skill |
|---|---|
| Build search URLs (ConnectionOf, new hires, boolean) | `edges-url-construction` |
| Choose the right identity mode | `edges-identity-guide` |
| Design an outreach sequence | `edges-outreach-sequence` |
| Handle API errors correctly | `edges-error-handling` |

## Links

- Documentation: https://docs.edges.run
- TypeScript SDK: https://www.npmjs.com/package/@edgesrun/sdk
- API Reference: https://docs.edges.run/v1/api/introduction
- Error Reference: https://docs.edges.run/v1/error-reference
