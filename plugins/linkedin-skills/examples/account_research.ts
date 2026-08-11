/**
 * Research a company from its domain: resolve LinkedIn page, extract profile,
 * and run parallel enrichment across multiple data sources.
 *
 * Usage:
 *   npx tsx examples/account_research.ts "stripe.com"
 *   npx tsx examples/account_research.ts "acme.com" --output report.json
 */
import { writeFileSync } from 'node:fs';
import { Edges } from '@edgesrun/sdk';

function parseArgs(argv: string[]) {
  let output = '';
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--output' || argv[i] === '-o') output = argv[++i] ?? '';
    else positional.push(argv[i]);
  }
  return { domain: positional[0], output };
}

async function safeCall<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<[string, { status: 'ok'; data: T } | { status: 'error'; error: string }]> {
  try {
    const data = await fn();
    return [label, { status: 'ok', data }];
  } catch (err: any) {
    return [label, { status: 'error', error: err?.message ?? String(err) }];
  }
}

async function main() {
  const { domain, output } = parseArgs(process.argv.slice(2));
  if (!domain) {
    console.error('Usage: npx tsx examples/account_research.ts <domain> [--output report.json]');
    process.exit(1);
  }

  const apiKey = process.env.EDGES_API_KEY;
  if (!apiKey) {
    console.error('EDGES_API_KEY is required');
    process.exit(1);
  }

  const ed = new Edges({ apiKey });

  console.error('Step 1: Resolving domain -> LinkedIn company URL');
  const found = await ed.linkedin.findCompanyUrl({
    identity_mode: 'managed',
    input: { company_name: domain },
  });
  const foundList = Array.isArray(found.data) ? found.data : found.data ? [found.data] : [];
  const companyUrl = foundList[0]?.linkedin_company_url;
  if (!companyUrl) {
    console.error(`No LinkedIn company found for ${domain}`);
    process.exit(1);
  }
  console.error(`  Found: ${companyUrl}`);

  console.error('Step 2: Extracting company profile');
  const companyRes = await ed.linkedin.extractCompany({
    identity_mode: 'managed',
    input: { linkedin_company_url: companyUrl },
  });
  const company = Array.isArray(companyRes.data)
    ? companyRes.data[0]
    : companyRes.data ?? {};
  const companyId = company.linkedin_company_id ?? company.company_id;
  const snCompanyUrl = companyId
    ? `https://www.linkedin.com/sales/company/${companyId}`
    : null;
  console.error(`  Company: ${company.name ?? 'Unknown'} (ID: ${companyId})`);

  console.error('Step 3: Running parallel enrichment');
  const jobs: Array<Promise<[string, any]>> = [
    safeCall('employee_insights', async () => {
      const { data } = await ed.linkedin.extractCompanyEmployeesInsights({
        identity_mode: 'managed',
        input: { linkedin_company_url: companyUrl },
      });
      return data;
    }),
    safeCall('affiliates', async () => {
      const { data } = await ed.linkedin.extractCompanyAffiliates({
        identity_mode: 'managed',
        input: { linkedin_company_url: companyUrl },
      });
      return data;
    }),
    safeCall('similar_companies', async () => {
      const { data } = await ed.linkedin.extractSimilarCompanies({
        identity_mode: 'managed',
        input: { linkedin_company_url: companyUrl },
      });
      return data;
    }),
  ];

  if (snCompanyUrl) {
    jobs.push(
      safeCall('employee_distribution', async () => {
        const { data } = await ed.salesnavigator.extractEmployeesDistribution({
          identity_mode: 'managed',
          input: { sales_navigator_company_url: snCompanyUrl },
        });
        return data;
      }),
      safeCall('employee_count', async () => {
        const { data } = await ed.salesnavigator.extractEmployeesCount({
          identity_mode: 'managed',
          input: { sales_navigator_company_url: snCompanyUrl },
        });
        return data;
      }),
    );
  }

  if (companyId) {
    jobs.push(
      safeCall('jobs_us', async () => {
        const { data } = await ed.linkedin.searchJobs({
          identity_mode: 'managed',
          input: {
            linkedin_job_search_url: `https://www.linkedin.com/jobs/search/?f_C=${companyId}&geoId=103644278`,
          },
        });
        return data;
      }),
      safeCall('content_from', async () => {
        const { data } = await ed.linkedin.searchContent({
          identity_mode: 'managed',
          input: {
            linkedin_content_search_url: `https://www.linkedin.com/search/results/content/?fromOrganization=${companyId}`,
          },
        });
        return data;
      }),
    );
  }

  const enrichment: Record<string, any> = {};
  for (const [label, result] of await Promise.all(jobs)) {
    enrichment[label] = result;
    if (result.status === 'ok') {
      const count = Array.isArray(result.data) ? result.data.length : 1;
      console.error(`  [ok] ${label}: ${count} records`);
    } else {
      console.error(`  [error] ${label}: ${result.error}`);
    }
  }

  const report = {
    domain,
    company_url: companyUrl,
    linkedin_company_id: companyId,
    company_profile: company,
    enrichment,
    summary: {
      sources_attempted: Object.keys(enrichment).length,
      sources_succeeded: Object.values(enrichment).filter((v: any) => v.status === 'ok').length,
      sources_failed: Object.values(enrichment).filter((v: any) => v.status === 'error').length,
    },
  };

  if (output) {
    writeFileSync(output, JSON.stringify(report, null, 2));
    console.error(`Report saved to ${output}`);
  } else {
    console.log(JSON.stringify(report, null, 2));
  }

  console.error(
    `Done: ${report.summary.sources_succeeded}/${report.summary.sources_attempted} sources succeeded`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
