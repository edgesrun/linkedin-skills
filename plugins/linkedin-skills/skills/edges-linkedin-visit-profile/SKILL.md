---
name: edges-linkedin-visit-profile
description: >-
  Visit a LinkedIn profile via the Edges API. Use this skill when the user wants
  to visit someone's profile on LinkedIn, appear in their "who viewed your
  profile" section, warm up a lead before connecting, or trigger profile view
  notifications as the first step in an outreach sequence. Requires a connected
  LinkedIn identity (direct mode). Usually the first step before connecting.
license: Apache-2.0
---

# Visit LinkedIn Profile

Visit a LinkedIn profile so your identity appears in the person's "Who viewed your profile" section. This is typically the first step in an outreach sequence — warming up the lead before sending a connection request.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Warm up a lead by appearing in "who viewed your profile" | — |
| First step in an outreach sequence before connecting | — |
| Visit a profile on Sales Navigator | `edges-salesnavigator-visit-profile` |
| Send a connection request (next step after visiting) | `edges-linkedin-connect-profile` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-visit-profile/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-visit-profile/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Direct mode required** — visiting needs a specific LinkedIn identity to appear as the visitor.

```json
{ "identity_ids": ["your-identity-uuid"] }
```

This action does **not** work with managed mode. The visit must come from a specific identity to show in "who viewed your profile."


## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `linkedin_profile_url` | URI | Yes | LinkedIn profile URL to visit |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

**Regex:** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:in|pub|sales\/people|sales\/lead)\/[^\s/]+/`

## Parameters

No additional parameters.

## Key Notes

- **Daily limit: 80 profile visits per day** (500 with Sales Navigator), per identity.
- **Timing: ~30s processing delay.** Always add random jitter (0-15s) between visits to appear human-like.
- **Recommended as first outreach step.** Visit (day 0) → Connect with note (day 1) → Message after acceptance (day 3).
- **Credit-free with engagement identities.** Profile visits are among the 23 actions that run credit-free on engagement identity plans.
- **Minimal response.** Returns only `sales_navigator_profile_id` and `linkedin_profile_id` — the visit itself is the action.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.visitProfile({
  identity_ids: ["your-identity-uuid"],
  input: {
    linkedin_profile_url: "https://www.linkedin.com/in/someone"
  }
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `sales_navigator_profile_id` | string | SN profile ID of the visited person |
| `linkedin_profile_id` | integer | LinkedIn profile ID of the visited person |

## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-connect-profile` | Send connection request (next step after visiting) |
| `edges-linkedin-message-profile` | Message after connection is accepted |
| `edges-salesnavigator-visit-profile` | Visit via Sales Navigator interface |
| `edges-salesnavigator-visit-company` | Visit a company page on SN |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid profile URL |
| 424 | `PROFILE_NOT_ACCESSIBLE` | Profile deleted, blocked, or restricted |
| 424 | `LIMIT_REACHED` | Daily visit limit hit — read `postponed_until`, retry after |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
