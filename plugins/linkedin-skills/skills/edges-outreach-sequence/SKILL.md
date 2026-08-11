---
name: edges-outreach-sequence
description: >-
  Design and execute LinkedIn outreach sequences via the Edges API. Use this skill when the user wants to send connection requests, message people on LinkedIn, build an outreach workflow, automate LinkedIn prospecting, set up a drip sequence, or handle outreach errors like ALREADY_CONNECTED or INVITATION_PENDING. Covers the full sequence: visit -> connect -> message -> follow-up.
license: Apache-2.0
---

# LinkedIn Outreach Sequences

This skill covers the complete outreach workflow: visit, connect, message, follow-up — including timing, reply detection, de-duplication, error handling, and safety patterns. All outreach actions require a connected LinkedIn identity (direct mode or engagement identity).

## Sequence Flow

A standard LinkedIn outreach sequence follows this timeline:

```
Day 0:  Visit profile          (~30s delay between visits)
Day 1:  Send connection request (~60s delay, optional note)
        ↓ wait for acceptance
Day 3:  Send first message      (~60s delay)
Day 7:  Follow-up message #1
Day 14: Follow-up message #2
        Archive conversation
```

Every timing includes random jitter (0-15 seconds) to simulate human behavior. Never send actions in rapid succession — LinkedIn detects and throttles automated patterns.

## Identity Requirements

Outreach actions do NOT work with managed mode. Use one of:

| Identity Type | Configuration | Cost |
|---|---|---|
| Standard identity | `"identity_ids": ["uuid"]` | 1x credits per action |
| Engagement identity | `"identity_ids": ["uuid"]` | **Free** for all 23 outreach actions |

For production outreach at scale, engagement identities ($7.99/mo per identity) eliminate credit costs entirely. See `edges-identity-guide` for setup.

## Daily Limits Per Identity

These are Smart Limits — Edges business logic caps on a 24-hour rolling window.

| Action | Standard | With Sales Navigator |
|---|---|---|
| Profile visits | 80/day | 500/day |
| Connection requests | 25/day | 30/day |
| Messages | 50/day | 250/day |
| InMail | varies | varies |

**Classic accounts** (non-Premium) are limited to **5 personalized connection notes per month**. Either send connection requests without notes, or upgrade the identity to Premium.

Query current usage: `GET /v1/identities/{identity_uid}/actions/{action_slug}/limits`

## Minimum Delays Between Actions

Add these delays when executing outreach in live mode. These are minimums — add random jitter of 0-15 seconds on top.

| Action | Minimum Delay | Edges Action Slug |
|---|---|---|
| Visit profile | ~30 seconds | `linkedin-visit-profile` |
| Send connection request | ~60 seconds | `linkedin-connect-profile` |
| Send message | ~60 seconds | `linkedin-message-profile` |
| Send InMail | ~30 seconds | `linkedin-inmail-profile` |
| Like a post | ~10 seconds | `linkedin-like-post` |
| Comment on a post | ~15 seconds | `linkedin-comment-post` |

## Step-by-Step Execution

### Step 1: Visit Profile (Day 0)

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.visitProfile({
  identity_ids: ["your-identity-uuid"],
  input: {
    linkedin_profile_url: "https://www.linkedin.com/in/target-person"
  }
});
console.log(data);
```

The target sees your identity in "Who viewed your profile" — this warms up the interaction before a connection request.

### Step 2: Send Connection Request (Day 1)

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.connectProfile({
  identity_ids: ["your-identity-uuid"],
  input: {
    linkedin_profile_url: "https://www.linkedin.com/in/target-person"
  },
  parameters: {
    note: "Hi {First_Name}, I saw your work on {topic} \u2014 would love to connect."
  }
});
console.log(data);
```

If the `note` parameter is omitted, a connection request is sent without a personalized message. Classic accounts should omit notes after using their 5/month allocation.

### Step 3: Check for Acceptance, Then Message (Day 3+)

Before messaging, verify the connection was accepted. Use reply detection (see below) or check for `NOT_CONNECTED` error when attempting to message.

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.messageProfile({
  identity_ids: ["your-identity-uuid"],
  input: {
    linkedin_profile_url: "https://www.linkedin.com/in/target-person"
  },
  parameters: {
    message_text: "Thanks for connecting! I wanted to share..."
  }
});
console.log(data);
```

### Step 4: Follow-Up Messages (Day 7, 14)

Same pattern as Step 3 with different `message_text`. Always check for replies before sending follow-ups — see the de-duplication section below.

## Reply Detection

Detecting whether a lead has replied is critical — sending a follow-up after they already responded creates a terrible experience.

**Pattern:** Call `linkedin-extract-conversations`, then check the `last_message` sender field.

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractConversations({
  identity_ids: ["your-identity-uuid"],
  input: {}
});
console.log(data);
```

In the response, each conversation has a `last_message` object with a sender. If the sender is NOT your identity, the lead replied.

This is more efficient than extracting all messages per thread — one API call checks reply status across all active conversations.

## Sync-Before-Send (Critical)

**ALWAYS call `linkedin-extract-conversations` immediately before sending a message.** This prevents a race condition where:

1. You check conversations at 9:00 AM — no reply
2. The lead replies at 9:05 AM
3. You send a follow-up at 9:10 AM — awkward, they just replied

By syncing immediately before each send, you catch replies that arrived between your last check and the current action.

## De-Duplication Checks

Before each outreach step, run these checks to avoid duplicate or conflicting actions:

| Before... | Check | If True |
|---|---|---|
| Connecting | Already connected? | Skip connect, advance to message |
| Connecting | Invitation already pending? | Wait — do not re-send |
| Messaging | Lead already replied? | Pause sequence, flag for human review |
| Messaging | Existing conversation? | Continue thread, do not start a new one |
| Any action | Lead messaged first? | Pause — do not auto-respond to inbound messages |

**Inbound-first rule:** If a lead initiated contact before your sequence reached them, pause the automated sequence and route to human review. Auto-responding to inbound messages feels robotic and damages the relationship.

## Error Handling

These errors are specific to outreach workflows. Handle them in your sequence logic — never retry them blindly.

| Error Label | Meaning | Correct Response |
|---|---|---|
| `ALREADY_CONNECTED` | Already connected with this person | Skip connect step, advance to message |
| `INVITATION_PENDING` | Connection request already sent | Continue waiting — do not re-send |
| `NOT_CONNECTED` | Cannot message a non-connection | Send connection request first, then wait |
| `LIMIT_REACHED` | Daily Smart Limit exhausted | Read `postponed_until` timestamp from error params. Queue the action for retry AFTER that time. **Never retry immediately.** |
| `PROFILE_NOT_ACCESSIBLE` | Profile deleted, blocked, or handle changed | Remove from pipeline. Optionally re-search by name + company. |
| `LK_INMAIL_NOT_ENOUGH_CREDIT` | No InMail credits remaining | Switch to connect + message workflow instead |
| `SN_ACCOUNT_UPGRADE` | Identity lacks Sales Navigator | Use a different identity with SN, or use managed mode for the SN action |

For the full error reference including retryable errors and backoff strategies, see `edges-error-handling`.

## Safety Guidelines for Bulk Outreach

### Three-Phase Approach: Decide → Review → Execute

1. **Decide:** Build your target list using search or extraction. Store results with `linkedin_profile_id` as the primary key (handles are mutable).
2. **Review:** Export the list for human review before executing any outreach. Verify: correct people? appropriate message? within daily limits?
3. **Execute:** Run the outreach sequence with proper delays, de-duplication, and error handling.

### Rate Management

- Stay within Smart Limits — do not try to circumvent them
- Spread outreach across the day rather than bursting all at once
- Monitor `LIMIT_REACHED` errors and respect `postponed_until` timestamps
- For high-volume campaigns, use multiple engagement identities with auto mode

### Message Quality

- Personalize messages using data from `linkedin-extract-people` (headline, current company, recent posts)
- Keep connection notes under 300 characters (LinkedIn limit)
- Vary message templates across leads — identical messages at scale trigger LinkedIn's spam detection

## InMail Alternative Path

When a target is not a 1st-degree connection and you need to reach them without waiting for a connection request acceptance:

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.inmailProfile({
  identity_ids: ["your-identity-uuid"],
  input: {
    linkedin_profile_url: "https://www.linkedin.com/in/target-person"
  },
  parameters: {
    subject: "Quick question about...",
    message: "Hi {First_Name}..."
  }
});
console.log(data);
```

InMail requires InMail credits on the identity's LinkedIn account. If credits are exhausted, `LK_INMAIL_NOT_ENOUGH_CREDIT` is returned — fall back to the standard connect + message path.

Sales Navigator InMail is also available via `salesnavigator-inmail-profile` for SN-enabled identities.

## Related Skills

- `edges-linkedin-visit-profile` — Visit a LinkedIn profile
- `edges-linkedin-connect-profile` — Send a connection request
- `edges-linkedin-message-profile` — Send a direct message
- `edges-linkedin-inmail-profile` — Send an InMail
- `edges-linkedin-extract-conversations` — Extract conversations for reply detection
- `edges-identity-guide` — Choose between direct and engagement identities
- `edges-error-handling` — Full error reference with retry strategies

For daily quotas and delay requirements, see `https://docs.edges.run/v1/linkedin/limits`.
