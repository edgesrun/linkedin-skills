# Identity Modes

Identity modes control which LinkedIn account performs an action. Choose the right mode based on the action type, cost requirements, and architecture.

## Managed Mode (Cookieless)

No LinkedIn account needed. Edges uses its own account pool.

```json
{ "identity_mode": "managed" }
```

- **Cost:** 1.5x credits per action
- **Setup:** None — just an API key
- **Available for:** All extraction actions, all search actions, Sales Navigator search and extraction, Find Profile/Company URL
- **Not available for:** Outreach (messaging, connecting), monitoring own account (connections, followers, messages)

Use managed mode as the default for all data extraction and search.

## Direct Mode (Your Accounts)

Specify exactly which identity performs the action.

```json
{ "identity_ids": ["your-identity-uuid"] }
```

- **Cost:** 1x credits per action
- **Setup:** Connect a LinkedIn account to an identity in your workspace
- **Required for:** Extract Connections, Extract Followers, Extract Profile Viewers, Extract Conversations, Extract Messages, Send Message, Send InMail, Connect, Like, Comment, Accept/Withdraw Invitations, Visit Profile
- **Use when:** The action requires a specific LinkedIn account, or you need to control which account is used

## Auto Mode (Load-Balanced)

Distribute requests across all connected accounts automatically via Smart Limits.

```json
{ "identity_mode": "auto" }
```

- **Cost:** 1x credits per action
- **Best for:** GTM teams with multiple reps running parallel outreach
- **How it works:** Edges selects the best available identity based on current limit usage

## Engagement Identities

A special identity type for SaaS products and GTM teams.

- **Price:** $7.99/month per identity
- **Billing:** Per active identity per month (active = at least one action in 30 days)
- **Must set `type: "engagement"` at creation** — cannot be changed afterwards

### 23 Credit-Free Actions

Connect Profile, Message Profile, InMail, Visit Profile, Like Post, Comment Post, Follow Profile, Accept/Withdraw Invitations, Extract Connections, Extract Conversations, Extract Messages, Extract Followers, Extract Profile Viewers, Extract Sent/Received Invitations, Invite to Event.

### SaaS Architecture

Create one engagement identity per end-user. Each user's actions run under their own LinkedIn account, credit-free. This is the correct model for outreach products embedding Edges — not managed mode, not per-credit billing per send.

## Sales Navigator Requirement

SN actions (`salesnavigator-search-people`, `salesnavigator-extract-*`, etc.) require an identity with an active Sales Navigator subscription when using direct or auto mode. A standard LinkedIn Premium identity fails with `SN_ACCOUNT_UPGRADE` error. Managed mode handles this transparently.

## Credit Comparison

| Mode | Cost | Account Needed |
|---|---|---|
| Managed | 1.5x credits | No |
| Direct | 1x credits | Yes |
| Auto | 1x credits | Yes (multiple) |
| Engagement (23 actions) | Free | Yes ($7.99/mo per identity) |

## Decision Guide

| Scenario | Mode | Why |
|---|---|---|
| Getting started, no accounts | `managed` | Zero setup, immediate use |
| High volume, cost-sensitive | `direct` or `auto` | 1 credit vs 1.5x for managed |
| Burst traffic beyond own quota | `managed` as overflow | Supplement own accounts |
| SaaS with end-users connecting LinkedIn | `direct` with engagement identity per user | Each user's actions run under their own account, credit-free |
| Need Sales Navigator actions | `direct` or `auto` with SN-enabled identities | SN actions require active SN subscription |
| GTM team with multiple reps | `auto` | Load-balances across all connected accounts automatically |
