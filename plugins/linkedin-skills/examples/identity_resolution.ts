/**
 * Resolve a person's name to a verified LinkedIn profile.
 *
 * Usage:
 *   npx tsx examples/identity_resolution.ts "Satya Nadella" "Microsoft"
 *   npx tsx examples/identity_resolution.ts "John Smith" "fintech" --keyword
 */
import { Edges } from '@edgesrun/sdk';

function buildSearchUrl(name: string, qualifier: string): string {
  const keywords = encodeURIComponent(`"${name}" AND "${qualifier}"`);
  return (
    'https://www.linkedin.com/search/results/people/' +
    `?keywords=${keywords}&origin=SWITCH_SEARCH_VERTICAL`
  );
}

async function searchPeople(ed: Edges, name: string, qualifier: string) {
  const url = buildSearchUrl(name, qualifier);
  console.error(`  Search: "${name}" AND "${qualifier}"`);
  try {
    const { data } = await ed.linkedin.searchPeople({
      identity_mode: 'managed',
      input: { linkedin_people_search_url: url },
      parameters: { only_extract_unique_profile: true },
    });
    return Array.isArray(data) ? data : data ? [data] : [];
  } catch (err) {
    console.error('  Search failed:', err);
    return [];
  }
}

function pickBestMatch(results: any[], companyHint: string) {
  const companyLower = companyHint.toLowerCase();
  let best: any = null;
  let bestScore = -1;
  for (const r of results) {
    let score = 0;
    const headline = (r.headline || '').toLowerCase();
    const current = (r.company_name || '').toLowerCase();
    if (current.includes(companyLower)) score += 10;
    if (headline.includes(companyLower)) score += 5;
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }
  return best;
}

async function enrichProfile(ed: Edges, profileUrl: string) {
  console.error('  Enriching profile...');
  const { data } = await ed.linkedin.extractPeople({
    identity_mode: 'managed',
    input: { linkedin_profile_url: profileUrl },
    parameters: {
      experiences: true,
      skills: true,
      sections: true,
      highlights: true,
    },
  });
  if (Array.isArray(data)) return data[0] ?? {};
  return data ?? {};
}

async function main() {
  const args = process.argv.slice(2);
  const keyword = args.includes('--keyword');
  const positional = args.filter((a) => a !== '--keyword');
  const [name, qualifier] = positional;

  if (!name || !qualifier) {
    console.error(
      'Usage: npx tsx examples/identity_resolution.ts "Name" "Company" [--keyword]',
    );
    process.exit(1);
  }

  const apiKey = process.env.EDGES_API_KEY;
  if (!apiKey) {
    console.error('EDGES_API_KEY is required');
    process.exit(1);
  }

  const ed = new Edges({ apiKey });

  console.error('Pass 1: searching by name + qualifier');
  let results = await searchPeople(ed, name, qualifier);

  if (!results.length && !keyword) {
    console.error('Pass 2: no results, retrying with keyword approach');
    results = await searchPeople(ed, name, qualifier.split(/\s+/)[0]);
  }

  if (!results.length) {
    console.error('Pass 3: trying bare name search');
    try {
      const url =
        'https://www.linkedin.com/search/results/people/' +
        `?keywords=${encodeURIComponent(name)}&origin=SWITCH_SEARCH_VERTICAL`;
      const { data } = await ed.linkedin.searchPeople({
        identity_mode: 'managed',
        input: { linkedin_people_search_url: url },
        parameters: { only_extract_unique_profile: true },
      });
      results = Array.isArray(data) ? data : data ? [data] : [];
    } catch {
      results = [];
    }
  }

  if (!results.length) {
    console.error(`No results found for "${name}"`);
    process.exit(1);
  }

  const match =
    results.length === 1 ? results[0] : pickBestMatch(results, qualifier);
  const profileUrl = match?.linkedin_profile_url;
  if (!profileUrl) {
    console.error('No profile URL in match');
    console.log(JSON.stringify(match, null, 2));
    process.exit(1);
  }

  const profile = await enrichProfile(ed, profileUrl);
  const output = {
    linkedin_profile_id: profile.linkedin_profile_id,
    sales_navigator_profile_id: profile.sales_navigator_profile_id,
    linkedin_profile_url: profile.linkedin_profile_url,
    full_name: profile.full_name,
    headline: profile.headline,
    company_name: profile.company_name,
    location: profile.location,
    profile,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
