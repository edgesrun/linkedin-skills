---
name: edges-linkedin-invite-event
description: >-
  Invite someone to a LinkedIn event via the Edges API. Use this skill when the user wants to send event invitations on LinkedIn. Requires a connected identity (direct mode).
license: Apache-2.0
---

## Endpoint
- `POST /actions/linkedin-invite-event/run/live` — synchronous (single input)
- `POST /actions/linkedin-invite-event/run/async` — asynchronous (batch inputs)
- `POST /actions/linkedin-invite-event/run/schedule` — scheduled

## Authentication
Authenticate with `EDGES_API_KEY` via the TypeScript SDK (`new Edges({ apiKey: process.env.EDGES_API_KEY! })`).

## Input Field
**`linkedin_event_url`** (required, string, uri) — A LinkedIn Event URL should start with 'https://www.linkedin.com/video/event' or 'https://www.linkedin.com/events'"
Must match: `/^https:\/\/(?:(www|[a-z]{2})\.)?linkedin\.com\/(?:events\/[\d\w%-]+|video\/event\/urn:li:ugcPost:\d+)/`


Optional: `custom_data` (object) — Custom metadata to pass through.

## Output Schema (LinkedinInviteEventOutput)
- `sales_navigator_profile_id` (string)
- `linkedin_profile_id` (integer)
- `linkedin_event_url` (string (uri))

## Live Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.inviteEvent({
  identity_ids: ["your-identity-uuid"],
  input: {
    linkedin_event_url: "https://www.linkedin.com/events/1234567890"
  }
});
console.log(data);
```

## Async Mode Example
```typescript
import { Edges } from '@edgesrun/sdk';

const ed = new Edges({ apiKey: process.env.EDGES_API_KEY! });

const { data } = await ed.linkedin.inviteEventAsync({
  identity_ids: ["your-identity-uuid"],
  inputs: [
    {
      linkedin_event_url: "URL_1"
    },
    {
      linkedin_event_url: "URL_2"
    }
  ]
});
console.log(data);
```

## Error Codes
- **400**: Bad parameters, invalid cursor, account rotation issues
- **402**: No access (billing)
- **422**: Action aborted
- **424**: Integration error, not found (404), no results, parsing error
- **429**: Rate limited (check `retry_after`)
