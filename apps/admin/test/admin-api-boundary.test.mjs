import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const root = new URL("../", import.meta.url).pathname;
function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : [".ts", ".tsx"].includes(extname(path)) ? [path] : [];
  });
}
const adminSource = sourceFiles(root).map((path) => [path, readFileSync(path, "utf8")]);

test("apps/admin uses Supabase only for identity/session, never service-role table authority", () => {
  for (const [path, source] of adminSource) {
    assert.equal(source.includes("createSupabaseAdminClient"), false, path);
    assert.equal(source.includes("SUPABASE_SERVICE_ROLE_KEY"), false, path);
    assert.equal(source.includes("ADMIN_ALLOCATOR_TOKEN"), false, path);
  }
  const login = readFileSync(join(root, "app/(auth)/login/actions.ts"), "utf8");
  assert.match(login, /signInWithPassword/);
  assert.match(login, /adminApiRequestWithToken/);
});

test("canonical server-side admin API client forwards bearer identity and request IDs", () => {
  const client = readFileSync(join(root, "lib/api/client.ts"), "utf8");
  assert.match(client, /NEPTLIUM_API_URL/);
  assert.match(client, /authorization: `Bearer \$\{token\}`/);
  assert.match(client, /'x-request-id': requestId/);
  assert.match(client, /AbortController/);
  assert.doesNotMatch(client, /NEXT_PUBLIC_NEPTLIUM_API_URL/);
});

test("all privileged data modules call apps/api rather than governed Supabase tables", () => {
  for (const name of ["users.ts", "deposits.ts", "withdrawals.ts", "transactions.ts", "allocations.ts", "security.ts"]) {
    const source = readFileSync(join(root, `lib/data/${name}`), "utf8");
    assert.match(source, /adminApiRequest/);
    assert.doesNotMatch(source, /\.from\(/);
  }
});

test("withdrawal approval cannot manufacture settlement in apps/admin", () => {
  const source = readFileSync(join(root, "app/(admin)/dashboard/withdrawals/actions.ts"), "utf8");
  assert.match(source, /\/approve/);
  assert.doesNotMatch(source, /status:\s*["'](?:completed|settled)["']/);
  assert.doesNotMatch(source, /createSupabaseAdminClient/);
});

test("allocation execution remains fail closed in operator UI", () => {
  const source = readFileSync(join(root, "app/(admin)/dashboard/allocations/actions.ts"), "utf8");
  assert.match(source, /execution remains unavailable/i);
  assert.doesNotMatch(source, /createSupabaseAdminClient/);
});
