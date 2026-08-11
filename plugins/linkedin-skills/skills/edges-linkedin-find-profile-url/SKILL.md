---
name: edges-linkedin-find-profile-url
description: >-
  Find a LinkedIn profile URL by name via the Edges API. Use this skill when
  the user wants to find someone's LinkedIn profile from their name, resolve
  a person's name to a LinkedIn URL, look up a LinkedIn profile by full name,
  or do a quick person lookup without constructing a search URL. AI-powered
  lookup — simpler than search-people but less precise. No LinkedIn identity
  required. For more control over search results, use linkedin-search-people.
license: Apache-2.0
---

# Find LinkedIn Profile URL

AI-powered lookup that resolves a person's name to their LinkedIn profile URL. Simpler than constructing a search URL — just provide the name and optionally a company or domain to narrow results.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Quick lookup: have a name, want a LinkedIn URL | — |
| Simple name-to-profile resolution | — |
| Need more control over search (filters, multiple results) | `edges-linkedin-search-people` (construct a search URL) |
| Need full profile data after finding the URL | `edges-linkedin-extract-people` (enrich after finding) |
| Have a company name/domain and want the company URL | `edges-linkedin-find-company-url` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-find-profile-url/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-find-profile-url/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**No identity required.** This action accepts only `input` — do not pass `identity_ids` or `identity_mode`.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `full_name` | string | Yes | Person's full name (e.g., "Satya Nadella") |
| `company_name` | string | No | Company name to narrow the search |
| `domain` | string | No | Company domain to narrow the search |
| `job_title` | string | No | Job title to narrow the search |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

## Parameters

No additional parameters.

## Key Notes

- **AI-powered.** Uses AI matching internally — results are best-effort. For common names, add `company_name`, `domain`, or `job_title` to improve accuracy.
- **Less precise than search-people.** This returns a single best-guess URL. For identity resolution workflows where you need to review multiple candidates, use `edges-linkedin-search-people` with `only_extract_unique_profile: true`.
- **Returns just the URL.** To get full profile data, follow up with `edges-linkedin-extract-people`.
- **No LinkedIn account needed.** Call with API key + input only.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.findProfileUrl({
  input: {
    full_name: "Satya Nadella",
    company_name: "Microsoft"
  }
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `linkedin_profile_url` | URL | Best-match LinkedIn profile URL |

## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-search-people` | More control: multiple results, filters, identity resolution |
| `edges-linkedin-extract-people` | Enrich the found profile with full data |
| `edges-linkedin-find-company-url` | Find a company URL instead of a person URL |
| `edges-linkedin-extract-contact` | Get visible email/phone after finding the profile |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Missing full_name |
| 424 | Not found | No matching profile found |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
