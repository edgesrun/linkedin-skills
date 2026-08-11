---
name: edges-linkedin-extract-messages
description: >-
  Extract messages from a LinkedIn conversation thread via the Edges API. Use this skill when the user wants to read messages in a specific LinkedIn conversation, get the full message history of a thread, or check message content. Use edges-linkedin-extract-conversations first to list threads and get the thread URL. Requires a connected identity (direct mode).
license: Apache-2.0
---

# Extract LinkedIn Messages

Extract all messages from a specific LinkedIn conversation thread. Returns message content, sender details, timestamps, and attachments.

## When to Use

| Use This Skill | Use Instead |
|---|---|
| Read full messages in a specific LinkedIn conversation thread | — |
| Get message history with a specific person | — |
| List all conversations in the inbox (to find the thread URL) | `edges-linkedin-extract-conversations` first |
| Quick reply detection (without reading all messages) | `edges-linkedin-extract-conversations` (check `last_message` sender) |
| Send a message | `edges-linkedin-message-profile` |

## Endpoint

- **Live:** `POST https://api.edges.run/v1/actions/linkedin-extract-messages/run/live`
- **Async:** `POST https://api.edges.run/v1/actions/linkedin-extract-messages/run/async`

Live mode: `"input"` (singular, one object). Async mode: `"inputs"` (plural, array). Use live for <=15 items, async for >15.

## Identity Mode

**Direct mode required** — messages belong to a specific LinkedIn identity.

```json
{ "identity_ids": ["your-identity-uuid"] }
```

This action does **not** work with managed mode. You must specify which identity's messages to read.


## Input

| Field | Type | Required | Description |
|---|---|---|---|
| `linkedin_thread_url` | string | Yes | LinkedIn conversation thread URL (e.g., `https://www.linkedin.com/messaging/thread/2-abc123==/`) or thread ID (e.g., `2-abc123==/`). |
| `custom_data` | object | No | Custom metadata passed through to the output for correlation. |

**Regex:** `/(?<=thread\/|^)\d.+?==/`

## Parameters

No additional parameters.

## Key Notes

- **Get the thread URL first.** Use `edges-linkedin-extract-conversations` to list conversations and find the `linkedin_thread_url` for the thread you want to read.
- **Incremental sync supported.** For engagement identities, set `"sync_mode": "incremental"` to only receive messages since the last run.
- **Page size is 20** (fixed). Use cursor-based pagination via `X-Pagination-Next` header.
- **Credit-free with engagement identities.**

## Example — Live

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractMessages({
  identity_ids: ["your-identity-uuid"],
  input: {
    linkedin_thread_url: "https://www.linkedin.com/messaging/thread/2-OTFhNjRhZDUtY2M4ZS00OGM4LWJjYTctYTQwYjc5NmY3ZmJkXzAxMg==/"
  }
});
console.log(data);
```

## Response (Key Fields)

| Field | Type | Description |
|---|---|---|
| `content` | string | Message text content |
| `first_name` | string | Sender first name |
| `last_name` | string | Sender last name |
| `linkedin_profile_id` | integer | Sender LinkedIn profile ID |
| `sales_navigator_profile_id` | string | Sender SN profile ID |
| `job_title` | string | Sender job title |
| `delivered_at` | datetime | When message was delivered |
| `created_at` | datetime | When message was created |
| `message_id` | string | Unique message ID |
| `linkedin_thread_id` | string | Thread ID |
| `position` | integer | Message position in thread |
| `attachments` | array | File attachments |

Full schema: `references/response-schema.md`

## Related Skills

| Skill | When to Use Instead / Together |
|---|---|
| `edges-linkedin-extract-conversations` | List all conversations first (to find thread URL) |
| `edges-linkedin-message-profile` | Send a reply in the conversation |

## Errors

| Code | Label | Meaning |
|---|---|---|
| 400 | Bad parameters | Invalid thread URL or thread ID format |
| 424 | Integration error | Thread not found or account issue |
| 429 | Rate limited | Check `retry_after` header |

See https://docs.edges.run/v1/error-reference for full error reference.
