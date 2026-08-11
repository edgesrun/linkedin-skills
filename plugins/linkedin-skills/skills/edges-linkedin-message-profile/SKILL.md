---
name: edges-linkedin-message-profile
description: >-
  Send a direct message to a LinkedIn connection via the Edges API. Use this skill when the user wants to message someone on LinkedIn, send a DM, follow up with a connection, or send an outreach message. Target must be a 1st-degree connection — NOT_CONNECTED error if not. Always extract-conversations first (sync-before-send). Requires a connected identity (direct mode).
license: Apache-2.0
---

# Message LinkedIn Profile

Send a direct message to a LinkedIn connection. The target must be a 1st-degree connection — messaging a non-connection returns `NOT_CONNECTED`. This is typically the third step in an outreach sequence (visit → connect → message).

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Send a DM to a 1st-degree LinkedIn connection | — |
| Follow up with a connection | — |
| Send outreach message with optional file attachment | — |
| Target is NOT a connection yet | `edges-linkedin-connect-profile` first, then message after acceptance |
| Need to send InMail (no connection required) | `edges-linkedin-inmail-profile` |
| Check for replies before sending | `edges-linkedin-extract-conversations` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-message-profile/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-message-profile/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Direct mode required** — messaging needs a specific LinkedIn identity.

```json
{ "identity_ids": ["your-identity-uuid"] }
```

This action does **not** work with managed mode. You must specify which identity sends the message.


## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `linkedin_profile_url` | URI | Yes | LinkedIn profile URL of the recipient |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

**Regex:** `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:in|pub|sales\/people|sales\/lead)\/[^\s/]+/`

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `message` | string | `""` | Message text. Max 8,000 characters. |
| `files` | array | — | Optional file attachments. Each entry: Base64-encoded file content + original filename. |

## Key Notes

- **Target must be 1st-degree connection.** Messaging a non-connection returns `NOT_CONNECTED`. Send a connection request first.
- **Sync-before-send.** Always call `edges-linkedin-extract-conversations` immediately before sending to check for replies. This prevents race conditions where the lead replies between your last check and the send.
- **Daily limit: 50 messages per day** (250 with Sales Navigator), per identity. Timing: ~60s processing delay + add random jitter (0-15s).
- **Max 8,000 characters** per message.
- **Credit-free with engagement identities.** Messaging is among the 23 actions that run credit-free on engagement identity plans.

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.messageProfile({
  identity_ids: ["your-identity-uuid"],
  parameters: {
    message: "Hi, thanks for connecting! I wanted to share a quick thought on your recent post about AI agents."
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
| `is_sent` | boolean | Whether the message was successfully sent |
| `message` | string | Status message |
| `delivered_at` | datetime | Delivery timestamp |
| `linkedin_message_id` | string | Unique message ID |
| `linkedin_thread_id` | string | Conversation thread ID |
| `linkedin_thread_url` | URI | URL to the conversation thread |
| `sales_navigator_profile_id` | string | SN profile ID |
| `linkedin_profile_id` | integer | LinkedIn profile ID |
| `attachments` | array | Sent attachments |

## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-connect-profile` | Must connect **before** messaging (if not 1st-degree) |
| `edges-linkedin-extract-conversations` | Check for replies **before** sending (sync-before-send) |
| `edges-linkedin-inmail-profile` | Message non-connections via InMail |
| `edges-linkedin-visit-profile` | Visit profile before outreach sequence |
| `edges-linkedin-extract-messages` | Read messages from a specific conversation thread |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid profile URL or empty message |
| 424 | `NOT_CONNECTED` | Target is not a 1st-degree connection — connect first |
| 424 | `PROFILE_NOT_ACCESSIBLE` | Profile deleted, blocked, or restricted |
| 424 | `LIMIT_REACHED` | Daily message limit hit — read `postponed_until`, retry after |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
