---
name: edges-linkedin-extract-people
description: >-
  Extract full LinkedIn profile data via the Edges API. Use this skill when
  the user wants to get a LinkedIn profile, enrich a person, extract profile
  data from a LinkedIn URL, look up someone on LinkedIn, get professional
  information about a person, or retrieve a profile's headline, experience,
  education, or skills. This is the primary profile extraction action —
  use extract-people-experiences for complete job history beyond the last 5,
  and extract-contact for visible email/phone on the profile.
license: Apache-2.0
---

# Extract LinkedIn People

Extract a full LinkedIn profile including name, headline, location, experience, education, skills, and social metadata. This is the foundational enrichment action — most workflows start here.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Get a person's profile data from a LinkedIn URL | — |
| Enrich a lead with headline, location, current role | — |
| Get `linkedin_profile_id` or `sales_navigator_profile_id` for downstream actions | — |
| Get last 5 work experiences | `edges-linkedin-extract-people-experiences` for **all** positions |
| Get 1-2 main skills | `edges-linkedin-extract-people-skills` for full skills list |
| Get visible email or phone | `edges-linkedin-extract-contact` |
| Resolve a name to a LinkedIn URL first | `edges-linkedin-search-people` or `edges-linkedin-find-profile-url` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-extract-people/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-extract-people/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Managed** (cookieless) — no LinkedIn account needed. Use `"identity_mode": "managed"`.

Default: `"identity_mode": "managed"` (cookieless). For outreach/messaging: `"identity_ids": ["uuid"]`.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `linkedin_profile_url` | URI | Yes | LinkedIn profile URL. Accepts `/in/`, `/pub/`, `/sales/people/`, `/sales/lead/` formats. |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

**Regex:** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:in|pub|sales\/people|sales\/lead)\/[^\s/]+/`

## Parameters

All default to `false`. **Set all 4 to `true` for full enrichment.**

| Parameter | Default | What It Returns |
|---|---|---|
| `sections` | `false` | `summary`, `education`, `languages`, `volunteer_experiences`, `company_name`, `job_title`, `linkedin_company_url`, `linkedin_company_id` |
| `experiences` | `false` | Array of professional experiences — **last 5 positions only** (LinkedIn constraint, not API limitation). |
| `skills` | `false` | Partial list of skills (1-2 main). |
| `highlights` | `false` | `number_connections`, `number_followers`, `connection_degree`, `linkedin_thread_id`, `connected_at` |

## Key Notes

- **Only returns last 5 experiences.** This is a LinkedIn platform constraint, not an Edges limitation. Use `edges-linkedin-extract-people-experiences` for the complete job history (all positions, paginated in chunks of 20).
- **Skills are partial.** Only 1-2 main skills are returned. Use `edges-linkedin-extract-people-skills` for the full list with endorsement counts.
- **Always store immutable IDs.** `linkedin_profile_id` and `sales_navigator_profile_id` are immutable. Profile handles (`/in/slug`) can change at any time. If a stored URL stops working, reconstruct it from the SN profile ID or re-search by name.
- **Smart Limits:** this action consumes `Profile enrichments`, per identity, on a 24-hour rolling window. There is no single ceiling to assume: a new identity is still ramping up and a workspace can carry custom limits, so read the effective value from `GET /v1/identities/{identity_uid}/actions/{action_slug}/limits` before sizing a batch. Full capacity per account level is in the [limits reference](https://docs.edges.run/v1/linkedin/limits).
- **Latency:** Live mode returns in 2-6 seconds.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPeople({
  identity_mode: "managed",
  parameters: {
    sections: true,
    experiences: true,
    skills: true,
    highlights: true
  },
  input: {
    linkedin_profile_url: "https://www.linkedin.com/in/satya-nadella"
  }
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `first_name` | string | First name |
| `last_name` | string | Last name |
| `full_name` | string | Full display name |
| `headline` | string | Profile headline |
| `linkedin_profile_id` | string | **Immutable** LinkedIn profile ID — always store this |
| `sales_navigator_profile_id` | string | **Immutable** SN profile ID — needed for ConnectionOf URL construction |
| `linkedin_profile_url` | URI | Current profile URL |
| `location` | string | Location from profile |
| `profile_country` | string | Country code |
| `open_to_work` | boolean | Whether "Open to Work" badge is active |

Full schema: `references/response-schema.md`

## Batch Usage (>15 items)
Use the Edges SDK — do NOT write a throwaway script:
```typescript
import { Edges } from '@edgesrun/sdk';
const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
const result = await ed.linkedin.extractPeopleAsync({
  inputs: urls.map(u => ({ linkedin_profile_url: u }))
});
```


## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-extract-people-experiences` | Need **all** positions, not just the last 5 |
| `edges-linkedin-extract-people-skills` | Need full skills list with endorsement counts |
| `edges-linkedin-extract-people-educations` | Need detailed education data |
| `edges-linkedin-extract-contact` | Need email/phone if publicly visible on profile (free, cookieless) |
| `edges-linkedin-extract-contact` | Need visible email/phone from the profile |
| `edges-linkedin-search-people` | Resolve a name to a profile URL before extracting |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid URL format or malformed request |
| 402 | No access | Billing/plan issue |
| 424 | `PROFILE_NOT_ACCESSIBLE` | Profile deleted, blocked, or handle changed — re-search by name |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
