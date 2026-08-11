# LinkedIn Skills by Edges

> 76 curated Agent Skills for the Edges API — covering the main LinkedIn & Sales Navigator actions for search, signals, and outreach.

Plug into Claude Code, Cursor, GitHub Copilot, Gemini CLI, Windsurf, and [30+ other AI tools](https://agentskills.io). Cookieless by default (no LinkedIn account required). One install, then talk to your agent.

---

## Install

### Claude Code

```
/plugin marketplace add edgesrun/linkedin-skills
/plugin install linkedin-skills@edges-linkedin-skills
```

Claude Code prompts for your Edges API key on first use and stores it securely. To verify, run `/plugin list` — you should see `linkedin-skills` installed.

### Cursor and other Agent Skills–compatible tools

Copy or symlink `plugins/linkedin-skills/skills/` into your tool’s skills directory (for example project `.agents/skills/`, or your client-specific path), then:

```bash
export EDGES_API_KEY=your_key   # https://app.edges.run
```

### Agent Skills CLI

```bash
npx skills add edgesrun/linkedin-skills
```

### SDK / examples (optional)

```bash
cd plugins/linkedin-skills && npm install
```

Get an API key at [app.edges.run](https://app.edges.run), Developer Settings.

---

## Skill Reference

What you ask, and the skill that runs. Name a skill explicitly if you want direct control.

| If you ask for, this skill runs |
|---|
| **People** |
| "Look up / extract / enrich a LinkedIn profile" : `edges-linkedin-extract-people` |
| "Get full job history beyond the last 5 roles" : `edges-linkedin-extract-people-experiences` |
| "Get all skills / endorsements for a profile" : `edges-linkedin-extract-people-skills` |
| "Get education history for a profile" : `edges-linkedin-extract-people-educations` |
| "Get certifications and licenses" : `edges-linkedin-extract-licenses-certifications` |
| "Get the visible email or phone on a profile" : `edges-linkedin-extract-contact` |
| "Resolve a name to a LinkedIn URL" : `edges-linkedin-find-profile-url` |
| "Search LinkedIn for people" : `edges-linkedin-search-people` |
| "Search Sales Navigator for people (preferred)" : `edges-salesnavigator-search-people` |
| "Search RecruiterLite for talent" : `edges-recruiterlite-search-people` |
| **Companies** |
| "Get a LinkedIn company page (full data)" : `edges-linkedin-extract-company` |
| "Find a company's LinkedIn URL from name or domain" : `edges-linkedin-find-company-url` |
| "Search LinkedIn companies by filters" : `edges-linkedin-search-companies` |
| "Search Sales Navigator companies (preferred)" : `edges-salesnavigator-search-companies` |
| "Find similar companies" : `edges-linkedin-extract-similar-companies` |
| "Get parent / subsidiary / affiliate companies" : `edges-linkedin-extract-company-affiliates` |
| "Get headcount and growth signals" : `edges-linkedin-extract-company-employees-insights` |
| "Get total employee count from Sales Navigator" : `edges-salesnavigator-extract-employees-count` |
| "Get headcount distribution by function / geography" : `edges-salesnavigator-extract-employees-distribution` |
| "Find employees at a company (LinkedIn)" : `edges-linkedin-search-company-employees` |
| "Find employees at a company (preferred: SN)" : `edges-salesnavigator-search-company-employees` |
| **Content, posts, signals** |
| "Find LinkedIn posts about a topic / mentioning a keyword" : `edges-linkedin-search-content` |
| "Get a post's full data (author, engagement, comments)" : `edges-linkedin-extract-post` |
| "Who liked this post?" : `edges-linkedin-extract-post-likers` |
| "Who commented on this post?" : `edges-linkedin-extract-post-commenters` |
| "Who reposted this article?" : `edges-linkedin-extract-post-reposters` |
| "Posts published by this profile" : `edges-linkedin-extract-people-post-activity` |
| "Posts this profile commented on" : `edges-linkedin-extract-people-comment-activity` |
| "Posts this profile reacted to" : `edges-linkedin-extract-people-reaction-activity` |
| **Events, jobs, schools, groups** |
| "Get a LinkedIn event's details" : `edges-linkedin-extract-event` |
| "Get attendees of a LinkedIn event" : `edges-linkedin-extract-event-attendees` |
| "Search LinkedIn events" : `edges-linkedin-search-events` |
| "Get a LinkedIn job posting" : `edges-linkedin-extract-job` |
| "Search LinkedIn jobs" : `edges-linkedin-search-jobs` |
| "Search LinkedIn schools" : `edges-linkedin-search-schools` |
| "Get school alumni" : `edges-linkedin-extract-school-alumnis` |
| "Search LinkedIn groups" : `edges-linkedin-search-groups` |
| "Get group members" : `edges-linkedin-extract-group-members` |
| **Outreach (requires identity)** |
| "Send a connection request" : `edges-linkedin-connect-profile` |
| "Send a connection via Sales Navigator" : `edges-salesnavigator-connect-profile` |
| "Send a direct message to a 1st-degree connection" : `edges-linkedin-message-profile` |
| "Send an InMail" : `edges-linkedin-inmail-profile` or `edges-salesnavigator-inmail-profile` |
| "Visit a profile (warm-up signal)" : `edges-linkedin-visit-profile` or `edges-salesnavigator-visit-profile` |
| "Visit a company page" : `edges-linkedin-visit-company` or `edges-salesnavigator-visit-company` |
| "Like a post" : `edges-linkedin-like-post` |
| "Comment on a post" : `edges-linkedin-comment-post` |
| "Follow a profile" : `edges-linkedin-follow-profile` |
| "Invite to a LinkedIn event" : `edges-linkedin-invite-event` |
| **Network management (requires identity)** |
| "Get my LinkedIn connections" : `edges-linkedin-extract-connections` |
| "Get my followers" : `edges-linkedin-extract-followers` |
| "Get followers of a company page" : `edges-linkedin-extract-page-followers` |
| "Read my conversations / threads" : `edges-linkedin-extract-conversations` |
| "Read messages in a thread" : `edges-linkedin-extract-messages` |
| "See sent invitations" : `edges-linkedin-extract-sent-invitations` |
| "See received invitations" : `edges-linkedin-extract-received-invitations` |
| "Accept invitations (one or batch)" : `edges-linkedin-accept-invitation`, `edges-linkedin-accept-invitations` |
| "Withdraw invitations (one or batch)" : `edges-linkedin-withdraw-invitation`, `edges-linkedin-withdraw-invitations` |
| "Get who viewed my profile" : `edges-linkedin-extract-profile-viewers` |
| **Sales Navigator lists** |
| "Get my saved Sales Navigator account lists" : `edges-salesnavigator-extract-accounts-list` |
| "Get my saved Sales Navigator lead lists" : `edges-salesnavigator-extract-leads-list` |
| "List Sales Navigator saved searches (companies)" : `edges-salesnavigator-search-saved-companies` |
| "List Sales Navigator saved searches (people)" : `edges-salesnavigator-search-saved-people` |
| "Check Sales Navigator search count before extracting" : `edges-salesnavigator-search-metrics` |
| **Workspace** |
| "Show my Edges workspace and quota" : `edges-get-workspace`, `edges-get-workspace-consumption` |
| "List the LinkedIn identities I've connected" : `edges-list-identities` |

---

## Skill Categories

| Category | Count | Headline skills |
|----------|------:|------------|
| People extraction | 7 | extract-people, extract-experiences, extract-skills, extract-contact |
| Company extraction | 5 | extract-company, extract-employees-insights, extract-affiliates |
| Content / signals | 8 | extract-post, extract-post-likers, extract-post-commenters, search-content |
| Search (LinkedIn) | 8 | search-people, search-companies, search-company-employees, search-jobs |
| Events / jobs / schools / groups | 5 | extract-event, extract-job, extract-school-alumnis, extract-group-members |
| Sales Navigator | 10 | sn-search-people, sn-search-companies, sn-extract-leads-list |
| Outreach | 13 | connect-profile, message-profile, visit-profile, inmail-profile |
| Network | 12 | extract-connections, extract-followers, accept / withdraw invitations |
| Workspace | 3 | get-workspace, get-workspace-consumption, list-identities |
| Composite | 5 | getting-started, url-construction, outreach-sequence |

---

## Composite Skills

Five skills bundle full workflows so your agent gets it right the first time:

- `edges-getting-started` : setup, first call, key concepts.
- `edges-url-construction` : ConnectionOf, new hires, boolean search, all the URL formulas Sales Navigator uses.
- `edges-identity-guide` : managed vs direct vs auto vs engagement modes, decision table.
- `edges-outreach-sequence` : visit, connect, message with timing, dedup, and safety.
- `edges-error-handling` : retry logic, error classification, LIMIT_REACHED handling.

---

## Ready-to-Run Examples

All scripts live under `plugins/linkedin-skills/` and use `@edgesrun/sdk`. Run from there:

```bash
cd plugins/linkedin-skills
npm install

# Resolve a name to a verified LinkedIn profile
npx tsx examples/identity_resolution.ts "Satya Nadella" "Microsoft"

# Research a company end-to-end from its domain
npx tsx examples/account_research.ts "stripe.com" --output report.json

# Search someone's LinkedIn connections via Sales Navigator
npx tsx examples/connection_of_search.ts "https://www.linkedin.com/in/someone" --identity-id UUID
```

### Per-skill scripts for heavy operations

```bash
cd plugins/linkedin-skills

# Paginate a Sales Navigator search across all pages with cursor + dedup
npx tsx skills/edges-salesnavigator-search-people/scripts/paginate.ts "<search_url>"

# Safe connection request with pre-checks and timing
npx tsx skills/edges-linkedin-connect-profile/scripts/safe_connect.ts "<profile_url>" --identity-id UUID
```

---

## Key Concepts

| Concept | Rule |
|---------|------|
| **Live vs Async** | Live: `"input"` (singular). Async: `"inputs"` (plural). Wrong one returns 400. |
| **Identity mode** | Default `"managed"` (cookieless). Use `"identity_ids"` for outreach and messaging. |
| **Pagination** | Follow the `X-Pagination-Next` response header. Never append `&page=N`. |
| **Sales Navigator preferred** | Use SN actions over standard LinkedIn equivalents: richer data, cookieless. |
| **Auth** | Header `X-API-Key`. Never `Authorization: Bearer`. |
| **Immutable IDs** | Always store `linkedin_profile_id` and `sales_navigator_profile_id`. URL slugs change; IDs do not. |

---

## What You Can Ask Your Agent To Do

Once installed, just describe the outcome. The right skills trigger automatically.

### Find people and companies

> "Find the head of growth at Stripe and give me their LinkedIn URL."
> "Look up Satya Nadella on LinkedIn and pull his current role, location, and last 5 positions."
> "Get me the LinkedIn page of OpenAI and tell me their employee count, industry, HQ."
> "Search for Series B fintech companies in Europe with 50 to 200 employees."
> "Find every VP of Engineering at YC W24 companies."

### Build lead lists from Sales Navigator

> "Use Sales Navigator to find founders of dev tools startups in San Francisco hiring engineers."
> "Pull every employee at Anthropic with a Sales Navigator search."
> "Find leads matching this Sales Navigator URL and paginate through all results: <url>."
> "Search Sales Navigator for AEs at Snowflake who changed jobs in the last 3 months."
> "Give me the count of decision-makers at Series A SaaS companies in Berlin before I run the full extract."

### Mine engagement signals and monitor activity

> "Who liked this LinkedIn post? Give me names plus profile URLs: <post-url>."
> "Show me everyone who commented on Sam Altman's last 10 posts."
> "Find LinkedIn posts mentioning 'Edges API' in the last 30 days."
> "Get the last 20 posts published by this profile and summarize the themes: <profile-url>."
> "Who are the top engagers on our company page in the last quarter?"
> "Track new followers on our LinkedIn page and tell me which ones are ICP."

### Source from posts, events, jobs, schools

> "Pull the attendee list from this LinkedIn event: <event-url>."
> "Find people who reposted this article and might be interested in our product: <post-url>."
> "Get all alumni from Stanford CS who now work in AI startups."
> "Extract the full job description and apply URL from this LinkedIn job: <job-url>."

### Run outreach (visit, connect, message, InMail)

> "Visit these 50 profiles to warm them up before I send connection requests."
> "Send a connection request with this note to the CMO of Linear: <note>."
> "Message everyone in my 1st-degree network who works at a Series A company."
> "Send an InMail to this Sales Navigator profile with subject and body: <...>."
> "Run a visit, connect, message sequence for this list with safe timing."

### Network management

> "Pull my full LinkedIn connections list."
> "Show me all my pending sent invitations older than 14 days and withdraw the cold ones."
> "Accept all incoming invitations from people at companies in this list."
> "Get my recent LinkedIn messages and summarize who is waiting on a reply."

### Account research workflows

> "Research stripe.com end to end: company profile, key decision-makers, recent posts, hiring signals."
> "For this list of target accounts, find the first-degree connections who might introduce me."
> "Build me a one-pager on this company from its LinkedIn page and last 30 days of posts: <url>."

---

## Links

- [Edges Documentation](https://docs.edges.run)
- [API Reference](https://docs.edges.run/v1/api/introduction)
- [TypeScript SDK on npm](https://www.npmjs.com/package/@edgesrun/sdk)
- [Agent Skills Standard](https://agentskills.io)
- [Get an API key](https://app.edges.run)
