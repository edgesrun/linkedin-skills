/**
 * Safe connection request with pre-checks (conversations + sent invitations) and delay.
 *
 * Usage:
 *   npx tsx skills/edges-linkedin-connect-profile/scripts/safe_connect.ts "<profile_url>" --identity-id UUID
 *   npx tsx skills/edges-linkedin-connect-profile/scripts/safe_connect.ts "<profile_url>" --identity-id UUID --note "Hi..."
 */
import { Edges } from '@edgesrun/sdk';

const NOTE_MAX_LENGTH = 300;

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let identityId = '';
  let note = '';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--identity-id') identityId = argv[++i] ?? '';
    else if (a === '--note') note = argv[++i] ?? '';
    else positional.push(a);
  }
  return { profileUrl: positional[0], identityId, note };
}

function extractProfileSlug(url: string): string {
  const clean = url.split('?')[0].replace(/\/$/, '');
  return clean.split('/').pop()?.toLowerCase() ?? '';
}

async function checkExistingRelationship(
  ed: Edges,
  identityId: string,
  targetSlug: string,
) {
  console.error('Pre-check: scanning conversations...');
  try {
    const { data } = await ed.linkedin.extractConversations({
      identity_ids: [identityId],
      input: {},
    });
    const conversations = Array.isArray(data) ? data : [];
    for (const conv of conversations as any[]) {
      for (const participant of conv.participants ?? []) {
        const pUrl =
          participant.linkedin_profile_url || participant.profile_url || '';
        if (pUrl && extractProfileSlug(pUrl) === targetSlug) {
          return {
            status: 'already_connected' as const,
            thread_id: conv.linkedin_thread_id ?? '',
            last_activity: conv.last_activity_at ?? '',
          };
        }
      }
    }
  } catch (err: any) {
    console.error(
      `Warning: Could not check conversations (${err?.message}). Continuing checks.`,
    );
  }

  console.error('Pre-check: scanning sent invitations...');
  try {
    const { data } = await ed.linkedin.extractSentInvitations({
      identity_ids: [identityId],
      input: {},
    });
    const invitations = Array.isArray(data) ? data : [];
    for (const inv of invitations as any[]) {
      const invUrl = inv.linkedin_profile_url || '';
      if (invUrl && extractProfileSlug(invUrl) === targetSlug) {
        return {
          status: 'pending' as const,
          sent_date: inv.sent_date ?? '',
          invitation_id: inv.linkedin_invitation_id ?? '',
        };
      }
    }
  } catch (err: any) {
    console.error(
      `Warning: Could not check sent invitations (${err?.message}). Proceeding with connect.`,
    );
  }

  return { status: 'no_relationship' as const };
}

async function main() {
  const { profileUrl, identityId, note } = parseArgs(process.argv.slice(2));
  if (!profileUrl || !identityId) {
    console.error(
      'Usage: npx tsx skills/edges-linkedin-connect-profile/scripts/safe_connect.ts <profile_url> --identity-id UUID [--note "..."]',
    );
    process.exit(1);
  }

  if (note && note.length > NOTE_MAX_LENGTH) {
    console.error(`Note exceeds ${NOTE_MAX_LENGTH} characters`);
    process.exit(1);
  }

  const apiKey = process.env.EDGES_API_KEY;
  if (!apiKey) {
    console.error('EDGES_API_KEY is required');
    process.exit(1);
  }

  const ed = new Edges({ apiKey });
  const targetSlug = extractProfileSlug(profileUrl);
  const relationship = await checkExistingRelationship(ed, identityId, targetSlug);

  if (relationship.status === 'already_connected') {
    console.log(JSON.stringify({ connected: true, ...relationship }, null, 2));
    return;
  }
  if (relationship.status === 'pending') {
    console.log(JSON.stringify({ pending: true, ...relationship }, null, 2));
    return;
  }

  // Human-like delay before send
  await new Promise((r) => setTimeout(r, 2000 + Math.floor(Math.random() * 3000)));

  const { data } = await ed.linkedin.connectProfile({
    identity_ids: [identityId],
    ...(note ? { parameters: { message: note } } : {}),
    input: { linkedin_profile_url: profileUrl },
  });

  const result = Array.isArray(data) ? data[0] : data;
  console.log(JSON.stringify(result ?? {}, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
