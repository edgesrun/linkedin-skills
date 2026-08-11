# Execution Modes

Edges supports three execution modes: live (synchronous), async (batch), and schedule (recurring). The TypeScript SDK maps each to a method suffix: `action()`, `actionAsync()`, `actionSchedule()`.

## Live Mode (Synchronous)

Returns results immediately. SDK method has **no suffix** (e.g. `ed.linkedin.extractPeople`).

Body uses **`input` (SINGULAR)** — a single object, NOT an array:

```typescript
const { data } = await ed.linkedin.extractPeople({
  identity_mode: 'managed',
  input: {
    linkedin_profile_url: 'https://www.linkedin.com/in/satya-nadella',
  },
  parameters: {
    experiences: true,
    skills: true,
  },
});
```

**CRITICAL:** Using `inputs` (plural) on a live method returns a 400 error: `"body must NOT have additional properties (inputs)"`. This is the #1 agent mistake.

### When to Use Live

- Single record, user-triggered requests
- <= 15 items (make parallel calls, one per item)
- Max recommended concurrency: 14 parallel live calls

## Async Mode (Batch)

Runs in background. Returns a `run_uid` for polling or delivers results via callback. SDK method ends with **`Async`**.

Body uses **`inputs` (PLURAL)** — an array of objects:

```typescript
const result = await ed.linkedin.extractPeopleAsync({
  identity_mode: 'managed',
  inputs: [
    { linkedin_profile_url: 'https://www.linkedin.com/in/person-1' },
    { linkedin_profile_url: 'https://www.linkedin.com/in/person-2' },
  ],
  callback: {
    url: 'https://your-app.com/webhook',
    on: 'final',
  },
});
```

**Anti-pattern:** Do NOT send one input per async request when you have 200 inputs. Send all 200 in one request — Edges batches internally. Max ~100 items per submission.

### Polling (Alternative to Callbacks)

```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const submitted = await ed.linkedin.extractPeopleAsync({
  identity_mode: 'managed',
  inputs: [{ linkedin_profile_url: 'https://www.linkedin.com/in/person-1' }],
});

const runUid = (submitted.data as { run_uid?: string })?.run_uid!;

// Poll until SUCCEEDED
let status = await ed.core.getRunStatus({ run_uid: runUid });
while (!['SUCCEEDED', 'FAILED', 'PARTIAL_SUCCEEDED'].includes((status.data as any)?.status)) {
  await new Promise((r) => setTimeout(r, 3000));
  status = await ed.core.getRunStatus({ run_uid: runUid });
}

const outputs = await ed.core.getRunOutputs({ run_uid: runUid });
console.log(outputs.data);
```

### When to Use Async

- Batch of 2+ inputs (especially > 15)
- Large result sets (1,000+) — no cursor expiry concern
- n8n / Make / Zapier integrations (`callback.on: "final"` + poll outputs)

## Schedule Mode (Recurring)

Executes actions on a CRON schedule. Results delivered via callbacks. SDK method ends with **`Schedule`**.

Body uses **`inputs` (plural)**, same as async, plus `cron` and `timezone`:

```typescript
await ed.linkedin.extractCompanySchedule({
  identity_mode: 'managed',
  inputs: [{ linkedin_company_url: 'https://www.linkedin.com/company/edges' }],
  cron: '0 9 * * 1-5',
  timezone: 'Europe/Paris',
  callback: { url: 'https://your-app.com/webhook', on: 'final' },
});
```

### Incremental Sync

For engagement identities. Fetches only new data since last run. Set `"sync_mode": "incremental"` in parameters. Supported for: `linkedin-extract-connections`, `linkedin-extract-messages`, `linkedin-extract-profile-viewers`.

### When to Use Schedule

- Recurring monitoring (new connections, new messages, competitor hiring)
- Content monitoring (`linkedin-search-content`)
- Combined with `sync_mode: "incremental"` for only-new-data pipelines

## Callbacks

- **Streaming** (`"on": "all"`): Multiple callbacks as results arrive in batches
- **Final** (`"on": "final"`): Single callback on completion. Fetch full results via `ed.core.getRunOutputs({ run_uid })`

## Decision Guide

| Scenario | Mode | Why |
|---|---|---|
| Single record, user-triggered | Live | Immediate response, 2-6s latency |
| Batch of 2+ inputs | Async | One request, auto-pagination, auto-retry on limits |
| Recurring pipeline (monitoring) | Schedule | CRON + `sync_mode: "incremental"` for only-new-data |
| Large result set (1,000+) | Async | No cursor expiry, automatic pagination |
| n8n / Make / Zapier | Async | `callback.on: "final"` + poll outputs |

## Threshold Rule

| Item Count | Mode | Approach |
|---|---|---|
| 1 | Live | Single call |
| 2-15 | Live | Parallel calls (up to 14 concurrent) |
| 16+ | Async | One batch request with all inputs |
