---
name: edges-linkedin-extract-event
description: >-
  Extract LinkedIn event details via the Edges API. This skill should be used when the
  user wants to get event information, see event description, organizer, date, or
  attendee count from a LinkedIn event URL. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-extract-event/run/live` — synchronous (single input)
- `POST /actions/linkedin-extract-event/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-extract-event/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_event_url`** (required, string, URI) — LinkedIn event URL.
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:events\/[\d\w%-]+|video\/event\/urn:li:ugcPost:\d+)/`

Optional: `custom_data` (object) — Custom metadata to pass through.

## Output Schema (LinkedinExtractEventOutput)
- `event_name` (string)
- `event_information` (string)
- `linkedin_event_id` (string)
- `linkedin_event_url` (URI)
- `event_external_link` (URI)
- `created_at` (date-time)
- `number_attendees` (string)
- `event_start_datetime`, `event_end_datetime` (string)
- `company_name` (string)
- `linkedin_company_id` (string)
- `linkedin_company_url` (URI)
- `first_name`, `last_name`, `full_name` (string)
- `speakers` (array of objects: `first_name`, `last_name`, `full_name`, `linkedin_profile_url`)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.extractEvent({
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

const { data } = await ed.linkedin.extractEventAsync({
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
- **`edges-linkedin-extract-event-attendees`** — Get the list of people registered for the event.
- **`edges-linkedin-search-events`** — Search for events by keyword.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `event_name` | string | Event title |
| `linkedin_event_url` | URI | Event URL |
| `linkedin_event_id` | string | Event ID |
| `number_attendees` | string | Registered attendee count |
| `company_name` | string | Organizing company |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
