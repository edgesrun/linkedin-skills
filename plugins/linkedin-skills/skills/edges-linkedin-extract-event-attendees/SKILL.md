---
name: edges-linkedin-extract-event-attendees
description: >-
  Extract attendees registered for a LinkedIn event via the Edges API. Use this skill when the user wants to get a list of people attending a LinkedIn event, build an attendee list, or prospect from event registrations. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-event-attendees/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-event-attendees/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-event-attendees/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_event_url`** (required, string, URI) — LinkedIn event URL.
Must match: `/(?:http(?:s)?:\/\/){1}(?:(?:www|\w{2})\.)?linkedin\.com\/(?:events\/[\d\w%-]+|video\/event\/urn:li:ugcPost:\d+)/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 10 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinExtractEventAttendeesOutput)
- `company_name` (string)
- `linkedin_event_url` (URI)
- `first_name`, `last_name`, `full_name` (string)
- `linkedin_profile_handle` (string)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)
- `job_title` (string)
- `linkedin_profile_url` (URI)
- `headline` (string)
- `location` (string)
- `profile_image_url` (URI)
- `connection_degree` (string)
- `current_title` (string)
- `shared_connection_search_url` (URI)
- `number_shared_connections` (integer)
- `shared_connection_profile_urls` (array of strings)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractEventAttendees({
  identity_mode: "managed",
  input: {
    linkedin_event_url: "https://www.linkedin.com/events/1234567890123456789"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractEventAttendeesAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_event_url: "https://www.linkedin.com/events/1234567890123456789"
    },
    {
      linkedin_event_url: "https://www.linkedin.com/events/9876543210987654321"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-event`** — Get event details first.
- **`edges-linkedin-extract-people`** — Enrich individual attendees with full profile data.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `full_name` | string | Attendee's display name |
| `linkedin_profile_url` | URI | Profile URL |
| `linkedin_profile_id` | integer | Immutable profile ID |
| `job_title` | string | Current job title |
| `headline` | string | Profile headline |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
