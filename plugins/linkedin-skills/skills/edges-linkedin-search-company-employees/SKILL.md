---
name: edges-linkedin-search-company-employees
description: >-
  Search employees of a specific company on standard LinkedIn via the Edges API. IMPORTANT: Prefer edges-salesnavigator-search-company-employees instead — it has richer data (tenure, recently hired/promoted), more filters, and works cookieless. Only use this standard LinkedIn version if the user explicitly asks for it. Before calling, resolve the company URL — do NOT guess URL slugs.
license: Apache-2.0
---

# Search LinkedIn Company Employees

Search employees of a specific company on standard LinkedIn. Input is a company URL — not a search URL. Supports filtering by title, location, network degree, industry, keywords, past company, school, and profile language.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Find employees at a specific company by title/role/location | — |
| List people working at a company with optional filters | — |
| Need SN employee search with more filter options (seniority, years, ConnectionOf) | `edges-salesnavigator-search-company-employees` |
| Need employee headcount by department/seniority/location (no individual profiles) | `edges-linkedin-extract-company-employees-insights` |
| Search people across all companies (not company-specific) | `edges-linkedin-search-people` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-search-company-employees/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-search-company-employees/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Managed** (cookieless) — no LinkedIn account needed. Use `"identity_mode": "managed"`.

Default: `"identity_mode": "managed"` (cookieless). For outreach/messaging: `"identity_ids": ["uuid"]`.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `linkedin_company_url` | URI | Yes | LinkedIn company URL (accepts `/company/`, `/school/`, `/showcase/`, `/sales/company/` formats) |
| `linkedin_company_id` | integer | No | Numeric LinkedIn company ID (alternative to URL) |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

**Regex:** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:sales\/)?(?:school|pub|company|showcase)\/[\w%-]+(?:\/(?:\w+)?)?/i`

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `title` | string | `""` | Filter by job title |
| `keywords` | string | `""` | Filter by keywords |
| `network` | string | `null` | Filter by network degree: `F` (1st), `S` (2nd), `O` (3rd+) |
| `geo_urn` | string | `""` | Filter by geography URN. E.g., Paris = `101240143`, France = `105015875`. Comma-separate multiple locations. |
| `industry` | string | `""` | Filter by industry |
| `past_company` | string | `""` | Filter by name of past company |
| `school_filter` | string | `""` | Filter by school name (e.g., "Harvard") |
| `contact_interest` | string | `null` | Filter by interest: `proBono`, `boardmember` |
| `profile_language` | string | `""` | Filter by profile language |

## Key Notes

- **Input is a company URL, not a search URL.** Unlike `linkedin-search-people` which takes a search URL, this skill takes a direct company page URL.
- **Page size is 10** (fixed). Use cursor-based pagination via `X-Pagination-Next` header.
- **Cookieless.** Works with managed mode — no LinkedIn account needed.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchCompanyEmployees({
  identity_mode: "managed",
  parameters: {
    title: "Engineering Manager"
  },
  input: {
    linkedin_company_url: "https://www.linkedin.com/company/microsoft"
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
| `company_name` | string | Company name |
| `location` | string | Location |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | integer | Immutable profile ID |
| `sales_navigator_profile_id` | string | Immutable SN profile ID |
| `connection_degree` | string | Degree of connection |
| `linkedin_company_id` | string | Company ID |

Full schema: `references/response-schema.md`

## Batch Usage (paginated results)
Use the Edges SDK — do NOT write a throwaway script:
```typescript
import { Edges } from '@edgesrun/sdk';
const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
let page = await ed.linkedin.searchCompanyEmployees({ input: { linkedin_company_url: url } });
let all = [...page.data];
while (page.nextPage) { page = await page.nextPage(); all.push(...page.data); }
```


## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-salesnavigator-search-company-employees` | SN employee search with more filters |
| `edges-linkedin-extract-company-employees-insights` | Headcount breakdown (no individual profiles) |
| `edges-linkedin-extract-people` | Enrich a found employee with full profile data |
| `edges-linkedin-search-people` | Search people across all companies |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid company URL format |
| 402 | No access | Billing/plan issue |
| 424 | No results | No employees found matching filters |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
