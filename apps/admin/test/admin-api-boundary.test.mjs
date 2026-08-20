import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const EXCLUDED_DIRS = new Set(["node_modules", ".next", "test"]);
function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (EXCLUDED_DIRS.has(name)) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : [".ts", ".tsx"].includes(extname(path)) ? [path] : [];
  });
}
const adminSource = sourceFiles(root).map((path) => [path, readFileSync(path, "utf8")]);

test("apps/admin uses Clerk only for identity/session and never direct database authority", () => {
  for (const [path, source] of adminSource) {
    assert.equal(source.includes("createSupabaseAdminClient"), false, path);
    assert.equal(source.includes("SUPABASE_SERVICE_ROLE_KEY"), false, path);
    assert.equal(source.includes("service_role"), false, path);
    assert.equal(source.includes("ADMIN_ALLOCATOR_TOKEN"), false, path);
    assert.doesNotMatch(source, /\.from\s*\(/, path);
    assert.doesNotMatch(source, /\.rpc\s*\(/, path);
  }
  const login = readFileSync(join(root, "app/(auth)/login/page.tsx"), "utf8");
  const session = readFileSync(join(root, "lib/auth/session.ts"), "utf8");
  assert.match(login, /<SignIn/);
  assert.match(session, /adminApiRequest/);
  assert.match(session, /\/v1\/admin\/session/);
});

test("admin runtime env contains only auth/session public config plus server-only API origin", () => {
  const env = readFileSync(join(root, ".env.example"), "utf8").trim().split(/\r?\n/);
  assert.deepEqual(env, [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=",
    "CLERK_SECRET_KEY=",
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login",
    "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard",
    "NEXT_PUBLIC_SITE_URL=https://admin.neptlium.com",
    "NEPTLIUM_API_URL=https://api.neptlium.com",
  ]);
  assert.equal(env.some((line) => /SERVICE_ROLE|service_role/.test(line)), false);
});

test("canonical server-side admin API client forwards bearer identity and request IDs with timeout and no mutation retry loop", () => {
  const client = readFileSync(join(root, "lib/api/client.ts"), "utf8");
  assert.match(client, /NEPTLIUM_API_URL/);
  assert.match(client, /authorization: `Bearer \$\{token\}`/);
  assert.match(client, /'x-request-id': requestId/);
  assert.match(client, /AbortController/);
  assert.match(client, /8_000/);
  assert.doesNotMatch(client, /NEXT_PUBLIC_NEPTLIUM_API_URL/);
  assert.doesNotMatch(client, /for\s*\([^)]*attempt/);
  assert.doesNotMatch(client, /while\s*\(/);
});

test("all privileged data modules call apps/api rather than governed Supabase tables", () => {
  for (const name of ["users.ts", "deposits.ts", "withdrawals.ts", "transactions.ts", "allocations.ts", "security.ts"]) {
    const source = readFileSync(join(root, `lib/data/${name}`), "utf8");
    assert.match(source, /adminApiRequest/);
    assert.doesNotMatch(source, /\.from\(/);
    assert.doesNotMatch(source, /\.rpc\(/);
  }
});

test("all privileged operator writes call apps/api rather than Supabase", () => {
  for (const path of [
    "app/(admin)/dashboard/users/[id]/actions.ts",
    "app/(admin)/dashboard/deposits/actions.ts",
    "app/(admin)/dashboard/withdrawals/actions.ts",
    "app/(admin)/dashboard/allocations/actions.ts",
  ]) {
    const source = readFileSync(join(root, path), "utf8");
    assert.match(source, /adminApiRequest/);
    assert.doesNotMatch(source, /createSupabaseAdminClient/);
    assert.doesNotMatch(source, /\.from\(/);
    assert.doesNotMatch(source, /\.rpc\(/);
  }
});

test("withdrawal approval cannot manufacture settlement in apps/admin", () => {
  const source = readFileSync(join(root, "app/(admin)/dashboard/withdrawals/actions.ts"), "utf8");
  assert.match(source, /\/approve/);
  assert.doesNotMatch(source, /status:\s*["'](?:approved|completed|settled)["']/);
  assert.doesNotMatch(source, /createSupabaseAdminClient/);
});

test("allocation execution remains fail closed in operator UI", () => {
  const source = readFileSync(join(root, "app/(admin)/dashboard/allocations/actions.ts"), "utf8");
  assert.match(source, /execution remains unavailable/i);
  assert.doesNotMatch(source, /createSupabaseAdminClient/);
  assert.doesNotMatch(source, /status:\s*["']executed["']/);
});
