/**
 * Paginate through all results of a Sales Navigator people search.
 *
 * Usage:
 *   npx tsx skills/edges-salesnavigator-search-people/scripts/paginate.ts "<search_url>"
 *   npx tsx skills/edges-salesnavigator-search-people/scripts/paginate.ts "<search_url>" --identity-id UUID --output results.json
 */
import { writeFileSync } from 'node:fs';
import { Edges } from '@edgesrun/sdk';

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let identityId = '';
  let identityMode: 'managed' | 'auto' = 'managed';
  let output = '';
  let dedupKey = 'sales_navigator_profile_id';
  let pageDelay = 2000;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--identity-id') identityId = argv[++i] ?? '';
    else if (a === '--identity-mode') identityMode = (argv[++i] as any) ?? 'managed';
    else if (a === '--output' || a === '-o') output = argv[++i] ?? '';
    else if (a === '--dedup-key') dedupKey = argv[++i] ?? dedupKey;
    else if (a === '--page-delay') pageDelay = Number(argv[++i] ?? 2) * 1000;
    else positional.push(a);
  }

  return { searchUrl: positional[0], identityId, identityMode, output, dedupKey, pageDelay };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.searchUrl?.startsWith('https://www.linkedin.com/sales/search/people')) {
    console.error(
      'Error: URL must start with https://www.linkedin.com/sales/search/people',
    );
    process.exit(1);
  }

  const apiKey = process.env.EDGES_API_KEY;
  if (!apiKey) {
    console.error('EDGES_API_KEY is required');
    process.exit(1);
  }

  const ed = new Edges({ apiKey });
  const all: any[] = [];
  let cursor: string | undefined;
  let pages = 0;

  while (true) {
    const page = await ed.salesnavigator.searchPeople({
      ...(args.identityId
        ? { identity_ids: [args.identityId] }
        : { identity_mode: args.identityMode }),
      cursor,
      input: { sales_navigator_profile_search_url: args.searchUrl },
    });

    const batch = Array.isArray(page.data) ? page.data : [];
    all.push(...batch);
    pages += 1;
    console.error(`[pagination] Page ${pages}: ${batch.length} results`);

    if (!page.nextPage) break;
    cursor = new URL(page.nextPage).searchParams.get('cursor') ?? undefined;
    if (!cursor) break;
    await new Promise((r) => setTimeout(r, args.pageDelay));
  }

  let results = all;
  if (args.dedupKey !== 'none') {
    const seen = new Set<string>();
    results = all.filter((r) => {
      const key = r?.[args.dedupKey];
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const payload = {
    results,
    metadata: { total_raw: all.length, unique: results.length, pages },
  };

  if (args.output) {
    writeFileSync(args.output, JSON.stringify(payload, null, 2));
    console.error(`Wrote ${results.length} results to ${args.output}`);
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
