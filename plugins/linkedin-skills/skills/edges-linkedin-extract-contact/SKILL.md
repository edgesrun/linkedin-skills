---
name: edges-linkedin-extract-contact
description: >-
  Extract contact information (email, phone, address) from a LinkedIn profile via the Edges API. Use this skill when the user wants to get someone's contact details from their LinkedIn profile. Requires a connected LinkedIn identity (`identity_ids`). Does not support managed mode.
license: Apache-2.0
---

# Extract LinkedIn Contact Info

Extract email, phone, Twitter, and website from a LinkedIn profile. Returns only information the person has made publicly visible on their profile — coverage varies by person.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Get email/phone/Twitter/website visible on a LinkedIn profile | — |
| Quick contact lookup at no extra credit cost | — |
| Need full profile data (role, experience, skills) | `edges-linkedin-extract-people` |
| Need full profile data (headline, experience, etc.) | `edges-linkedin-extract-people` (then use this for contact info) |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-extract-contact/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-extract-contact/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Direct mode required** — pass a connected LinkedIn identity.

```json
{ "identity_ids": ["your-identity-uuid"] }
```

**IMPORTANT:** This action does NOT support `identity_mode: "managed"`. You MUST use `identity_ids`.

## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `linkedin_profile_url` | URI | Yes | LinkedIn profile URL. Accepts `/in/`, `/pub/`, `/sales/people/`, `/sales/lead/` formats. |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

**Regex:** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:in|pub|sales\/people|sales\/lead)\/[^\s/]+/`

## Parameters

No additional parameters. Contact data is always fully extracted.

## Key Notes

- **Coverage depends on the person.** Not everyone makes their email or phone visible on LinkedIn. Expect partial results — some profiles return only email, some only phone, some nothing.
- **Visible contact only.** This extracts what's publicly listed on the profile (email/phone/address when present).
- **Smart Limits:** 250 contact extractions per identity per 24 hours.
- **Requires a connected identity.** Managed mode is not available for this action.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractContact({
  identity_ids: ["your-identity-uuid"],
  input: {
    linkedin_profile_url: "https://www.linkedin.com/in/satya-nadella"
  }
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `email` | email | Email address (if visible) |
| `phone` | string | Primary phone number (if visible) |
| `phones` | array of strings | All phone numbers |
| `website` | URI | Personal website (if listed) |
| `twitter` | URI | Twitter profile URL |
| `twitter_handles` | array of strings | Twitter handles |
| `connected_at` | datetime | When connection was established |
| `linkedin_profile_id` | integer | Immutable LinkedIn profile ID |
| `sales_navigator_profile_id` | string | Immutable SN profile ID |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_handle` | string | Profile handle slug |

Full schema: `references/response-schema.md`

## Batch Usage (>15 items)
Use the Edges SDK — do NOT write a throwaway script:
```typescript
import { Edges } from '@edgesrun/sdk';
const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
const result = await ed.linkedin.extractContactAsync({
  identity_ids: ["your-identity-uuid"],
  inputs: urls.map(u => ({ linkedin_profile_url: u }))
});
```


## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-extract-people` | Need full profile enrichment beyond contact fields |
| `edges-linkedin-extract-people` | Get full profile data first, then extract contact info |
| `edges-linkedin-find-profile-url` | Resolve a name to a profile URL before extracting contact info |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid URL format |
| 402 | No access | Billing/plan issue |
| 424 | `PROFILE_NOT_ACCESSIBLE` | Profile deleted, blocked, or handle changed |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
