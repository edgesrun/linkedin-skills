---
name: edges-linkedin-connect-profile
description: >-
  Send a connection request on LinkedIn via the Edges API. Use this skill when
  the user wants to connect with someone on LinkedIn, send a connection
  invitation, add someone to their LinkedIn network, or send a connection
  request with an optional note. Requires a connected LinkedIn identity
  (direct mode). Part of the outreach sequence: visit → connect → message.
  For SN-based connection requests, use salesnavigator-connect-profile.
license: Apache-2.0
---

# Connect LinkedIn Profile

Send a LinkedIn connection request to a person, optionally with a personalized note. This is the second step in a typical outreach sequence (visit → connect → message after acceptance).

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Send a connection request on LinkedIn | — |
| Send a connection invitation with a personalized note | — |
| Send a connection request via Sales Navigator | `edges-salesnavigator-connect-profile` |
| Send a message to an existing connection | `edges-linkedin-message-profile` (must be 1st-degree) |
| Visit a profile before connecting (recommended first step) | `edges-linkedin-visit-profile` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-connect-profile/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-connect-profile/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Direct mode required** — outreach actions need a specific LinkedIn identity.

```json
{ "identity_ids": ["your-identity-uuid"] }
```

This action does **not** work with managed mode. You must specify which identity sends the connection request.


## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `linkedin_profile_url` | URI | Yes* | LinkedIn profile URL |
| `sales_navigator_profile_id` | string | Yes* | SN profile ID (alternative to URL). Must start with `ACo`, `ACw`, or `ACr`. |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

*One of `linkedin_profile_url` or `sales_navigator_profile_id` is required.

**Regex (URL):** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:in|pub|sales\/people|sales\/lead)\/[^\s/]+/`
**Regex (SN ID):** `/^AC[o-rw-z][\w-]+/`

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `message` | string | `""` | Personalized note to include with the invitation. Max 300 characters. |

## Key Notes

- **Daily limit: 25-30 connection requests per day** (per identity). Timing: ~60s processing delay + add random jitter (0-15s).
- **Classic accounts: 5 personalized notes per month.** If you need to send notes at scale, use a Premium or Sales Navigator account.
- **Handle `ALREADY_CONNECTED`.** If the person is already a 1st-degree connection, skip the connect step and go straight to messaging.
- **Handle `INVITATION_PENDING`.** If an invitation is already pending, do not re-send. Wait for acceptance or withdraw the existing invitation.
- **Recommended sequence:** Visit profile (day 0) → Connect with note (day 1) → Message after acceptance (day 3).
- **Credit-free with engagement identities.** Connection requests are among the 23 actions that run credit-free on engagement identity plans.
- **Safe connect script:** See `scripts/safe_connect.ts` for a ready-to-use TypeScript script with pre-checks (connection status, pending invitations) and human-like delays.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.connectProfile({
  identity_ids: ["your-identity-uuid"],
  parameters: {
    message: "Hi, I enjoyed your recent post on AI agents. Would love to connect."
  },
  input: {
    linkedin_profile_url: "https://www.linkedin.com/in/someone"
  }
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `connected` | boolean | Whether already connected (true if `ALREADY_CONNECTED`) |
| `pending` | boolean | Whether invitation is now pending |
| `message` | string | Status message |
| `connection_sent_date` | date | Date the invitation was sent |
| `sales_navigator_profile_id` | string | SN profile ID |
| `linkedin_profile_id` | integer | LinkedIn profile ID |

## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-visit-profile` | Visit profile **before** connecting (recommended first step) |
| `edges-linkedin-message-profile` | Message **after** connection is accepted |
| `edges-salesnavigator-connect-profile` | Send connection request via SN interface |
| `edges-linkedin-extract-conversations` | Check for replies before next outreach step |
| `edges-linkedin-withdraw-invitation` | Withdraw a pending invitation |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid profile URL or SN ID |
| 424 | `ALREADY_CONNECTED` | Already 1st-degree — skip to messaging |
| 424 | `INVITATION_PENDING` | Invitation already sent — do not re-send |
| 424 | `PROFILE_NOT_ACCESSIBLE` | Profile deleted, blocked, or restricted |
| 424 | `LIMIT_REACHED` | Daily connection limit hit — read `postponed_until`, retry after |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
