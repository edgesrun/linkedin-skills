---
name: edges-linkedin-search-people
description: >-
  Search for people on LinkedIn via the Edges API. Use this skill when the user
  wants to search LinkedIn for people by name, keyword, title, company, or
  location, find someone on LinkedIn, do identity resolution (resolve a name
  to a LinkedIn profile), or look up professionals matching specific criteria.
  For higher-precision searches with more filters, use
  salesnavigator-search-people instead. For AI-powered name-to-URL lookup,
  use find-profile-url.
license: Apache-2.0
---

# Search LinkedIn People

Search people on standard LinkedIn by keywords, title, company, location, and other criteria. Input is a LinkedIn people search URL. Critical for identity resolution workflows.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Search people on standard LinkedIn by keyword/name/company | — |
| Identity resolution: resolve a name to a LinkedIn profile | — |
| Get search results with basic profile data | — |
| Need more filters (seniority, years of experience, ConnectionOf) | `edges-salesnavigator-search-people` (SN, more precise) |
| Have a name and want a quick URL lookup (no search URL needed) | `edges-linkedin-find-profile-url` (AI-powered, simpler input) |
| Already have a profile URL and want full data | `edges-linkedin-extract-people` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-search-people/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-search-people/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Managed** (cookieless) — no LinkedIn account needed. Use `"identity_mode": "managed"`.

Default: `"identity_mode": "managed"` (cookieless). For outreach/messaging: `"identity_ids": ["uuid"]`.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `linkedin_people_search_url` | URI | Yes | LinkedIn people search URL starting with `https://www.linkedin.com/search/results/people/` |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

**Regex:** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/search\/results\/(people|PEOPLE)\/\?\S+/`

**URL construction examples:**
- By name + company: `https://www.linkedin.com/search/results/people/?keywords=%22John%20Smith%22%20AND%20%22Acme%20Corp%22&origin=SWITCH_SEARCH_VERTICAL`
- By keyword: `https://www.linkedin.com/search/results/people/?keywords=CEO%20fintech`

See the `edges-url-construction` skill for URL construction patterns.

## Parameters

| Parameter | Default | Description |
|---|---|---|
| `only_extract_unique_profile` | `false` | **Critical for identity resolution.** When search returns exactly 1 result, extracts the full profile data inline (equivalent to running extract-people). Set to `true` when resolving a specific person. |

## Key Notes

- **Identity resolution pattern.** Build a search URL with `"Full Name" AND "Company"`, set `only_extract_unique_profile: true`. If 1 result → match found with full profile. If multiple → score candidates against known signals.
- **Keyword narrowing trick.** Searching "John Smith" returns 500+ results. Adding a context keyword like `"John Smith" AND "developer"` reduces to <5. Use role, industry, or company as the narrowing term.
- **Multi-pass strategy.** Try company name first → intent keyword second → bare name last.
- **Page size is 10** (fixed). Use cursor-based pagination via `X-Pagination-Next` header.
- **Smart Limits:** 2,000 people searches per identity per 24 hours.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchPeople({
  identity_mode: "managed",
  parameters: {
    only_extract_unique_profile: true
  },
  input: {
    linkedin_people_search_url: "https://www.linkedin.com/search/results/people/?keywords=%22Satya%20Nadella%22%20AND%20%22Microsoft%22&origin=SWITCH_SEARCH_VERTICAL"
  }
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Full name |
| `first_name` | string | First name |
| `last_name` | string | Last name |
| `headline` | string | Profile headline |
| `job_title` | string | Current job title |
| `company_name` | string | Current company |
| `location` | string | Location |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | integer | Immutable profile ID |
| `sales_navigator_profile_id` | string | Immutable SN profile ID |
| `connection_degree` | string | Degree of connection |
| `number_shared_connections` | integer | Shared connections count |
| `profile_image_url` | string | Profile photo URL |

Full schema: `references/response-schema.md`

## Batch Usage (paginated results)
Use the Edges SDK — do NOT write a throwaway script:
```typescript
import { Edges } from '@edgesrun/sdk';
const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
let page = await ed.linkedin.searchPeople({ input: { linkedin_people_search_url: url } });
let all = [...page.data];
while (page.nextPage) { page = await page.nextPage(); all.push(...page.data); }
```


## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-salesnavigator-search-people` | More filters (seniority, ConnectionOf, years of experience) |
| `edges-linkedin-find-profile-url` | AI-powered name-to-URL lookup (simpler input, less control) |
| `edges-linkedin-extract-people` | Enrich a found profile with full data |
| `edges-linkedin-extract-contact` | Get visible email/phone after finding the profile |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid search URL format |
| 402 | No access | Billing/plan issue |
| 424 | No results | Search returned empty (not an error — valid outcome) |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
