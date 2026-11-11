import test from 'node:test';
import assert from 'node:assert/strict';
import { newDatabase, sql, loadSql, handle } from './gate01c/isolation.mjs';

const enabled = process.env.NEPTLIUM_GATE01B_ALLOW_DISPOSABLE_SQL === '1' && Boolean(process.env.NEPTLIUM_GATE01C_CONTAINER_ID);
const deps = '/tmp/neptlium-gate01c/dependencies';
for (const [pr, path] of [[134,'supabase/test/profile-authority/run.sql'],[137,'supabase/test/canonical-balances/run.sql']]) {
  test(`PostgreSQL 17: pinned PR #${pr} SQL authorization/initialization suite`, {skip:!enabled}, async () => {
    const database = await newDatabase(`pr${pr}`);
    const empty = await handle(database).query(`select count(*)::integer as count from pg_tables where schemaname in ('public','auth')`);
    assert.equal(empty.rows[0].count,0);
    await sql(database,await loadSql(`${deps}/${pr}/${path}`),`pinned_pr_${pr}_suite`);
  });
}
