---
name: edges-linkedin-extract-licenses-certifications
description: >-
  Extract licenses and certifications from a LinkedIn profile via the Edges API.
  This skill should be used when the user wants to get someone's professional
  certifications, credentials, licenses, or accreditations listed on their LinkedIn
  profile. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-licenses-certifications/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-licenses-certifications/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-licenses-certifications/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_profile_url`** (required, string, URI) — LinkedIn profile URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/in\/[-\w\d%]+/gi`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 20 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractLicensesCertificationsOutput)
- `credential_id` (string)
- `linkedin_profile_url` (URI)
- `linkedin_profile_id` (integer)
- `company_name` (string — issuing organization)
- `original_linkedin_company_url` (URI)
- `external_certificate_link` (URI)
- `issued_date` (date)
- `expiration_date` (date)
- `title` (string — credential name)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractLicensesCertifications({
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

const { data } = await ed.linkedin.extractLicensesCertificationsAsync({
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
- **`edges-linkedin-extract-people`** — Full profile extraction — use this skill for dedicated certification data.
- **`edges-linkedin-extract-people-educations`** — Education history for the same person.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `title` | string | Credential name |
| `company_name` | string | Issuing organization |
| `credential_id` | string | Credential ID |
| `issued_date` | date | Date issued |
| `expiration_date` | date | Expiration date (if applicable) |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
