import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/**
 * Authentication transition contract: Clerk is an approved customer target,
 * NOT automatically the production provider. Keep disallowed provider SDKs,
 * unauthorized production cutover and accidental removal of legacy recovery
 * paths detectable until the release gate is explicitly approved.
 */
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\\0').filter(Boolean);
const tracked = new Set(files);
const errors = [];
const read = (path) => readFileSync(path, 'utf8');
const required = [
  'AGENTS.md',
  'docs/platform/IDENTITY.md',
  'apps/api/src/clerk-jwt-verifier.ts',
  'apps/api/src/clerk-principal-gate.ts',
  'apps/api/src/clerk-preview-principal.ts',
  'apps/api/src/authentication.ts',
  'apps/api/src/identity-principal.ts',
  'apps/app/app/auth/sign-in/page.tsx',
  'apps/app/app/auth/sign-up/page.tsx',
];
for (const path of required) if (!tracked.has(path)) errors.push('Missing required migration or current-session boundary: ' + path);
if (tracked.has('AGENTS.md') && !read('AGENTS.md').includes('approved migration: Supabase Auth (CURRENT)'))
  errors.push('Repository authority must explicitly describe the guarded Clerk transition');
if (tracked.has('docs/platform/IDENTITY.md') && !read('docs/platform/IDENTITY.md').includes('TRANSITION, not production activation'))
  errors.push('Identity authority must distinguish current sessions from target cutover');
if (tracked.has('apps/api/src/authentication.ts') && !read('apps/api/src/authentication.ts').includes('verifySupabaseSubject'))
  errors.push('Current production API authentication changed without a separate release gate');
for (const path of ['apps/app/app/auth/sign-in/page.tsx', 'apps/app/app/auth/sign-up/page.tsx']) {
  if (tracked.has(path) && !read(path).includes('SupabaseAuthForm'))
    errors.push('Current customer session route changed before reviewed cutover: ' + path);
}
const disallowed = [/from\\s*['\"]@auth0\\//i, /from\\s*['\"]next-auth(?:\\/|['\"])/i, /from\\s*['\"]firebase\\/auth/i];
for (const path of files) {
  if (!/\\.(?:ts|tsx|js|mjs|cjs)$/.test(path) || path.startsWith('docs/archive/')) continue;
  let source;
  try { source = read(path); } catch { continue; }
  if (disallowed.some((pattern) => pattern.test(source)))
    errors.push('Unapproved authentication provider import: ' + path);
}
if (errors.length) {
  console.error('Authentication migration contract: FAIL');
  for (const error of errors) console.error('- ' + error);
  process.exit(1);
}
console.log('Authentication migration contract: PASS (Clerk Preview target, Supabase production retained)');
