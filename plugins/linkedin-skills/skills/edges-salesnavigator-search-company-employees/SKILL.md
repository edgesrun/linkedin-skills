---
name: edges-salesnavigator-search-company-employees
description: >-
  Search employees of a company via Sales Navigator on the Edges API. This is
  the PREFERRED skill for finding people at a company — richer data than standard
  LinkedIn (tenure, recently hired/promoted flags), more filters (seniority,
  department, function), and works cookieless. Use when the user wants to find
  employees, search leads within a target account, prospect within a company, or
  find people by role at an organization. Before calling, resolve the company URL
  and extract the company profile to get the linkedin_company_id — do NOT guess
  URL slugs. Use salesnavigator-search-metrics first to check result counts
  before extracting. Always paginate.
license: Apache-2.0
---

# Search Sales Navigator Company Employees

Search employees (leads) within a specific company on Sales Navigator. Rich filtering by title, seniority, department (function), geography, industry, and keywords. **Cookieless** — no SN account needed.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Search employees at a specific company on SN with advanced filters | — |
| Find leads within a target account by title/seniority/department | — |
| Standard LinkedIn employee search (simpler, fewer filters) | `edges-linkedin-search-company-employees` |
| Search leads across all companies on SN (not company-specific) | `edges-salesnavigator-search-people` |
| Get employee headcount breakdown (no individual profiles) | `edges-salesnavigator-extract-employees-distribution` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/salesnavigator-search-company-employees/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/salesnavigator-search-company-employees/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Managed** (cookieless) — no SN account needed. Use `"identity_mode": "managed"`.

Default: `"identity_mode": "managed"` (cookieless). For outreach/messaging: `"identity_ids": ["uuid"]`.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `sales_navigator_company_url` | URI | Yes* | SN company URL (e.g., `https://www.linkedin.com/sales/company/12345`) |
| `linkedin_company_id` | string | Yes* | LinkedIn company numeric ID (alternative to URL) |
| `sales_navigator_profile_search_url` | URI | No | Pre-built SN search URL override |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

*One of `sales_navigator_company_url` or `linkedin_company_id` is required.

**Regex (company URL):** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/sales\/company\/\d+/`

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `employees_title` | string | `""` | Filter by job title |
| `keywords` | string | `""` | Filter by keywords |
| `seniority` | array | `[]` | Filter by seniority level |
| `function` | string | `""` | Filter by department using SN function numbers (e.g., `25`=Sales, `4`=Business Development). Comma-separated, no spaces. |
| `geo` | string | `""` | Filter by location (e.g., "United States") |
| `industry` | string | `""` | Filter by industry |
| `relationship` | string | — | Filter by network: `F` (1st), `S` (2nd), `O` (3rd+), `A`, `ET`, `T` |
| `bing_postal_code` | string | `""` | Filter by postal code |
| `function_excluded` | array | `[]` | Exclude specific departments |
| `geography_excluded` | array | `[]` | Exclude locations |
| `current_job_title_excluded` | array | `[]` | Exclude titles |
| `industry_excluded` | array | `""` | Exclude industries |
| `seniority_level_excluded` | array | `[]` | Exclude seniority levels |
| `exclude_saved_leads` | boolean | `false` | Remove saved leads from results |
| `exclude_viewed_leads` | boolean | `false` | Remove viewed leads from results |
| `exclude_contacted_leads` | boolean | `false` | Remove contacted leads from results |
| `search_within_my_accounts` | boolean | `false` | Search within saved accounts only |

## Key Notes

- **Input is a SN company URL or company ID.** Unlike `salesnavigator-search-people` which takes a search URL, this takes a direct company reference.
- **Page size is 25** (fixed). Use cursor-based pagination via `X-Pagination-Next` header.
- **Cookieless.** Works with managed mode — no SN subscription needed.
- **Rich filtering.** More filter options than `linkedin-search-company-employees` (seniority, function numbers, exclusion filters).

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.salesnavigator.searchCompanyEmployees({
  identity_mode: "managed",
  parameters: {
    employees_title: "VP Sales",
    seniority: ["VP"]
  },
  input: {
    sales_navigator_company_url: "https://www.linkedin.com/sales/company/1035"
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
| `company_name` | string | Company name |
| `sales_navigator_profile_id` | string | Immutable SN profile ID |
| `sales_navigator_profile_url` | string | SN profile URL |
| `linkedin_profile_id` | integer | Immutable LinkedIn profile ID |
| `linkedin_profile_url` | string | LinkedIn profile URL |
| `location` | string | Location |
| `connection_degree` | integer | Degree of connection |
| `recently_hired` | boolean | Changed jobs recently |
| `recently_promoted` | boolean | Promoted recently |
| `tenure_start` | string | Start date at current role |

Full schema: `references/response-schema.md`

## Batch Usage (paginated results)
Use the Edges SDK — do NOT write a throwaway script:
```typescript
import { Edges } from '@edgesrun/sdk';
const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
let page = await ed.salesnavigator.searchCompanyEmployees({ input: { sales_navigator_company_url: url } });
let all = [...page.data];
while (page.nextPage) { page = await page.nextPage(); all.push(...page.data); }
```


## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-search-company-employees` | Standard LinkedIn employee search (fewer filters) |
| `edges-salesnavigator-search-people` | Search leads across all companies on SN |
| `edges-salesnavigator-extract-employees-distribution` | Headcount breakdown by department/seniority/location |
| `edges-salesnavigator-extract-employees-count` | Quick employee count |
| `edges-linkedin-extract-people` | Enrich a found employee with full profile data |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid SN company URL or company ID |
| 402 | No access | Billing/plan issue |
| 424 | No results | No employees found matching filters |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
