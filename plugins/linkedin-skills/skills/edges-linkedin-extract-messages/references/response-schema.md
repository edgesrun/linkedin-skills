# Extract Messages — Full Response Schema

| Field | Type | Description |
|---|---|---|
| `linkedin_thread_id` | string | Conversation thread ID |
| `position` | integer | Message position within the thread (chronological order) |
| `delivered_at` | datetime | When the message was delivered |
| `created_at` | datetime | When the message was created |
| `first_name` | string | Sender's first name |
| `last_name` | string | Sender's last name |
| `linkedin_profile_id` | integer | Sender's immutable LinkedIn profile ID |
| `sales_navigator_profile_id` | string | Sender's immutable SN profile ID |
| `job_title` | string | Sender's job title |
| `content` | string | Message text content |
| `message_id` | string | Unique message identifier |
| `attachments` | array | File attachments included with the message |
