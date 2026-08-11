---
name: edges-linkedin-search-events
description: >-
  Search for events on LinkedIn via the Edges API. This skill should be used when the
  user wants to find LinkedIn events by keyword, discover upcoming events, or search
  for events in a specific industry. Cookieless (managed mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-search-events/run/live` — synchronous (single input)
- `POST /actions/linkedin-search-events/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-search-events/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_event_search_url`** (required, string, uri) — A LinkedIn Event Search URL should start with 'https://www.linkedin.com/search/results/events'
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/search\/results\/(events|EVENTS)\/\?\S+/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Pagination
- `page_size`: 10 (fixed)
- `cursor`: string (from `X-Pagination-Next` header, expires after 24h)

## Output Schema (LinkedinSearchEventsOutput)
- `event_name` (string)
- `description` (string)
- `date` (string)
- `location` (string)
- `linkedin_event_url` (string (uri))
- `attendees` (string)
- `linkedin_event_id` (string)

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchEvents({
  identity_mode: "managed",
  input: {
    linkedin_event_search_url: "https://www.linkedin.com/events/1234567890"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.searchEventsAsync({
  identity_mode: "managed",
  inputs: [
    {
      linkedin_event_search_url: "URL_1"
    },
    {
      linkedin_event_search_url: "URL_2"
    }
  ]
});
console.log(data);
```

## Related Skills
- **`edges-linkedin-extract-event`** — Extract full details from a found event.
- **`edges-linkedin-extract-event-attendees`** — Get attendees of a found event.

## Response (key fields)

| Field | Type | Description |
|---|---|---|
| `event_name` | string | Event title |
| `linkedin_event_url` | URI | Event URL |
| `linkedin_event_id` | string | Event ID |
| `description` | string | Event description |
| `attendees` | string | Attendee count |

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
