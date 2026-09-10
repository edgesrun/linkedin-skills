# LinkedIn Platform Constraints

These are inherent LinkedIn behaviors — not Edges limitations. Design every implementation around them.

## Experiences Are Split Into Two Calls

LinkedIn limits profile extraction to the last 5 experiences. For complete job history, two calls are always required:

1. `linkedin-extract-people` with `parameters: { experiences: true }` — returns profile + last 5 positions
2. `linkedin-extract-people-experiences` — returns all positions, paginated in chunks of 20

This is a LinkedIn constraint, not an API limitation.

## Post Engagement: 20-Per-Page Cap in Live Mode

Extracting likers or commenters in live mode returns 20 per page. Paginate manually via `X-Pagination-Next` (see `pagination.md`). For the complete list without manual pagination, use async mode — Edges handles all pages internally.

Nested comment replies (replies to comments) are not accessible — LinkedIn does not expose them.

## Daily Quotas Per Identity (Smart Limits)

Edges enforces daily action caps per identity per action on a 24-hour rolling window. These are Edges business logic limits, not LinkedIn rate limits.

These are **full-capacity planning figures**. They are not runtime values: a newly connected identity
is still ramping up, and a workspace can carry custom limits, so the effective ceiling differs per
identity. Read it before sizing a batch:

`GET /v1/identities/{identity_uid}/actions/{action_slug}/limits`

| Action | Standard | With Sales Navigator |
|---|---|---|
| Profile visits | 80/day | 500/day |
| Connection requests | 25/day | 30/day |
| Messages | 250/day | 250/day |
| Profile enrichments | 1,400/day \* | 2,100/day \* |
| Search people | 450/day, plus 900 unique profiles returned | 950/day |
| Company enrichments | 10,000/day | 10,000/day |
| Contact info extractions | 250/day | 250/day |
| InMail | 5 per ~31 days (15 Premium) | 50 per ~31 days |

\* Tuned per platform configuration — the endpoint above is authoritative.

Search people consumes **two** limits at once: the search call itself and the number of unique
profiles the results contain. Either can stop the action.

InMail is the one quota that is **not** daily — it runs on a roughly 31-day window.

The full table, by account level, is in the [limits reference](https://docs.edges.run/v1/linkedin/limits).

## Live Mode Outreach Delays

Add these delays between outreach actions to avoid detection:

| Action | Minimum Delay |
|---|---|
| Visit profile | ~30 seconds |
| Connect | ~60 seconds |
| Message | ~60 seconds |
| InMail | ~30 seconds |

Always add random jitter (0-15 seconds) on top of the base delay.

## Classic Account Limitations

Classic LinkedIn accounts (non-Premium) are limited to **5 personalized connection notes per month**. Send connection requests without notes to avoid hitting this limit, or upgrade the identity to Premium.

## Profile Handles Are Mutable

LinkedIn profile handles (the slug after `/in/`) can be changed by users at any time. Always store immutable identifiers:

- `linkedin_profile_id` — immutable, unique across all of LinkedIn
- `sales_navigator_profile_id` — useful for URL reconstruction if handle changes
- `linkedin_company_id` — never changes for companies

If a stored profile URL returns `PROFILE_NOT_ACCESSIBLE`, reconstruct the URL using the Sales Navigator Profile ID, or re-search by name + company to find the updated handle.

## Pagination Cursors Expire After 24 Hours

The `X-Pagination-Next` cursor has a 24-hour TTL. If pagination takes longer, the cursor becomes invalid — restart from page 1. For large result sets (1,000+), use async mode instead (no cursor expiry concern).

## Sales Navigator Requires SN-Enabled Identity

SN actions (`salesnavigator-search-people`, `salesnavigator-extract-*`, etc.) require an identity with an active Sales Navigator subscription when using direct or auto mode. A standard LinkedIn Premium identity fails with `SN_ACCOUNT_UPGRADE` error. Managed mode handles this transparently — Edges uses its own SN-enabled accounts.
