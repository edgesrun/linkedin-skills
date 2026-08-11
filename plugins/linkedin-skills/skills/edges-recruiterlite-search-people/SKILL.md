---
name: edges-recruiterlite-search-people
description: >-
  Search people via LinkedIn Recruiter Lite via the Edges API. Use this skill when the user specifically wants to use Recruiter Lite search. For general people search, prefer edges-salesnavigator-search-people which has broader access and richer data. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/recruiterlite-search-people/run/live` — synchronous (single input)
- `POST /actions/recruiterlite-search-people/run/async` — asynchronous (batch inputs)
- `POST /actions/recruiterlite-search-people/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_recruiter_search_url`** (required, string) — A LinkedIn Recruiter Search URL should start with 'https://www.linkedin.com/talent/hire/{id}/discover/recruiterSearch' or 'https://www.linkedin.com/talent/search'
Must match: `/(?:http(?:s)?:\/\/)(?:(?:www|\w{2})\.)?linkedin\.com\/talent\/(?:hire\/\d+\/discover\/recruiterSearch|search)/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 25 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (RecruiterliteSearchPeopleOutput)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_url` (string (uri))
- `linkedin_profile_id` (number)
- `headline` (string)
- `first_name` (string)
- `last_name` (string)
- `full_name` (string)
- `industry` (string)
- `connection_degree` (string)
- `profile_image_url` (string (uri))
- `job_seeker` (boolean)
- `location` (string)
- `educations` (array)
- `experiences` (array)
- `linkedin_people_post_search_url` (string (uri))
- `company_name` (string)
- `job_title` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.recruiterlite.searchPeople({
  identity_mode: "managed",
  input: {
    linkedin_recruiter_search_url: "https://www.linkedin.com/in/someone"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.recruiterlite.searchPeopleAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_recruiter_search_url: "URL_1"
    },
    {
      linkedin_recruiter_search_url: "URL_2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-search-people`** — Standard LinkedIn people search (different filter set).
- **`edges-salesnavigator-search-people`** — Sales Navigator people search (different filter set).

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Candidate display name |
| `headline` | string | Profile headline |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | number | Immutable profile ID |
| `job_title` | string | Current job title |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
