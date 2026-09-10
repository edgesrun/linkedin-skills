---
name: edges-salesnavigator-search-people
description: >-
  Search people on Sales Navigator via the Edges API. Use this skill when the
  user wants to search leads on Sales Navigator, do a ConnectionOf search,
  find people by seniority, title, company, or geography on SN, prospect on
  Sales Navigator, search someone's network, find new hires at a company, or
  run boolean lead searches. This is cookieless — no SN account needed.
  Unique capability: no other LinkedIn API offers cookieless Sales Navigator
  access. For standard LinkedIn search, use linkedin-search-people.
license: Apache-2.0
---

# Search Sales Navigator People

Search leads on Sales Navigator with advanced filters: ConnectionOf, title, company, seniority, geography, recently changed jobs, and boolean keywords. **Cookieless** — no Sales Navigator account needed (unique capability, no competitor offers this).

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Search leads on Sales Navigator with advanced filters | — |
| ConnectionOf search (explore someone's network) | — |
| Find new hires at a company (RECENTLY_CHANGED_JOBS filter) | — |
| Boolean title + keyword prospecting | — |
| Standard LinkedIn search (simpler, fewer filters) | `edges-linkedin-search-people` |
| Search employees of a specific company on SN | `edges-salesnavigator-search-company-employees` |
| Just need the result count for a search (no profiles) | `edges-salesnavigator-search-metrics` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/salesnavigator-search-people/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/salesnavigator-search-people/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Managed** (cookieless) — no LinkedIn or SN account needed. Use `"identity_mode": "managed"`.

This is a **unique capability** — no other LinkedIn API provider offers cookieless Sales Navigator search.

Default: `"identity_mode": "managed"` (cookieless). For outreach/messaging: `"identity_ids": ["uuid"]`.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `sales_navigator_profile_search_url` | URI | Yes | Sales Navigator people search URL starting with `https://www.linkedin.com/sales/search/people` |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

**Regex:** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/search\/people.+/`

**URL construction is critical for this skill.** See `the `edges-url-construction` skill` for full patterns including:
- ConnectionOf search
- New hires at a company (CURRENT_COMPANY + RECENTLY_CHANGED_JOBS)
- Boolean title + keyword search
- Company filters (CURRENT_COMPANY, PAST_COMPANY)

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `exclude_crm_contacts` | boolean | `false` | Exclude CRM contacts from results |
| `exclude_viewed_leads` | boolean | `false` | Remove viewed leads (only works with a Visit step in workflow) |

## Key Notes

- **Cookieless SN search.** No competitor offers this. Works with managed mode — no SN subscription needed on your side.
- **Page size is 25** (fixed). Use cursor-based pagination via `X-Pagination-Next` header. Always deduplicate results by `sales_navigator_profile_id` — search results naturally overlap across page boundaries.
- **Empty result `[]` is valid** — it means the search matched no one. Check for `None` separately (indicates a parse error).
- **Cursor expiry.** `X-Pagination-Next` cursors expire after 24 hours. For large result sets (1,000+), use async mode to avoid cursor expiry.
- **URL encoding.** SN URLs use double-URL-encoding: `%2522` = `"`, `%2520` = space. Edges normalizes returned URLs to `%20` — both work as input.
- **Smart Limits:** this action consumes `Sales Navigator people search`, per identity, on a 24-hour rolling window. There is no single ceiling to assume: a new identity is still ramping up and a workspace can carry custom limits, so read the effective value from `GET /v1/identities/{identity_uid}/actions/{action_slug}/limits` before sizing a batch. Full capacity per account level is in the [limits reference](https://docs.edges.run/v1/linkedin/limits).
- **Automated pagination script:** See `scripts/paginate.ts` for a ready-to-use TypeScript script that handles cursor-based pagination, deduplication, and result collection.
- **Deduplicate the results.** Search results can repeat the same person across pages. After collecting every page, deduplicate on `linkedin_profile_id` or `sales_navigator_profile_id` — never on the profile handle, which the person can change.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.searchPeople({
  identity_mode: "managed",
  input: {
    sales_navigator_profile_search_url: "https://www.linkedin.com/sales/search/people?query=(recentSearchParam%3A(doLogHistory%3Atrue)%2CspellCorrectionEnabled%3Atrue%2Ckeywords%3A%2522CEO%2522%2520AND%2520%2522fintech%2522)&viewAllFilters=true"
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
| `job_title` | string | Current title |
| `company_name` | string | Current company |
| `sales_navigator_profile_id` | string | **Immutable** SN profile ID — deduplicate by this |
| `sales_navigator_profile_url` | string | SN profile URL |
| `linkedin_profile_id` | integer | Immutable LinkedIn profile ID |
| `linkedin_profile_url` | string | LinkedIn profile URL |
| `location` | string | Location |
| `connection_degree` | integer | Degree of connection |
| `recently_hired` | boolean | Changed jobs recently |
| `recently_promoted` | boolean | Promoted recently |
| `tenure_start` | string | Start date at current role |
| `tenure_length` | string | Time in current role |

Full schema: `references/response-schema.md`

## Batch Usage (paginated results)
Use the Edges SDK — do NOT write a throwaway script:
```typescript
import { Edges } from '@edgesrun/sdk';
const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
let page = await ed.salesnavigator.searchPeople({ input: { sales_navigator_profile_search_url: url } });
let all = [...page.data];
while (page.nextPage) { page = await page.nextPage(); all.push(...page.data); }
```


## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-search-people` | Standard LinkedIn search (fewer filters, simpler URLs) |
| `edges-salesnavigator-search-company-employees` | Search employees of a specific company on SN |
| `edges-salesnavigator-search-metrics` | Get result count without fetching profiles |
| `edges-linkedin-extract-people` | Enrich a found lead with full profile data |
| `edges-salesnavigator-search-companies` | Search companies on SN |
| `edges-url-construction` | Build SN search URLs (ConnectionOf, new hires, boolean filters) |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid SN search URL format |
| 402 | No access | Billing/plan issue |
| 424 | No results | Search returned empty (valid outcome) |
| 424 | `SN_ACCOUNT_UPGRADE` | Identity doesn't have SN (only applies in direct/auto mode — managed handles this) |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
