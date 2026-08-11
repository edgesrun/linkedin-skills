# Error Handling

## Error Response Structure

All errors return structured JSON:

```json
{
  "error_label": "PROFILE_NOT_ACCESSIBLE",
  "error_scope": "input",
  "error_ref": "unique-error-id",
  "message": "The LinkedIn profile is not accessible",
  "status_code": 424
}
```

- `error_label` — machine-readable type (use for retry/routing logic)
- `error_scope` — which part of the request failed
- `error_ref` — unique ID for support tickets
- `message` — human-readable description
- `status_code` — HTTP status code

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Invalid input — wrong field name, malformed URL, schema violation |
| 401 | Invalid API key |
| 402 | Billing issue — check workspace plan |
| 422 | Run aborted |
| 424 | LinkedIn-level failure — profile not accessible, account restricted |
| 429 | API rate limit exceeded |

## Non-Retryable Errors

Handle these in application logic. Never retry — they indicate a state that must be addressed.

| Label | Meaning | Correct Response |
|---|---|---|
| `ALREADY_CONNECTED` | Already connected with this person | Skip connect step, advance to message |
| `INVITATION_PENDING` | Connection request already sent | Continue waiting, do not re-send |
| `NOT_CONNECTED` | Cannot message a non-connection | Send connection request first |
| `PROFILE_NOT_ACCESSIBLE` | Profile deleted, blocked, or handle changed | Remove from pipeline, or re-search by name |
| `LIMIT_REACHED` | Daily quota exhausted (Smart Limits) | Read `postponed_until` from error params, retry AFTER that timestamp. **Never retry immediately.** |
| `SN_ACCOUNT_UPGRADE` | Identity lacks Sales Navigator subscription | Use a different identity with SN, or use managed mode |
| `LK_INMAIL_NOT_ENOUGH_CREDIT` | No InMail credits remaining | Switch to connection request + message workflow |
| `BAD_INPUT` | Wrong field name or malformed URL | Fix the request — check the action's required input field name |
| `BAD_PARAMETERS` | Invalid parameter values | Fix parameter values in the request |
| `NO_ACCESS` | Billing or permission issue | Check workspace plan and identity permissions |
| `AUTH_EXPIRED` | Identity session expired | Re-authenticate the identity |

## Retryable Errors

Use exponential backoff. Max 3 retry attempts.

| Label | Meaning | Retry Strategy |
|---|---|---|
| `STATUS_429` | API rate limit | Read `Retry-After` header, wait that exact duration |
| `LK_ERROR` | Transient LinkedIn error | Backoff: `min(2^attempt * 2, 60)` seconds |
| `LK_524` | LinkedIn timeout | Same backoff formula |
| `GENERIC_ERROR` | Unknown transient error | Same backoff formula |
| `NO_DATA_LOADED` | Page failed to load | Same backoff formula |

### Backoff Formula

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts - 1) throw err;
      const delay = Math.min(2 ** attempt * 2, 60) + Math.random() * 2;
      await new Promise((r) => setTimeout(r, delay * 1000));
    }
  }
  throw new Error('unreachable');
}
```

## LIMIT_REACHED — Special Handling

`LIMIT_REACHED` is triggered by **Smart Limits** — Edges' daily action caps per identity on a 24-hour rolling window. These are Edges business logic, not LinkedIn rate limits.

### In Live Mode

The error response includes a `postponed_until` timestamp in the error params. Build a retry queue:

1. Read `postponed_until` from the error response
2. Queue the failed input for retry after that timestamp
3. **NEVER** retry immediately — the limit resets on a rolling 24-hour window

### In Async/Schedule Mode

Edges handles `LIMIT_REACHED` automatically — it queues and retries internally. No application-level handling needed.

### Query Current Limits

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });
const { data } = await ed.core.getIdentities();
console.log(data);
```

## Common Mistake: Wrong Field Name

A 400 error with `"body must NOT have additional properties"` almost always means:
- Using `inputs` (plural) on the `/run/live` endpoint (must be `input` singular)
- Using the wrong input field name for the action (e.g., `company_url` instead of `linkedin_company_url`)

Always check the action's required input field name. See `error-handling.md` for the full action reference, or consult the specific skill documentation.

Full error reference: https://docs.edges.run/v1/error-reference
