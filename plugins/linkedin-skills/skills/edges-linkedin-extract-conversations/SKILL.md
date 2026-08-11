---
name: edges-linkedin-extract-conversations
description: >-
  Extract LinkedIn messaging conversations via the Edges API. Use this skill when the user wants to list their LinkedIn message threads, check for replies in outreach, detect who replied by checking last_message sender, or audit messaging activity. Also use for sync-before-send — always extract conversations immediately before sending a message. Requires a connected identity (direct mode).
license: Apache-2.0
---

# Extract LinkedIn Conversations

Extract the conversation list from a LinkedIn identity's inbox. Critical for reply detection in outreach sequences and sync-before-send checks.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Get the conversation list from a LinkedIn inbox | — |
| Detect replies from leads (check `last_message` sender) | — |
| Sync-before-send: check inbox immediately before sending a message | — |
| Filter to unread conversations only | — |
| Read full messages within a specific conversation thread | `edges-linkedin-extract-messages` |
| Send a message to someone | `edges-linkedin-message-profile` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-extract-conversations/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-extract-conversations/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Direct mode required** — conversations belong to a specific LinkedIn identity.

```json
{ "identity_ids": ["your-identity-uuid"] }
```

This action does **not** work with managed mode. You must specify which identity's inbox to read.


## Input

**No URL input field.** This action operates on the identity's inbox — just pass an empty input object `{}`.

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `read` | boolean | `true` | `true` = all conversations (read + unread). `false` = unread only. |

## Key Notes

- **Reply detection pattern.** Extract conversations, check `last_message` sender — if the sender is not your identity, the lead has replied. This is more efficient than extracting all messages per thread.
- **Sync-before-send.** Always call this immediately before `edges-linkedin-message-profile` to prevent race conditions where a lead replies between your last check and the send.
- **Incremental sync supported.** For engagement identities, set `"sync_mode": "incremental"` in parameters to only receive conversations updated since the last run. Ideal for schedule mode monitoring.
- **Page size is 20** (fixed). Use cursor-based pagination via `X-Pagination-Next` header.
- **Credit-free with engagement identities.**

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractConversations({
  identity_ids: ["your-identity-uuid"],
  parameters: {
    read: false
  },
  input: {}
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `linkedin_thread_id` | string | Conversation thread ID |
| `linkedin_thread_url` | URI | URL to the conversation |
| `participants` | array | People in the conversation |
| `last_message` | object | Most recent message (check sender for reply detection) |
| `last_activity_at` | datetime | When conversation was last active |
| `read` | boolean | Whether conversation has been read |
| `unread_count` | integer | Number of unread messages |
| `total_received_messages` | string | Total received message count |
| `created_at` | datetime | When conversation was started |
| `sponsored` | boolean | Whether this is a sponsored message |

## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-extract-messages` | Read full messages within a specific thread |
| `edges-linkedin-message-profile` | Send a message (do sync-before-send first) |
| `edges-linkedin-connect-profile` | Check conversation before deciding to connect or message |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Missing identity_ids or invalid parameters |
| 424 | Integration error | LinkedIn account issue |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
