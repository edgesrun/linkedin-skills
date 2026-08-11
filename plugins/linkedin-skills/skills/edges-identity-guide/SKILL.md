---
name: edges-identity-guide
description: >-
  Choose the right identity mode for Edges API calls. This skill should be used when the user
  asks about identity modes, needs to decide between managed and direct mode, wants to understand
  engagement identities, is building a SaaS product with Edges, asks about credit costs, or
  needs to connect a LinkedIn account.
license: Apache-2.0
---

# Identity Mode Guide

Identity modes control which LinkedIn account executes an action. Choosing the wrong mode causes silent failures (wrong data returned), 403 errors, or unnecessary credit spend. This guide covers every mode, when to use it, and the architectural patterns behind them.

## Quick Decision Table

Start here. Find the scenario, use that mode.

| Scenario | Mode | Why |
|---|---|---|
| Getting started, no LinkedIn accounts | `managed` | Zero setup — just an API key |
| Any extraction or search | `managed` | Cookieless, works for all data retrieval |
| High volume, cost-sensitive | `direct` or `auto` | 1x credits vs 1.5x for managed |
| Outreach (message, connect, InMail) | `direct` | Requires a specific LinkedIn account |
| Monitoring own connections/messages | `direct` | Data is specific to one account |
| GTM team with multiple reps | `auto` | Load-balances across all accounts automatically |
| Burst traffic beyond own quotas | `managed` as overflow | Supplement own accounts when limits are hit |
| SaaS product with end-users | `direct` + engagement identity per user | Credit-free outreach, per-user billing |
| Sales Navigator actions (direct/auto) | Verify SN subscription | Standard Premium fails with `SN_ACCOUNT_UPGRADE` |

---

## Managed Mode (Cookieless)

```json
{ "identity_mode": "managed" }
```

Edges uses its own pool of LinkedIn accounts. No account connection, no session management, no cookie handling.

**Cost:** 1.5x credits per action
**Setup:** None — API key only
**Works for:** All extraction actions, all search actions, Sales Navigator search and extraction, Find Profile/Company URL

**Does NOT work for:**
- Outreach: messaging, connecting, InMail, liking, commenting
- Personal monitoring: connections, followers, profile viewers, conversations, messages
- Actions that read or write data specific to a LinkedIn account

**Why 1.5x credits:** Edges maintains and rotates the managed account pool. The premium covers infrastructure cost. For most users starting out, the convenience outweighs the cost delta.

**Default rule:** Use managed mode for everything unless the action requires a specific identity. This is the safest starting point.

---

## Direct Mode (Your Accounts)

```json
{ "identity_ids": ["your-identity-uuid"] }
```

Specify exactly which identity performs the action. The identity must have a connected LinkedIn account (integration).

**Cost:** 1x credits per action
**Setup:** Create an identity, connect a LinkedIn account via OAuth or cookies
**Required for:** Extract Connections, Extract Followers, Extract Profile Viewers, Extract Conversations, Extract Messages, Send Message, Send InMail, Connect, Like, Comment, Follow, Accept/Withdraw Invitations, Visit Profile

**When to use direct over managed:**
1. The action is user-specific (outreach, monitoring)
2. Cost optimization at scale — 1x vs 1.5x adds up on high volume
3. ConnectionOf searches where the results depend on whose network is being queried

**Multiple identities:** Pass multiple UUIDs in the array to run across specific accounts. Edges distributes work using Smart Limits.

---

## Auto Mode (Load-Balanced)

```json
{ "identity_mode": "auto" }
```

Edges automatically selects the best available identity based on current Smart Limit usage across all connected accounts in the workspace.

**Cost:** 1x credits per action
**Best for:** GTM teams with multiple reps running parallel outreach campaigns
**How it works:** Edges checks daily limit consumption per identity per action, then routes to the identity with the most remaining capacity

**Caveat:** Auto mode requires at least one connected identity in the workspace. It returns a 403 if no identities are available or all are at their daily limits.

---

## Engagement Identities

A special identity type designed for SaaS products embedding LinkedIn functionality and GTM teams monitoring rep activity.

**Price:** $7.99/month per identity
**Billing:** Per active identity per month (active = at least one action in 30 days)
**Creation:** Set `type: "engagement"` at identity creation — **this cannot be changed afterwards**

### 23 Credit-Free Actions

These actions cost zero credits when run on an engagement identity:

Connect Profile, Message Profile, InMail, Visit Profile, Like Post, Comment Post, Follow Profile, Accept Invitation, Withdraw Invitation, Accept Invitations (bulk), Withdraw Invitations (bulk), Extract Connections, Extract Conversations, Extract Messages, Extract Messages (Legacy), Extract Followers, Extract Profile Viewers, Extract Sent Invitations, Extract Received Invitations, Invite to Event, Mark Message as Read, Archive Message, Download Attachment.

All other actions (extraction, search, enrichment) still consume credits at the standard 1x rate.

### SaaS Architecture Pattern

For products that embed LinkedIn outreach or monitoring:

1. **Create one engagement identity per end-user** — each user's actions run under their own LinkedIn account
2. **Generate a login link** via `POST /identities/{uid}/login-links` endpoint — password-free OAuth for account connection
3. **Run outreach actions credit-free** — the $7.99/mo covers all 23 outreach and monitoring actions
4. **Bill per active identity** — only active identities (1+ action in 30 days) incur charges

This is the correct architecture for outreach SaaS. Do NOT use managed mode for outreach (it doesn't work — outreach requires a specific identity). Do NOT use per-credit billing for send actions (engagement identities make sends free).

### Webhook Lifecycle

Listen for these webhooks to manage identity health:
- `AUTH_SUCCESS` — identity connected successfully
- `AUTH_EXPIRED` — session expired, re-authentication needed

---

## Sales Navigator Requirements

SN actions (`salesnavigator-search-people`, `salesnavigator-extract-*`, `salesnavigator-visit-*`, etc.) have a specific identity requirement:

- **Managed mode:** Works transparently — Edges uses its own SN-enabled accounts
- **Direct/Auto mode:** The identity MUST have an active Sales Navigator subscription. A standard LinkedIn Premium identity fails with `SN_ACCOUNT_UPGRADE` error

Verify SN access before routing SN actions to direct/auto identities.

---

## Credit Comparison

| Mode | Credit Cost | Account Needed | Setup |
|---|---|---|---|
| Managed | 1.5x | No | API key only |
| Direct | 1x | Yes | Create identity + connect LinkedIn |
| Auto | 1x | Yes (1+ accounts) | Create identities + connect LinkedIn |
| Engagement (23 actions) | **Free** | Yes ($7.99/mo) | Create engagement identity + connect |
| Engagement (other actions) | 1x | Yes ($7.99/mo) | Same |

### Cost Example

Extracting 10,000 profiles per month:
- **Managed:** 15,000 credits
- **Direct:** 10,000 credits (33% savings)
- **Breakeven:** If your credit cost per unit makes the 5,000-credit delta exceed the identity management overhead, switch to direct

Running 1,000 outreach actions per month per rep (visit + connect + message):
- **Direct (standard identity):** 3,000 credits per rep
- **Engagement identity:** 0 credits + $7.99/mo per rep

---

## Related Skills

- `edges-list-identities` — List all identities and check which LinkedIn accounts are connected
- `edges-getting-started` — API setup and first call
- `edges-outreach-sequence` — Outreach workflows that use direct/engagement identities

**Identity management endpoints** (not loaded as skills — use the SDK):
- `POST /identities` — Create identity
- `POST /identities/{uid}/login-links` — Generate OAuth login link
- `GET /identities/{uid}/integrations/{type}` — Check integration status
- `GET /identities/{uid}/actions/{slug}/limits` — Query Smart Limit usage

For the complete identity mode reference, see `the identity guide at https://docs.edges.run/v1/identities/modes`.
