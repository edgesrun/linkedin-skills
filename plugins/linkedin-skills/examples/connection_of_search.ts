/**
 * Search someone's LinkedIn connections via Sales Navigator ConnectionOf filter.
 *
 * Usage:
 *   npx tsx examples/connection_of_search.ts "https://www.linkedin.com/in/someone" --identity-id UUID
 *   npx tsx examples/connection_of_search.ts "https://www.linkedin.com/in/someone" --identity-id UUID --output results.json
 */
import { writeFileSync } from 'node:fs';
import { Edges } from '@edgesrun/sdk';

function buildConnectionOfUrl(snProfileId: string): string {
  // CONNECTION_OF needs ONLY id + selectionType. Do NOT include text (name).
  return (
    'https://www.linkedin.com/sales/search/people?' +
    'query=(recentSearchParam%3A(doLogHistory%3Atrue)' +
    '%2Cfilters%3AList(' +
    '(type%3ACONNECTION_OF%2Cvalues%3AList(' +
    `(id%3A${snProfileId}%2CselectionType%3AINCLUDED)` +
    '))))'
  );
}

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let identityId = '';
  let output = '';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--identity-id') identityId = argv[++i] ?? '';
    else if (a === '--output' || a === '-o') output = argv[++i] ?? '';
    else positional.push(a);
  }
  return { profileUrl: positional[0], identityId, output };
}

async function paginateSearch(
  ed: Edges,
  searchUrl: string,
  identityId: string,
) {
  const all: any[] = [];
  let cursor: string | undefined;

  while (true) {
    const page = await ed.salesnavigator.searchPeople({
      identity_ids: [identityId],
      cursor,
      input: { sales_navigator_profile_search_url: searchUrl },
    });
    const batch = Array.isArray(page.data) ? page.data : [];
    all.push(...batch);
    console.error(`  Page results: ${batch.length} (total ${all.length})`);

    if (!page.nextPage) break;
    cursor = new URL(page.nextPage).searchParams.get('cursor') ?? undefined;
    if (!cursor) break;
    await new Promise((r) => setTimeout(r, 2000));
  }

  const seen = new Set<string>();
  const unique = all.filter((r) => {
    const pid = r?.sales_navigator_profile_id;
    if (!pid || seen.has(pid)) return false;
    seen.add(pid);
    return true;
  });

  return { results: unique, metadata: { total_raw: all.length, unique: unique.length } };
}

async function main() {
  const { profileUrl, identityId, output } = parseArgs(process.argv.slice(2));
  if (!profileUrl || !identityId) {
    console.error(
      'Usage: npx tsx examples/connection_of_search.ts <profile_url> --identity-id UUID [--output file.json]',
    );
    process.exit(1);
  }

  const apiKey = process.env.EDGES_API_KEY;
  if (!apiKey) {
    console.error('EDGES_API_KEY is required');
    process.exit(1);
  }

  const ed = new Edges({ apiKey });

  console.error('Step 1: Extracting Sales Navigator profile ID');
  const extracted = await ed.linkedin.extractPeople({
    identity_mode: 'managed',
    input: { linkedin_profile_url: profileUrl },
    parameters: { highlights: true },
  });
  const target = Array.isArray(extracted.data) ? extracted.data[0] : extracted.data;
  const snId = target?.sales_navigator_profile_id;
  if (!snId) {
    console.error('No sales_navigator_profile_id found for this profile');
    process.exit(1);
  }
  console.error(`  Target: ${target?.full_name ?? 'Unknown'} (SN ID: ${snId})`);

  const searchUrl = buildConnectionOfUrl(snId);
  console.error('Step 2: Built ConnectionOf search URL');
  console.error('Step 3: Paginating results...');

  const { results, metadata } = await paginateSearch(ed, searchUrl, identityId);
  const payload = { target, connections: results, metadata };

  if (output) {
    writeFileSync(output, JSON.stringify(payload, null, 2));
    console.error(`Wrote ${results.length} connections to ${output}`);
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
