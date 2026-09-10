---
name: edges-linkedin-extract-company
description: >-
  Extract LinkedIn company profile data via the Edges API. Use this skill when
  the user wants to get company information, enrich a company, extract company
  data from a LinkedIn URL, look up a company on LinkedIn, get company size,
  industry, website, description, funding, or employee count. Returns the
  linkedin_company_id needed for URL construction (content feeds, job searches,
  new hire monitoring, CURRENT_COMPANY/PAST_COMPANY filters). Cookieless
  (managed mode).
license: Apache-2.0
---

# Extract LinkedIn Company

Extract a full company profile including name, industry, size, website, description, headquarters, funding, and specialties. Returns the `linkedin_company_id` — a critical identifier needed for Sales Navigator URL construction.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Get company profile data from a LinkedIn company URL | — |
| Get `linkedin_company_id` for URL construction (content, jobs, new hires, CURRENT_COMPANY/PAST_COMPANY filters) | — |
| Enrich a company with industry, size, funding data | — |
| Get employee headcount by function/seniority/location | `edges-linkedin-extract-company-employees-insights` |
| Get subsidiaries and parent companies | `edges-linkedin-extract-company-affiliates` |
| Get competitor/similar companies | `edges-linkedin-extract-similar-companies` |
| Resolve a company name or domain to a LinkedIn URL first | `edges-linkedin-find-company-url` |
| Search for companies by keyword | `edges-linkedin-search-companies` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-extract-company/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-extract-company/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Managed** (cookieless) — no LinkedIn account needed. Use `"identity_mode": "managed"`.

Default: `"identity_mode": "managed"` (cookieless). For outreach/messaging: `"identity_ids": ["uuid"]`.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `linkedin_company_url` | URI | Yes | LinkedIn company URL. Accepts `/company/`, `/school/`, `/showcase/`, and `/sales/company/` formats. |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

**Regex:** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:sales\/)?(?:school|pub|company|showcase)\/[\w%-]+(?:\/(?:\w+)?)?/i`

## Parameters

No additional parameters. Company data is always fully extracted.

## Key Notes

- **Always store `linkedin_company_id`.** This numeric ID is immutable and needed for constructing Sales Navigator URLs: CURRENT_COMPANY filter, PAST_COMPANY filter, new hires monitoring, content feeds, and job searches. Company URL slugs can change.
- **Funding data included.** Returns Crunchbase URL, last funding round details (date, type, amount, investors) when available.
- **Smart Limits:** this action consumes `Company enrichments`, per identity, on a 24-hour rolling window. There is no single ceiling to assume: a new identity is still ramping up and a workspace can carry custom limits, so read the effective value from `GET /v1/identities/{identity_uid}/actions/{action_slug}/limits` before sizing a batch. Full capacity per account level is in the [limits reference](https://docs.edges.run/v1/linkedin/limits).
- **Cookieless.** Works with managed mode — no LinkedIn account needed.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractCompany({
  identity_mode: "managed",
  input: {
    linkedin_company_url: "https://www.linkedin.com/company/microsoft"
  }
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `company_name` | string | Company name |
| `linkedin_company_id` | string | **Immutable** numeric company ID — always store this |
| `description` | string | Company description / about |
| `website` | string | Company website URL |
| `domain` | string | Company domain |
| `number_employees` | number | Employee count |
| `employees_range` | string | Employee range (e.g., "10001+") |
| `industries` | array | Industry classifications |
| `headquarters` | string | HQ location |
| `type` | string | Company type (public, private, etc.) |

Full schema: `references/response-schema.md`

## Batch Usage (>15 items)
Use the Edges SDK — do NOT write a throwaway script:
```typescript
import { Edges } from '@edgesrun/sdk';
const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
const result = await ed.linkedin.extractCompanyAsync({
  inputs: urls.map(u => ({ linkedin_company_url: u }))
});
```


## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-extract-company-employees-insights` | Headcount breakdown by function, seniority, location |
| `edges-linkedin-extract-company-affiliates` | Subsidiaries and parent companies |
| `edges-linkedin-extract-similar-companies` | Competitor and similar company recommendations |
| `edges-linkedin-find-company-url` | Resolve a domain or company name to a LinkedIn URL first |
| `edges-linkedin-search-companies` | Search companies by keyword/industry/size |
| `edges-salesnavigator-extract-employees-distribution` | SN-powered department/seniority/location breakdown |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid URL format |
| 402 | No access | Billing/plan issue |
| 424 | Not found | Company page doesn't exist or was removed |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
