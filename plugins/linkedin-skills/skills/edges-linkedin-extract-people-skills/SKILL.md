---
name: edges-linkedin-extract-people-skills
description: >-
  Extract the full skills list with endorsement counts from a LinkedIn profile via the
  Edges API. This skill should be used when the user wants all skills for a person,
  needs endorsement data, or wants to analyze someone's technical competencies.
  Cookieless (managed mode). Note: linkedin-extract-people with skills: true only
  returns 1-2 main skills — use this skill for the complete list.
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-people-skills/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-people-skills/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-people-skills/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field (one of)
**`linkedin_profile_url`** (string, URI) — LinkedIn profile URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:in|pub|sales\/people|sales\/lead)\/[^\s/]+/`

OR

**`sales_navigator_profile_id`** (string) — Sales Navigator profile ID.
Must match: `/^AC[o-rw-z][\w-]+/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 20 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractPeopleSkillsOutput)
- `linkedin_profile_id` (number)
- `sales_navigator_profile_id` (string)
- `skills` (array of `{name: string}`)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPeopleSkills({
  identity_mode: "managed",
  input: {
    linkedin_profile_url: "https://www.linkedin.com/in/someone"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractPeopleSkillsAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_profile_url: "https://www.linkedin.com/in/someone1"
    },
    {
      linkedin_profile_url: "https://www.linkedin.com/in/someone2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-people`** — Returns 1-2 main skills only. Use this skill for the complete skills list.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `skills` | array | Array of skill objects with name and endorsement count |
| `linkedin_profile_id` | number | Immutable LinkedIn profile ID |
| `sales_navigator_profile_id` | string | Immutable SN profile ID |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
