import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const retired = ['cl', 'erk'].join('');
const historical = new Set([
  'supabase/migrations/20260820190000_identity_principal_provider_subject_foundation.sql',
  'supabase/migrations/20260820203000_' + retired + '_identity_linking_commands.sql',
  'supabase/migrations/20260820210000_' + retired + '_dual_session_link_service.sql',
  'supabase/migrations/20260820220000_' + retired + '_application_identity_cutover.sql',
  'supabase/migrations/20260820221000_' + retired + '_bootstrap_existing_account_guard.sql',
  'supabase/migrations/20260825080000_self_custody_treasury_principal_cutover.sql',
  'supabase/migrations/20260912223000_' + retired + '_only_identity_cutover.sql',
  'supabase/migrations/20260913123000_supabase_auth_only_cutover.sql',
  'docs/financial-authority-remediation/GATE_05_LEGACY_MUTATION_PATHS.md',
]);
const self = 'scripts/retired-auth-contract.mjs';
const providerName = retired[0].toUpperCase() + retired.slice(1);
const markers = [
  retired,
  `@${retired}`,
  retired.toUpperCase() + '_',
  'NEXT_PUBLIC_' + retired.toUpperCase() + '_',
  providerName + 'Provider',
  retired + 'Middleware',
  retired + 'Client',
  'currentUser',
  'useUser',
  'useAuth',
  'SignedIn',
  'SignedOut',
];

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const hits = [];
for (const file of files) {
  if (file === self || historical.has(file)) continue;
  const lowerPath = file.toLowerCase();
  if (lowerPath.includes(retired)) hits.push(`${file}: retired provider appears in active path`);
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { continue; }
  const lower = text.toLowerCase();
  for (const marker of markers) {
    if (lower.includes(marker.toLowerCase())) {
      hits.push(`${file}: active retired-auth reference (${marker})`);
      break;
    }
  }
}

if (hits.length) {
  console.error('Retired authentication references are not permitted outside explicit historical evidence.');
  for (const hit of hits) console.error(`- ${hit}`);
  process.exit(1);
}
console.log('Retired authentication source contract: PASS');
