import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
test('development SQL enforces service-only, duplicate-safe identity and one-time personal onboarding', async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon;create role authenticated;create role service_role; create schema auth; create table auth.users(id uuid primary key); create table public.profiles(id uuid primary key,user_id uuid,email text,created_at timestamptz default now(),first_name text,last_name text,full_name text,country text,investor_type text,organization_id uuid,compliance_status text default 'pending',compliance_acknowledged_at timestamptz,provisioned_at timestamptz); grant all on public.profiles to anon,authenticated;",
    );
    await db.exec(
      await readFile(
        new URL(
          '../../../supabase/migrations/20260825051902_identity_principal_provider_subject_foundation.sql',
          import.meta.url,
        ),
        'utf8',
      ),
    );
    await db.exec(
      'alter table public.profiles add foreign key(id) references public.identity_principals(id);create table public.user_roles(user_id uuid references public.identity_principals(id),role text,unique(user_id,role));create table public.onboarding_drafts(user_id uuid primary key,data jsonb);',
    );
    const sql = await readFile(
      new URL('../../../supabase/development/clerk-auth.sql', import.meta.url),
      'utf8',
    );
    await assert.rejects(db.exec(sql), /acknowledgement/);
    await db.exec('rollback');
    await db.exec("set neptlium.development_clerk='true'");
    await db.exec(sql);
    const bootstrap = async (subject, email) =>
      (
        await db.query('select public.bootstrap_development_clerk_identity($1,$2,$3) as result', [
          subject,
          email,
          'request',
        ])
      ).rows[0].result.profile_id;
    const id = await bootstrap('user_one', 'Owner@example.test');
    assert.equal(await bootstrap('user_one', 'owner@example.test'), id);
    await assert.rejects(bootstrap('user_two', 'OWNER@example.test'), /linking required/);
    assert.equal(
      (await db.query('select count(*)::int as n from identity_principals')).rows[0].n,
      1,
    );
    assert.equal((await db.query('select role from user_roles')).rows[0].role, 'user');
    for (const role of ['anon', 'authenticated']) {
      await db.exec('set role ' + role);
      await assert.rejects(bootstrap('user_bad', 'bad@example.test'), /permission denied/);
      await assert.rejects(
        db.exec("update profiles set compliance_status='active'"),
        /permission denied/,
      );
      await db.exec('reset role');
    }
    const payload = {
      firstName: 'A',
      lastName: 'Person',
      country: 'US',
      investorType: 'individual',
      acceptedTerms: true,
    };
    const finish = async (body) =>
      db.query('select public.complete_development_clerk_onboarding($1,$2::jsonb)', [
        id,
        JSON.stringify(body),
      ]);
    await assert.rejects(finish({ ...payload, acceptedTerms: false }), /invalid personal/);
    await assert.rejects(finish({ ...payload, firstName: 123 }), /invalid personal/);
    await assert.rejects(
      db.exec(
        "with p as (insert into identity_principals(id) values(gen_random_uuid()) returning id) insert into profiles(id,user_id,email) select id,id,'OWNER@example.test' from p",
      ),
      /duplicate key/,
    );

    await assert.rejects(
      finish({ ...payload, organizationName: 'Forged organization' }),
      /invalid personal/,
    );
    await db.query("update profiles set compliance_status='suspended' where id=$1", [id]);
    await assert.rejects(finish(payload), /restricted/);
    await db.query("update profiles set compliance_status='active' where id=$1", [id]);
    await finish(payload);
    await finish({ ...payload, firstName: 'Overwrite' });
    const row = (await db.query('select * from profiles where id=$1', [id])).rows[0];
    assert.equal(row.first_name, 'A');
    assert.equal(row.compliance_status, 'active');
    assert.equal(row.organization_id, null);
    assert.ok(row.provisioned_at);
    assert.equal(
      (await db.query('select count(*)::int as n from development_clerk_onboarding_events')).rows[0]
        .n,
      1,
    );
    await assert.rejects(db.exec('delete from development_clerk_onboarding_events'), /append-only/);
    await db.query(
      "update identity_provider_subjects set status='REVOKED',revoked_at=now() where principal_id=$1",
      [id],
    );
    await assert.rejects(bootstrap('user_one', 'owner@example.test'), /cannot be reactivated/);
    await db.query(
      "update identity_principals set status='SUSPENDED',suspended_at=now() where id=$1",
      [id],
    );
    await assert.rejects(finish(payload), /inactive principal/);
  } finally {
    await db.close();
  }
});
