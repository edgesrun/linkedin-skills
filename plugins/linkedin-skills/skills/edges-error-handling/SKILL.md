---
name: edges-error-handling
description: >-
  Handle errors from the Edges API correctly. This skill should be used when the user encounters
  an API error, needs to implement retry logic, wants to understand error codes, sees LIMIT_REACHED
  or ALREADY_CONNECTED errors, or is building error handling for an Edges integration.
license: Apache-2.0
---

# Error Handling for the Edges API

Every Edges error returns structured JSON with enough context to route, retry, or resolve programmatically. The key distinction: some errors are **non-retryable** (a state that must be addressed in logic) and some are **retryable** (transient failures that resolve with backoff). Treating a non-retryable error as retryable wastes credits and triggers rate limits. Treating a retryable error as fatal loses valid data.

## Error Response Structure

```json
{
  "error_label": "PROFILE_NOT_ACCESSIBLE",
  "error_scope": "input",
  "error_ref": "err-abc123-def456",
  "message": "The LinkedIn profile is not accessible",
  "status_code": 424
}
```

| Field | Purpose | Use In Code |
|---|---|---|
| `error_label` | Machine-readable error type | Primary routing key — switch/match on this |
| `error_scope` | Which part of the request failed | Helps distinguish input errors from system errors |
| `error_ref` | Unique error ID | Include in support tickets |
| `message` | Human-readable description | Log and display — do not parse programmatically |
| `status_code` | HTTP status code | First-pass triage before examining the label |

## HTTP Status Codes

| Code | Category | Meaning |
|---|---|---|
| 200 | Success | Request completed |
| 400 | Client error | Invalid input — wrong field name, malformed URL, schema violation. The most common cause: using `inputs` (plural) on the `/run/live` endpoint instead of `input` (singular). |
| 401 | Auth error | Invalid API key. Verify `X-API-Key` header (never `Authorization: Bearer`). |
| 402 | Billing error | Insufficient credits or plan limits. Check workspace plan at https://app.edges.run |
| 422 | Abort | Run was aborted — check if it was cancelled or timed out |
| 424 | LinkedIn error | LinkedIn-level failure. The request reached LinkedIn but failed there — profile not accessible, account restricted, etc. Check `error_label` for specifics. |
| 429 | Rate limit | API rate limit exceeded. Read the `Retry-After` response header for wait duration. |

## Non-Retryable Errors

These errors indicate a state that must be resolved in application logic. Retrying them is never correct — they will return the same error indefinitely until the underlying condition changes.

| Label | Meaning | Correct Response |
|---|---|---|
| `ALREADY_CONNECTED` | Already connected with this person | Skip the connect step, advance to message in the sequence |
| `INVITATION_PENDING` | Connection request was already sent | Wait for acceptance. Do not re-send — LinkedIn will flag duplicate requests |
| `NOT_CONNECTED` | Cannot message someone who is not a 1st-degree connection | Send a connection request first, then message after acceptance |
| `PROFILE_NOT_ACCESSIBLE` | Profile is deleted, blocked, restricted, or the handle changed | Remove from pipeline. Optionally re-search by name + company to find the updated handle. Store `linkedin_profile_id` (immutable) to avoid this in the future |
| `LIMIT_REACHED` | Daily Smart Limit exhausted for this identity + action | Read the `postponed_until` timestamp from the error params. Queue for retry AFTER that exact time. **Never retry immediately** — see special handling below |
| `SN_ACCOUNT_UPGRADE` | Identity does not have a Sales Navigator subscription | Use a different identity with SN access, or switch to managed mode (Edges' managed pool has SN) |
| `LK_INMAIL_NOT_ENOUGH_CREDIT` | No InMail credits left on this identity | Switch to the standard connect + message workflow |
| `BAD_INPUT` | Wrong input field name or malformed URL | Fix the request. Check the action's required input field name — each action has a specific one (e.g., `linkedin_profile_url`, `linkedin_company_url`, `sales_navigator_profile_search_url`) |
| `BAD_PARAMETERS` | Invalid parameter values | Fix the parameter values. Check allowed values in the action's skill documentation |
| `NO_ACCESS` | Billing or permission issue at the workspace level | Check workspace plan and identity permissions at https://app.edges.run |
| `AUTH_EXPIRED` | Identity's LinkedIn session has expired | Re-authenticate via `POST /identities/{uid}/login-links` or reconnect via cookies in the Edges dashboard |

## Retryable Errors

These are transient failures. Retry with exponential backoff, up to 3 attempts. If still failing after 3 retries, escalate — the issue is likely persistent.

| Label | Meaning | Retry Strategy |
|---|---|---|
| `STATUS_429` | API rate limit exceeded | Read the `Retry-After` response header. Wait that exact duration before retrying. Do NOT guess — the header tells you exactly how long. |
| `LK_ERROR` | Transient LinkedIn error | Exponential backoff: `min(2^attempt * 2, 60)` seconds + random jitter |
| `LK_524` | LinkedIn timeout (server took too long) | Same backoff formula |
| `GENERIC_ERROR` | Unknown transient error | Same backoff formula |
| `NO_DATA_LOADED` | Page failed to load at LinkedIn | Same backoff formula |

### Backoff Implementation

```typescript
const NON_RETRYABLE = new Set([
  'ALREADY_CONNECTED', 'INVITATION_PENDING', 'NOT_CONNECTED',
  'PROFILE_NOT_ACCESSIBLE', 'LIMIT_REACHED', 'BAD_INPUT',
  'NO_ACCESS', 'AUTH_EXPIRED',
]);

async function callWithRetry<T>(
  apiCall: () => Promise<{ ok: boolean; status: number; headers: Headers; data: T }>,
  maxAttempts = 3,
): Promise<T | any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await apiCall();
      if (response.ok) return response.data;
    } catch (err: any) {
      const label = err?.body?.error_label ?? '';
      if (NON_RETRYABLE.has(label)) return err.body;

      if (err?.response?.status === 429) {
        const wait = Number(err.response.headers.get('Retry-After') ?? 60);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }

      if (['LK_ERROR', 'LK_524', 'GENERIC_ERROR', 'NO_DATA_LOADED'].includes(label)) {
        if (attempt < maxAttempts - 1) {
          const delay = Math.min(2 ** attempt * 2, 60) + Math.random() * 2;
          await new Promise((r) => setTimeout(r, delay * 1000));
          continue;
        }
      }
      return err?.body ?? err;
    }
  }
}
```

## LIMIT_REACHED — Deep Dive

This error deserves special attention because it behaves differently from every other error and is the most common cause of production pipeline failures.

### What It Is

`LIMIT_REACHED` is triggered by **Smart Limits** — Edges' daily action caps per identity per action. These operate on a **24-hour rolling window** (not a midnight reset). They are Edges business logic, not LinkedIn rate limits.

### In Live Mode — Build a Retry Queue

The error response includes `postponed_until` in the error params — an ISO timestamp indicating when the limit resets:

1. Parse `postponed_until` from the error response
2. Queue the failed input for retry after that timestamp
3. Continue processing other inputs that use different identities or actions
4. **NEVER** retry immediately — the rolling window means the limit won't reset for hours

### In Async/Schedule Mode — Automatic

Edges handles `LIMIT_REACHED` internally in async and schedule mode. It queues affected inputs and retries them automatically when the limit resets. No application-level handling needed.

### Query Current Limits

Check remaining capacity before starting a batch:

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
const { data } = await ed.core.getIdentities();
console.log(data);
```

## Common Mistake: The 400 Trap

A 400 error with `"body must NOT have additional properties"` is almost always one of two things:

1. **Using `inputs` (plural) on `/run/live`** — live mode requires `input` (singular). This is the #1 mistake across all Edges integrations.
2. **Using the wrong input field name** — e.g., `company_url` instead of `linkedin_company_url`, or `linkedin_jobs_search_url` instead of `linkedin_job_search_url`.

Each action has a unique input field name. Always check the specific action's skill documentation for the exact field name.

## Related Skills

- `edges-outreach-sequence` — Outreach-specific error handling in the context of sequence workflows
- `edges-getting-started` — First API call and body schema (input vs inputs)
- `edges-identity-guide` — Identity modes and SN requirements (relevant for AUTH_EXPIRED, SN_ACCOUNT_UPGRADE)

For the complete error table with all HTTP status codes, see `https://docs.edges.run/v1/error-reference`.

Full error reference: https://docs.edges.run/v1/error-reference
