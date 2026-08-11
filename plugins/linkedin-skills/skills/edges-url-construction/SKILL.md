---
name: edges-url-construction
description: >-
  Construct LinkedIn and Sales Navigator search URLs for the Edges API. This skill should be
  used when the user needs to build a search URL, create a ConnectionOf search, find new hires
  at a company, build a boolean title or keyword search, search jobs by region, monitor company
  content, or construct any Sales Navigator filter URL. Also use when the user mentions URL
  encoding for LinkedIn or Sales Navigator.
license: Apache-2.0
---

# URL Construction for Edges

Most Edges search actions take a LinkedIn or Sales Navigator URL as input. Constructing these URLs programmatically unlocks advanced workflows — ConnectionOf prospecting, new hire monitoring, boolean title searches, and more.

## Decision Table

| I want to... | Pattern | Pass URL to |
|---|---|---|
| Find a person by name + company | Pattern 1 | `linkedin-search-people` or `salesnavigator-search-people` |
| Browse someone's connections | Pattern 2 (ConnectionOf) | `salesnavigator-search-people` |
| Find new hires at a company | Pattern 3 | `salesnavigator-search-people` |
| Search by job title + keywords | Pattern 4 | `salesnavigator-search-people` |
| Find job openings by region | Pattern 5 | `linkedin-search-jobs` |
| Monitor company content | Pattern 6 | `linkedin-search-content` |

## Key ID Types

Three identifiers appear in URL construction. Using the wrong one breaks the URL silently.

| ID | Format | Used For |
|---|---|---|
| `sales_navigator_profile_id` | Alphanumeric, starts `ACo`/`ACw`/`ACr` | **People** filters: CONNECTION_OF, VIEWED_BY |
| `linkedin_company_id` | Numeric (e.g., `783611`) | **Company** filters: CURRENT_COMPANY, PAST_COMPANY |
| `linkedin_profile_handle` | Slug after `/in/` | Direct profile URLs only (mutable — never store as primary key) |

**Critical:** People IDs and company IDs are NOT interchangeable. Company filters require the URN format: `urn%253Ali%253Aorganization%253A{company_id}`.

## Encoding Rules

Sales Navigator uses double-URL-encoding. Standard LinkedIn uses single encoding. Getting this wrong produces zero results instead of an error — a silent failure.

| Platform | Space | Double Quote | Boolean OR |
|---|---|---|---|
| Standard LinkedIn | `%20` | `%22` | `%20OR%20` |
| Sales Navigator | `%2520` | `%2522` | `%2520OR%2520` |

Edges normalizes returned URLs to `%20`. Both `%20` and `%2520` work as input — but be consistent within a single URL.

---

## Pattern 1: Find Person by Name + Company

**Use case:** Identity resolution — resolve a name from a CRM, event list, or Slack community to a LinkedIn profile.

### Standard LinkedIn

Pass to `linkedin-search-people` (input field: `linkedin_people_search_url`):

```
https://www.linkedin.com/search/results/people/?keywords=%22{Full_Name}%22%20AND%20%22{Company_Name}%22&origin=SWITCH_SEARCH_VERTICAL
```

### Sales Navigator (Higher Precision)

Pass to `salesnavigator-search-people` (input field: `sales_navigator_profile_search_url`):

```
https://www.linkedin.com/sales/search/people?query=(recentSearchParam%3A(doLogHistory%3Atrue)%2CspellCorrectionEnabled%3Atrue%2Ckeywords%3A%2522{Full_Name}%2522%2520AND%2520%2522{Company_Name}%2522)&viewAllFilters=true
```

**Narrowing trick:** `"John Smith"` returns 500+ results. `"John Smith" AND "developer"` returns 3. Add a keyword from context (role, industry, skill) to narrow. Set `only_extract_unique_profile: true` in parameters — when exactly 1 result matches, Edges extracts the full profile inline.

---

## Pattern 2: ConnectionOf — Extract a Person's Network

**Use case:** Find who a person is connected to on LinkedIn. Combine with title, company, or keyword filters to find specific types of connections.

**Prerequisite:** Get the target's `sales_navigator_profile_id` by running `linkedin-extract-people` first.

### Base URL (Sales Navigator)

Pass to `salesnavigator-search-people`:

```
https://www.linkedin.com/sales/search/people?query=(recentSearchParam%3A(doLogHistory%3Atrue)%2Cfilters%3AList((type%3ACONNECTION_OF%2Cvalues%3AList((id%3A{sn_profile_id}%2CselectionType%3AINCLUDED)))))
```

**CONNECTION_OF needs ONLY `id` + `selectionType`.** Do NOT include `text` (the person's name) — it is unnecessary and can cause mismatches.

### Adding Keywords

Append `%2Ckeywords%3A{EXPRESSION}` before the final closing `)` of the query:

| Intent | Expression |
|---|---|
| Single keyword | `marketing` |
| OR search | `AI%2520OR%2520Data` |
| AND search | `marketing%2520AND%2520Growth` |
| Quoted OR | `%2522sales%2522%2520OR%2520%2522revenue%2522` |

### Adding Title Filter

Add another filter entry inside `filters%3AList`:

```
(type%3ACURRENT_TITLE%2Cvalues%3AList((text%3ACEO%2520OR%2520Founder%2CselectionType%3AINCLUDED)))
```

### Adding PAST_COMPANY Filter

```
(type%3APAST_COMPANY%2Cvalues%3AList((id%3Aurn%253Ali%253Aorganization%253A{company_id}%2CselectionType%3AINCLUDED)))
```

### Adding CURRENT_COMPANY Filter

```
(type%3ACURRENT_COMPANY%2Cvalues%3AList((id%3Aurn%253Ali%253Aorganization%253A{company_id}%2CselectionType%3AINCLUDED)))
```

### Combined Example: CONNECTION_OF + PAST_COMPANY

Find connections of a person who previously worked at a specific company:

```
https://www.linkedin.com/sales/search/people?query=(filters%3AList((type%3ACONNECTION_OF%2Cvalues%3AList((id%3A{sn_profile_id}%2CselectionType%3AINCLUDED))),(type%3APAST_COMPANY%2Cvalues%3AList((id%3Aurn%253Ali%253Aorganization%253A{company_id}%2CselectionType%3AINCLUDED)))))
```

Multiple filters are comma-separated entries inside `filters%3AList((...),(...))`.

---

## Pattern 3: New Hires at a Company

**Use case:** Monitor recently changed jobs at target accounts — a strong intent signal for outbound.

**Prerequisite:** Get the `linkedin_company_id` (numeric) from `linkedin-extract-company`.

### Single Company

Pass to `salesnavigator-search-people`:

```
https://www.linkedin.com/sales/search/people?query=(recentSearchParam%3A%2Cfilters%3AList((type%3ACURRENT_COMPANY%2Cvalues%3AList((id%3Aurn%253Ali%253Aorganization%253A{company_id}%2CselectionType%3AINCLUDED%2Cparent%3A)))%2C(type%3ARECENTLY_CHANGED_JOBS%2Cvalues%3AList((id%3ARPC%2CselectionType%3AINCLUDED)))))
```

### Batch Monitoring (Multiple Companies)

Inject additional company URNs into the same `values%3AList`:

```
(id%3Aurn%253Ali%253Aorganization%253A{id_1}%2CselectionType%3AINCLUDED%2Cparent%3A)%2C(id%3Aurn%253Ali%253Aorganization%253A{id_2}%2CselectionType%3AINCLUDED%2Cparent%3A)
```

Keep under 100 companies per URL. For recurring monitoring, use schedule mode with `sync_mode: "incremental"` to receive only new hires since the last check.

---

## Pattern 4: Title + Keyword Boolean Search

**Use case:** Prospect by combining job titles with skill or domain keywords.

Pass to `salesnavigator-search-people`:

```
https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled%3Atrue%2Cfilters%3AList((type%3ACURRENT_TITLE%2Cvalues%3AList((text%3A%22{Title_1}%22%20OR%20%22{Title_2}%22%2CselectionType%3AINCLUDED))))%2Ckeywords%3A%22{Keyword_1}%22%20OR%20%22{Keyword_2}%22)&viewAllFilters=true
```

**Example — find Python or Node engineers with a product or platform title:**
```
...text%3A%22Software Engineer%22%20OR%20%22Product Engineer%22...keywords%3A%22python%22%20OR%20%22Node JS%22...
```

---

## Pattern 5: Jobs by Region (Hiring Intent)

**Use case:** Detect hiring activity at target companies filtered by geography.

Pass to `linkedin-search-jobs` (input field: `linkedin_job_search_url`):

```
https://www.linkedin.com/jobs/search/?f_C={company_id}&geoId={region_id}
```

| Region | Geo ID |
|---|---|
| United States | `103644278` |
| EMEA | `91000007` |

---

## Pattern 6: Company Content Feed

**Use case:** Monitor what a company is posting or what others say about it.

Pass to `linkedin-search-content` (input field: `linkedin_content_search_url`):

**Posts published BY the company:**
```
https://www.linkedin.com/search/results/content/?fromOrganization={company_id}
```

**Posts MENTIONING the company:**
```
https://www.linkedin.com/search/results/content/?mentionsOrganization={company_id}
```

---

## Action → Input Field Quick Reference

Each action expects a specific input field name. Using the wrong name returns a 400 error with no helpful message — this table prevents that.

| Action | Input Field |
|---|---|
| `linkedin-search-people` | `linkedin_people_search_url` |
| `salesnavigator-search-people` | `sales_navigator_profile_search_url` |
| `linkedin-search-companies` | `linkedin_company_search_url` |
| `linkedin-search-jobs` | `linkedin_job_search_url` |
| `linkedin-search-content` | `linkedin_content_search_url` |
| `linkedin-search-events` | `linkedin_event_search_url` |
| `linkedin-extract-people` | `linkedin_profile_url` |
| `linkedin-extract-company` | `linkedin_company_url` |

## Related Skills

- `edges-salesnavigator-search-people` — Execute an SN people search
- `edges-linkedin-search-people` — Execute a LinkedIn people search
- `edges-linkedin-search-content` — Search LinkedIn posts and articles
- `edges-linkedin-search-jobs` — Search job postings
- `edges-linkedin-extract-people` — Extract profile data (to get `sales_navigator_profile_id`)
- `edges-linkedin-extract-company` — Extract company data (to get `linkedin_company_id`)

For the full encoding reference and additional combined filter examples, see `the `edges-url-construction` skill`.
