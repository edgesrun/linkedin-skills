---
name: edges-linkedin-find-company-url
description: >-
  Find a company's LinkedIn page URL from their domain name or company name via the Edges API. Use this skill when the user has a domain (e.g. stripe.com) or company name and needs the verified LinkedIn URL. Always use this to resolve company URLs — never guess LinkedIn slugs. No LinkedIn identity required.
license: Apache-2.0
---

# Find Company LinkedIn URL

AI-powered lookup that resolves a company name or domain to the LinkedIn company page URL. Simpler than constructing a company search URL — just provide the name or domain.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Have a domain name, want the LinkedIn company URL | — |
| Have a company name, want the LinkedIn URL | — |
| Quick company-to-LinkedIn resolution | — |
| Need to search companies with filters (industry, size) | `edges-linkedin-search-companies` |
| Need full company data after finding the URL | `edges-linkedin-extract-company` (enrich after finding) |
| Have a person's name and want their profile | `edges-linkedin-find-profile-url` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-find-company-url/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-find-company-url/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**No identity required.** This action accepts only `input` — do not pass `identity_ids` or `identity_mode`.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `domain` | string | Yes* | Company domain (e.g., "microsoft.com") |
| `company_name` | string | Yes* | Company name (e.g., "Microsoft") |
| `address` | string | No | Company address to disambiguate |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

*One of `domain` or `company_name` is required.

## Parameters

No additional parameters.

## Key Notes

- **AI-powered.** Uses AI matching internally — best-effort resolution. Adding `address` can help disambiguate companies with common names.
- **Domain is the strongest signal.** When available, pass `domain` rather than `company_name` for more accurate matching.
- **Returns just the URL.** To get full company data (including `linkedin_company_id`), follow up with `edges-linkedin-extract-company`.
- **No LinkedIn account needed.** Call with API key + input only.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.findCompanyUrl({
  input: {
    domain: "microsoft.com"
  }
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `linkedin_company_url` | URL | Best-match LinkedIn company page URL |

## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-extract-company` | Enrich the found company with full data (get `linkedin_company_id`) |
| `edges-linkedin-search-companies` | Search companies with keyword/industry/size filters |
| `edges-linkedin-find-profile-url` | Find a person's profile URL instead |
| `edges-linkedin-search-company-employees` | Search employees at the found company |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Missing both domain and company_name |
| 424 | Not found | No matching company found |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
