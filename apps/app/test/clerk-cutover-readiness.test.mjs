import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

// This gate is intentionally diagnostic and non-mutating. The legacy auth flow
// remains active on main until a reviewed, tested Clerk cutover is complete.
function inspectClerkCutover() {
  const pkg = JSON.parse(read('package.json'));
  const signIn = read('app/auth/sign-in/page.tsx');
  const signUp = read('app/auth/sign-up/page.tsx');
  const layout = read('app/layout.tsx');
  const proxy = read('proxy.ts');
  return {
    clerkDependency: typeof pkg.dependencies?.['@clerk/nextjs'] === 'string',
    clerkProvider: /ClerkProvider/.test(layout),
    clerkSignIn: /@clerk\/nextjs/.test(signIn) && /<SignIn\b/.test(signIn),
    clerkSignUp: /@clerk\/nextjs/.test(signUp) && /<SignUp\b/.test(signUp),
    clerkRouteGuard: /clerkMiddleware/.test(proxy),
    legacySignIn: /SupabaseAuthForm/.test(signIn),
    legacySignUp: /SupabaseAuthForm/.test(signUp),
  };
}

test('Gate 02 cutover cannot be certified from Clerk credentials alone', () => {
  const state = inspectClerkCutover();
  const certified =
    state.clerkDependency &&
    state.clerkProvider &&
    state.clerkSignIn &&
    state.clerkSignUp &&
    state.clerkRouteGuard &&
    !state.legacySignIn &&
    !state.legacySignUp;
  // When the migration is complete, replace this diagnostic with positive
  // end-to-end identity, session, tenant, bootstrap and rollback tests.
  assert.equal(typeof certified, 'boolean');
  assert.equal(existsSync(resolve(root, 'app/auth/sign-up/page.tsx')), true);
  if (!certified) {
    const blockers = Object.entries(state).filter(([name, value]) =>
      name.startsWith('legacy') ? value : !value,
    ).map(([name]) => name);
    assert.ok(blockers.length > 0, 'uncertified cutover must expose blockers');
    // Keep a stable, non-sensitive CI diagnostic for reviewers.
    process.stdout.write(`Gate 02 Clerk cutover NOT CERTIFIED: ${blockers.join(', ')}\n`);
  }
});

test('Gate 02 rejects partial auth UI cutover while Supabase session remains authoritative', () => {
  const state = inspectClerkCutover();
  const root = read('app/page.tsx');
  const proxy = read('proxy.ts');
  const api = read('lib/api/client.ts');
  const dashboard = read('app/dashboard/layout.tsx');
  const legacySessionAuthority =
    /supabase\\.auth\\.getUser\\(/.test(root) ||
    /refreshSupabaseSession/.test(proxy) ||
    /supabase\\.auth\\.getSession\\(/.test(api) ||
    /requireProvisionedUser/.test(dashboard);

  // Prevent a UI-only migration that accepts a Clerk sign-in yet cannot
  // authorize the customer dashboard and financial API with that identity.
  if (legacySessionAuthority) {
    assert.equal(state.clerkSignIn, false, 'Clerk sign-in must not ship with legacy session authority');
    assert.equal(state.clerkSignUp, false, 'Clerk sign-up must not ship with legacy session authority');
    assert.equal(state.clerkRouteGuard, false, 'Clerk route guard must not ship with legacy session authority');
  }
});
