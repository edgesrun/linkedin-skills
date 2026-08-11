---
name: edges-salesnavigator-search-companies
description: >-
  Search companies on Sales Navigator via the Edges API. Use this skill when
  the user wants to search accounts on Sales Navigator, find companies by
  industry, size, revenue, or location on SN, prospect target accounts, or
  build an account list on Sales Navigator. Cookieless — no SN account
  needed. For standard LinkedIn company search, use linkedin-search-companies.
license: Apache-2.0
---

# Search Sales Navigator Companies

Search accounts (companies) on Sales Navigator with advanced filters. **Cookieless** — no Sales Navigator account needed.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Search companies on Sales Navigator by industry/size/location | — |
| Build a target account list from SN | — |
| Standard LinkedIn company search (simpler) | `edges-linkedin-search-companies` |
| Search employees of a specific company on SN | `edges-salesnavigator-search-company-employees` |
| Already have a company URL and want full data | `edges-linkedin-extract-company` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/salesnavigator-search-companies/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/salesnavigator-search-companies/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Managed** (cookieless) — no SN account needed. Use `"identity_mode": "managed"`.

Default: `"identity_mode": "managed"` (cookieless). For outreach/messaging: `"identity_ids": ["uuid"]`.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `sales_navigator_company_search_url` | URI | Yes | SN company search URL starting with `https://www.linkedin.com/sales/search/company` |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

**Regex:** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/search\/company.+/`

## Parameters

No additional parameters.

## Key Notes

- **Page size is 25** (fixed). Use cursor-based pagination via `X-Pagination-Next` header.
- **Cookieless.** Works with managed mode — no SN subscription needed.
- **Returns `sales_navigator_company_id` and `sales_navigator_employees_url`.** Use these for downstream actions like employee search.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.searchCompanies({
  identity_mode: "managed",
  input: {
    sales_navigator_company_search_url: "https://www.linkedin.com/sales/search/company?query=(filters%3AList((type%3ACOMPANY_HEADCOUNT%2Cvalues%3AList((id%3AD%2CselectionType%3AINCLUDED)))))&viewAllFilters=true"
  }
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `company_name` | string | Company name |
| `sales_navigator_company_id` | string | SN company ID |
| `sales_navigator_company_url` | URI | SN company page URL |
| `sales_navigator_employees_url` | URI | URL to search this company's employees on SN |
| `description` | string | Company description |
| `category` | string | Industry/category |
| `number_employees` | string | Employee count |
| `sales_navigator_search_url` | URI | Normalized search URL that produced these results |

## Batch Usage (paginated results)
Use the Edges SDK — do NOT write a throwaway script:
```typescript
import { Edges } from '@edgesrun/sdk';
const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
let page = await ed.salesnavigator.searchCompanies({ input: { sales_navigator_company_search_url: url } });
let all = [...page.data];
while (page.nextPage) { page = await page.nextPage(); all.push(...page.data); }
```


## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-search-companies` | Standard LinkedIn company search (simpler) |
| `edges-salesnavigator-search-company-employees` | Search employees at a found company |
| `edges-linkedin-extract-company` | Enrich a found company with full profile data |
| `edges-salesnavigator-extract-employees-distribution` | Department/seniority/location breakdown |
| `edges-salesnavigator-search-people` | Search leads across companies |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid SN search URL format |
| 402 | No access | Billing/plan issue |
| 424 | No results | Search returned empty |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
