---
name: edges-linkedin-search-companies
description: >-
  Search for companies on LinkedIn via the Edges API. Use this skill when the
  user wants to search LinkedIn for companies by keyword, industry, size, or
  location, find companies matching specific criteria, or discover companies
  in a particular sector. For SN company search with more filters, use
  salesnavigator-search-companies. For resolving a company name or domain to
  a LinkedIn URL, use find-company-url.
license: Apache-2.0
---

# Search LinkedIn Companies

Search companies on standard LinkedIn by keyword, industry, size, and location. Input is a LinkedIn company search URL. Returns basic company data including `linkedin_company_id`.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Search companies on standard LinkedIn by keyword/industry/size | — |
| Find companies matching specific criteria | — |
| Need SN company search with more filters | `edges-salesnavigator-search-companies` |
| Have a company name/domain and want the LinkedIn URL | `edges-linkedin-find-company-url` (AI-powered, simpler) |
| Already have a company URL and want full data | `edges-linkedin-extract-company` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-search-companies/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-search-companies/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Managed** (cookieless) — no LinkedIn account needed. Use `"identity_mode": "managed"`.

Default: `"identity_mode": "managed"` (cookieless). For outreach/messaging: `"identity_ids": ["uuid"]`.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `linkedin_company_search_url` | URI | Yes | LinkedIn company search URL starting with `https://www.linkedin.com/search/results/companies/` |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

**Regex:** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/search\/results\/companies\/\?\S+/`

**URL construction example:**
- By keyword: `https://www.linkedin.com/search/results/companies/?keywords=fintech%20payments`

## Parameters

No additional parameters.

## Key Notes

- **Page size is 10** (fixed). Use cursor-based pagination via `X-Pagination-Next` header.
- **Returns `linkedin_company_id`.** Use this to enrich with `edges-linkedin-extract-company` or to construct URLs for downstream actions (content feeds, job searches, new hire monitoring).
- **Cookieless.** Works with managed mode — no LinkedIn account needed.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchCompanies({
  identity_mode: "managed",
  input: {
    linkedin_company_search_url: "https://www.linkedin.com/search/results/companies/?keywords=fintech%20payments"
  }
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `company_name` | string | Company name |
| `linkedin_company_id` | string | Immutable company ID |
| `linkedin_company_url` | URI | Company LinkedIn page URL |
| `linkedin_company_handle` | string | Company URL slug |
| `description` | string | Full description |
| `short_description` | string | Truncated description |
| `followers` | string | Follower count |

## Batch Usage (paginated results)
Use the Edges SDK — do NOT write a throwaway script:
```typescript
import { Edges } from '@edgesrun/sdk';
const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
let page = await ed.linkedin.searchCompanies({ input: { linkedin_company_search_url: url } });
let all = [...page.data];
while (page.nextPage) { page = await page.nextPage(); all.push(...page.data); }
```


## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-salesnavigator-search-companies` | SN search with more filter options |
| `edges-linkedin-find-company-url` | AI-powered company name/domain to URL lookup |
| `edges-linkedin-extract-company` | Enrich a found company with full data |
| `edges-linkedin-search-company-employees` | Search employees of a specific company |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid search URL format |
| 402 | No access | Billing/plan issue |
| 424 | No results | Search returned empty |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
