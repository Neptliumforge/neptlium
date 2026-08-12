import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const adminRoot = resolve(here, "..");
const repoRoot = resolve(adminRoot, "../..");
const read = (path) => readFileSync(resolve(adminRoot, path), "utf8");

const authorization = read("lib/auth/authorization.ts");
const guards = read("lib/auth/guards.ts");
const login = read("app/(auth)/login/actions.ts");
const roleActions = read("app/(admin)/dashboard/users/[id]/actions.ts");
const picker = read("components/admin/UserRolePicker.tsx");
const migration = readFileSync(
  resolve(repoRoot, "supabase/migrations/20260812080000_single_general_platform_admin.sql"),
  "utf8",
);

test("only super_admin satisfies General Platform Administrator authorization", () => {
  assert.match(authorization, /GENERAL_PLATFORM_ADMIN_ROLE\s*=\s*"super_admin"/);
  assert.match(authorization, /return role === GENERAL_PLATFORM_ADMIN_ROLE/);
  assert.doesNotMatch(guards, /hasRole\s*\(/);
  assert.match(guards, /isGeneralPlatformAdminRole\(role\)/);
});

test("admin, manager and ordinary roles cannot satisfy apps/admin authorization", () => {
  assert.match(authorization, /DELEGABLE_ROLES\s*=\s*\["user", "operator", "analyst", "manager"\]/);
  assert.doesNotMatch(authorization, /DELEGABLE_ROLES[^\n]*"admin"/);
  assert.doesNotMatch(authorization, /DELEGABLE_ROLES[^\n]*"super_admin"/);
});

test("unauthenticated users are redirected before role authorization", () => {
  assert.match(guards, /if \(!user\) redirect\("\/login"\)/);
  assert.match(guards, /redirect\("\/unauthorized"\)/);
});

test("successful Supabase authentication still requires API-backed admin authorization", () => {
  assert.match(login, /signInWithPassword/);
  assert.match(login, /adminApiRequestWithToken/);
  assert.match(login, /"\/v1\/admin\/session"/);
  assert.match(login, /await supabase\.auth\.signOut\(\)/);
  assert.doesNotMatch(login, /createSupabaseAdminClient/);
});

test("admin delegation is disabled in server actions and UI", () => {
  assert.match(roleActions, /DELEGABLE_ROLES\.includes\(newRole\)/);
  assert.match(roleActions, /adminApiRequest\(/);
  assert.doesNotMatch(roleActions, /createSupabaseAdminClient/);
  assert.match(picker, /DELEGABLE_ROLES\.map/);
  assert.match(picker, /currentRole === "super_admin"/);
  assert.doesNotMatch(picker, /\["user", "operator", "analyst", "manager", "admin", "super_admin"\]/);
});

test("database migration rejects a second super_admin", () => {
  assert.match(migration, /count\(\*\).*role = 'super_admin'/s);
  assert.match(migration, /CREATE UNIQUE INDEX IF NOT EXISTS user_roles_single_super_admin_idx/);
  assert.match(migration, /WHERE role = 'super_admin'/);
});
