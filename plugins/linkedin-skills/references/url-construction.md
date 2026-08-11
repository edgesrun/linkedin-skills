# URL Construction Patterns

Most Edges actions take a LinkedIn or Sales Navigator URL as input. Construct these URLs programmatically to enable advanced use cases like ConnectionOf searches, new hire monitoring, and boolean prospecting.

## Key ID Types

| ID Type | Format | Used For |
|---|---|---|
| `sales_navigator_profile_id` | Alphanumeric (e.g., `ACoAAAHbyNkB7r9-...`) | Person-centric filters: CONNECTION_OF, VIEWED_BY |
| `company_profile_id` / `linkedin_company_id` | Numeric (e.g., `783611`) | Company-centric filters: CURRENT_COMPANY, PAST_COMPANY |
| `linkedin_profile_handle` | Slug after `/in/` (e.g., `marcfrancis`) | Direct profile URLs (mutable — do not rely on for storage) |

**Critical rules:**
- `sales_navigator_profile_id` is for **people**. `company_profile_id` is for **companies**. Never mix them.
- Company filters use URN format: `urn%253Ali%253Aorganization%253A{company_profile_id}`
- Always store `linkedin_profile_id` and `sales_navigator_profile_id` — handles are mutable.

## Encoding Rules

| Platform | Space | Double Quote |
|---|---|---|
| Standard LinkedIn | `%20` | `%22` |
| Sales Navigator | `%2520` | `%2522` |

Edges normalizes returned URLs to use `%20`. Both `%20` and `%2520` work as input to SN actions.

---

## Pattern 1: Find Person by Name + Company

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

**Keyword narrowing trick:** Searching "John Smith" returns 500+ results. Searching `"John Smith" AND "developer"` returns 3. Add context (role, industry, skills) to narrow results.

---

## Pattern 2: ConnectionOf — Extract a Person's Network

**Requires:** `sales_navigator_profile_id` — get it by running `linkedin-extract-people` on the person first.

### Standard LinkedIn

Pass to `linkedin-search-people`:

```
https://www.linkedin.com/search/results/people/?connectionOf=%22{sales_navigator_profile_id}%22&origin=FACETED_SEARCH
```

### Sales Navigator

Pass to `salesnavigator-search-people`:

```
https://www.linkedin.com/sales/search/people?query=(recentSearchParam%3A(doLogHistory%3Atrue)%2Cfilters%3AList((type%3ACONNECTION_OF%2Cvalues%3AList((id%3A{sn_profile_id}%2CselectionType%3AINCLUDED)))))
```

**Important:** CONNECTION_OF filter needs ONLY `id` and `selectionType`. Do NOT include `text` (name).

### Adding Keywords to ConnectionOf

Append `%2Ckeywords%3A{EXPRESSION}` before the closing `)`:
- Single keyword: `marketing`
- OR: `AI%2520OR%2520Data`
- AND: `marketing%2520AND%2520Growth`
- Quoted OR: `%2522sales%2522%2520OR%2520%2522revenue%2522`

### Adding Title Filter to ConnectionOf

Add to the `filters%3AList`:

```
(type%3ACURRENT_TITLE%2Cvalues%3AList((text%3ACEO%2520OR%2520Founder%2CselectionType%3AINCLUDED)))
```

### Adding PAST_COMPANY Filter to ConnectionOf

Add to the `filters%3AList`:

```
(type%3APAST_COMPANY%2Cvalues%3AList((id%3Aurn%253Ali%253Aorganization%253A{company_id}%2CselectionType%3AINCLUDED)))
```

### Adding CURRENT_COMPANY Filter

Same pattern with `CURRENT_COMPANY`:

```
(type%3ACURRENT_COMPANY%2Cvalues%3AList((id%3Aurn%253Ali%253Aorganization%253A{company_id}%2CselectionType%3AINCLUDED)))
```

### Combined Example: CONNECTION_OF + PAST_COMPANY

```
https://www.linkedin.com/sales/search/people?query=(filters%3AList((type%3ACONNECTION_OF%2Cvalues%3AList((id%3A{sn_profile_id}%2CselectionType%3AINCLUDED))),(type%3APAST_COMPANY%2Cvalues%3AList((id%3Aurn%253Ali%253Aorganization%253A{company_id}%2CselectionType%3AINCLUDED)))))
```

---

## Pattern 3: New Hires at a Company

**Requires:** `company_profile_id` (numeric) — get it from `linkedin-extract-company` response.

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

Keep under 100 companies per URL.

---

## Pattern 4: Title + Keyword Boolean Search

Pass to `salesnavigator-search-people`:

```
https://www.linkedin.com/sales/search/people?query=(spellCorrectionEnabled%3Atrue%2Cfilters%3AList((type%3ACURRENT_TITLE%2Cvalues%3AList((text%3A%22{Title_1}%22%20OR%20%22{Title_2}%22%2CselectionType%3AINCLUDED))))%2Ckeywords%3A%22{Keyword_1}%22%20OR%20%22{Keyword_2}%22)&viewAllFilters=true
```

**Example:**
```
...text%3A%22Software Engineer%22%20OR%20%22Product Engineer%22...keywords%3A%22python%22%20OR%20%22Node JS%22...
```

---

## Pattern 5: Jobs by Region (Hiring Intent)

Pass to `linkedin-search-jobs` (input field: `linkedin_job_search_url`):

```
https://www.linkedin.com/jobs/search/?f_C={company_id}&geoId={region_id}
```

Common geo IDs:
- US: `103644278`
- EMEA: `91000007`

---

## Pattern 6: Company Content Feed

Pass to `linkedin-search-content` (input field: `linkedin_content_search_url`):

**Posts FROM the company:**
```
https://www.linkedin.com/search/results/content/?fromOrganization={company_id}
```

**Posts MENTIONING the company:**
```
https://www.linkedin.com/search/results/content/?mentionsOrganization={company_id}
```

---

## Quick Reference: Action to Input Field

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
