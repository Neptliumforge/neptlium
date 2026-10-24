import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const retired = ['cl', 'erk'].join('');
const historical = new Set([
  'supabase/migrations/20260825051902_identity_principal_provider_subject_foundation.sql',
  'supabase/migrations/20260825051927_' + retired + '_identity_linking_commands.sql',
  'supabase/migrations/20260825053722_' + retired + '_dual_session_link_service.sql',
  'supabase/migrations/20260825053749_' + retired + '_application_identity_cutover.sql',
  'supabase/migrations/20260825053809_' + retired + '_bootstrap_existing_account_guard.sql',
  'supabase/migrations/20260825082059_self_custody_treasury_principal_cutover.sql',
  'supabase/migrations/20260912223000_' + retired + '_only_identity_cutover.sql',
  'supabase/migrations/20260913123000_supabase_auth_only_cutover.sql',
  'docs/archive/remediation/GATE_05_LEGACY_MUTATION_PATHS.md',
]);
// Owner-approved App/API development transition. Exact paths only; no directory exemptions.
const approvedDevelopment = new Set([
  'AGENTS.md',
  'apps/api/.env.clerk-development.example',
  'apps/api/package.json',
  'apps/api/src/app.ts',
  'apps/api/src/clerk-authentication.ts',
  'apps/api/src/config.ts',
  'apps/api/src/identity-principal.ts',
  'apps/api/test/clerk-authentication.test.mjs',
  'apps/api/test/clerk-development-database.test.mjs',
  'apps/app/.env.clerk-development.example',
  'apps/app/app/(auth)/components/ClerkAuthForm.tsx',
  'apps/app/app/(auth)/forgot-password/page.tsx',
  'apps/app/app/(auth)/reset-password/actions.ts',
  'apps/app/app/(auth)/reset-password/page.tsx',
  'apps/app/app/auth/callback/route.ts',
  'apps/app/app/auth/complete/Completion.tsx',
  'apps/app/app/auth/complete/page.tsx',
  'apps/app/app/auth/recovery/route.ts',
  'apps/app/app/auth/sign-in/page.tsx',
  'apps/app/app/auth/sign-up/page.tsx',
  'apps/app/app/auth/sso-callback/page.tsx',
  'apps/app/app/dashboard/settings/security/page.tsx',
  'apps/app/app/layout.tsx',
  'apps/app/app/page.tsx',
  'apps/app/components/security/IdentityActions.tsx',
  'apps/app/components/security/WalletLink.tsx',
  'apps/app/lib/account/session-details.ts',
  'apps/app/lib/auth/clerk-actions.ts',
  'apps/app/lib/auth/guards.ts',
  'apps/app/lib/auth/provider.ts',
  'apps/app/lib/auth/session.ts',
  'apps/app/lib/auth/token.ts',
  'apps/app/lib/auth/wallet-link.ts',
  'apps/app/package.json',
  'apps/app/proxy.ts',
  'apps/app/test/account-return-continuity.test.mjs',
  'apps/app/test/api-boundary.test.mjs',
  'apps/app/test/clerk-development.test.mjs',
  'apps/app/test/clerk-flows.test.mjs',
  'apps/app/test/onboarding-profile-verification.test.mjs',
  'apps/app/test/production-entry-flow.test.mjs',
  'docs/README.md',
  'docs/platform/CLERK_DEVELOPMENT.md',
  'docs/platform/IDENTITY.md',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'supabase/development/clerk-auth.sql',
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

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);
const hits = [];
for (const file of files) {
  if (file === self || historical.has(file) || approvedDevelopment.has(file)) continue;
  const lowerPath = file.toLowerCase();
  if (lowerPath.includes(retired)) hits.push(`${file}: retired provider appears in active path`);
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  const lower = text.toLowerCase();
  for (const marker of markers) {
    if (lower.includes(marker.toLowerCase())) {
      hits.push(`${file}: active retired-auth reference (${marker})`);
      break;
    }
  }
}

if (hits.length) {
  console.error(
    'Authentication references outside historical evidence and the approved development scope are not permitted.',
  );
  for (const hit of hits) console.error(`- ${hit}`);
  process.exit(1);
}
console.log('Authentication source scope contract: PASS');
