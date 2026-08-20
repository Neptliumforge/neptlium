import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const migration = await readFile(
  new URL(
    '../../../supabase/migrations/20260818120000_self_custody_treasury_destination_foundation.sql',
    import.meta.url,
  ),
  'utf8',
);

const actor = '00000000-0000-4000-8000-000000000001';
const ordinary = '00000000-0000-4000-8000-000000000002';
const digestA = 'a'.repeat(64);
const digestB = 'b'.repeat(64);

async function productionShapedDatabase() {
  const db = new PGlite();
  await db.exec(`
    create role anon noinherit;
    create role authenticated noinherit;
    create role service_role noinherit;
    create schema auth;
    create schema extensions;
    create function extensions.digest(value bytea, algorithm text) returns bytea
      language sql immutable as $$ select decode(md5(value::text) || md5(value::text), 'hex') $$;
    create type public.provider_environment as enum ('test','live');
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
    create table public.profiles(
      id uuid primary key references auth.users(id),
      compliance_status text default 'pending'
    );
    create table public.user_roles(
      user_id uuid not null references auth.users(id),
      role text not null
    );
    create table public.funding_intents(
      id uuid primary key default gen_random_uuid(),
      owner_id uuid not null references auth.users(id),
      environment public.provider_environment not null,
      asset text not null,
      network text,
      state text not null default 'created'
    );
    create table public.treasury_destinations(
      id uuid primary key default gen_random_uuid(),
      provider text not null check (provider in ('stripe','circle')),
      environment public.provider_environment not null,
      provider_treasury_id text not null,
      asset text not null,
      network text,
      destination_type text not null check (destination_type in ('financial_account','custody_wallet')),
      status text not null default 'inactive',
      created_at timestamptz not null default now(),
      constraint treasury_destinations_status_check check (status in ('inactive','active','suspended','revoked'))
    );
    create table public.deposit_routes(
      id uuid primary key default gen_random_uuid(),
      owner_id uuid not null references auth.users(id),
      funding_intent_id uuid not null references public.funding_intents(id),
      treasury_destination_id uuid not null references public.treasury_destinations(id),
      provider text not null,
      environment public.provider_environment not null,
      asset text not null,
      network text not null,
      deposit_address text not null,
      memo_or_tag text,
      status text not null default 'pending',
      unique(funding_intent_id)
    );
    alter table public.deposit_routes add constraint deposit_routes_provider_check check (provider in ('circle'));
    create unique index deposit_routes_destination_unique
      on public.deposit_routes(provider, environment, network, deposit_address, coalesce(memo_or_tag, ''));
    create table public.transfer_executions(id uuid primary key default gen_random_uuid());
    create table public.settlement_evidence(
      id uuid primary key default gen_random_uuid(),
      funding_intent_id uuid references public.funding_intents(id),
      transfer_execution_id uuid references public.transfer_executions(id),
      source text not null,
      environment public.provider_environment not null,
      source_event_id text,
      tx_hash text,
      network text,
      asset text not null,
      address text,
      memo_or_tag text,
      amount_atomic numeric(78,0) not null,
      block_number numeric(78,0),
      confirmations integer,
      evidence_state text not null,
      observed_at timestamptz not null,
      raw_reference jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now()
    );
    create table public.ledger_postings(id uuid primary key default gen_random_uuid(), marker text);
    create function public.enforce_deposit_route_identity() returns trigger language plpgsql as $$
      begin return new; end
    $$;
    create trigger deposit_routes_identity_guard before insert or update on public.deposit_routes
      for each row execute function public.enforce_deposit_route_identity();
    insert into auth.users(id) values ('${actor}'), ('${ordinary}');
    insert into public.profiles(id, compliance_status) values ('${actor}', 'active'), ('${ordinary}', 'active');
    insert into public.user_roles(user_id, role) values ('${actor}', 'super_admin'), ('${ordinary}', 'user');
    insert into public.ledger_postings(marker) values ('sentinel');
  `);
  await db.exec(migration);
  return db;
}

const setActor = (db, id) =>
  db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [id ?? '']);

const createCandidate = (
  db,
  key,
  requestDigest = digestA,
  address = '0x1111111111111111111111111111111111111111',
  actorId = actor,
) =>
  db.query(
    `select (public.create_treasury_destination_candidate(
      $1::uuid, 'request-1', $2, $3, 'USDC', 'BASE', 'eip155:8453',
      'live', $4, lower($4), 'evm'
    )).*`,
    [actorId, key, requestDigest, address],
  );

test('migration applies and treasury commands are authorized, serialized, replay-safe, and fail closed', async () => {
  const db = await productionShapedDatabase();
  try {
    await setActor(db, ordinary);
    await assert.rejects(
      () => createCandidate(db, 'ordinary-command', digestA, '0x1111111111111111111111111111111111111111', ordinary),
      /requires super_admin/,
    );

    await setActor(db, null);
    await assert.rejects(
      () => createCandidate(db, 'service-role-bypass'),
      /does not match authenticated principal/,
    );

    await setActor(db, actor);
    const [first, replay] = await Promise.all([
      createCandidate(db, 'candidate-command'),
      createCandidate(db, 'candidate-command'),
    ]);
    assert.equal(first.rows[0].id, replay.rows[0].id);
    await assert.rejects(
      () => createCandidate(db, 'candidate-command', digestB),
      /idempotency conflict/,
    );

    const destinationId = first.rows[0].id;
    const challengeSql = `select (public.issue_treasury_destination_challenge(
      $1::uuid, $2::uuid, 'request-2', 'challenge-command', $3
    )).*`;
    const challengeArgsA = [destinationId, actor, digestA];
    const challengeArgsB = [destinationId, actor, digestA];
    const [challenge, challengeReplay] = await Promise.all([
      db.query(challengeSql, challengeArgsA),
      db.query(challengeSql, challengeArgsB),
    ]);
    assert.equal(challenge.rows[0].id, challengeReplay.rows[0].id);
    assert.equal(challengeReplay.rows[0].nonce, challenge.rows[0].nonce);
    assert.equal(challengeReplay.rows[0].message, challenge.rows[0].message);
    await assert.rejects(
      () => db.query(challengeSql, [destinationId, actor, digestB]),
      /idempotency conflict/,
    );

    const challengeId = challenge.rows[0].id;
    const failureSql = `select (public.record_treasury_destination_verification_failure(
      $1::uuid, $2::uuid, $3::uuid, 'request-3', 'failed-command', $4, 'wrong_signer'
    )).*`;
    const failed = await db.query(failureSql, [challengeId, destinationId, actor, digestA]);
    const failedReplay = await db.query(failureSql, [challengeId, destinationId, actor, digestA]);
    assert.equal(failed.rows[0].verification_attempts, 1);
    assert.equal(failedReplay.rows[0].verification_attempts, 1);

    const verifySql = `select (public.consume_treasury_destination_challenge(
      $1::uuid, $2::uuid, $3::uuid, 'request-4', 'verify-command', $4,
      $5, $6, 'EIP_191_PERSONAL_SIGN', $7
    )).*`;
    const verifyArgs = [
      challengeId,
      destinationId,
      actor,
      digestA,
      challenge.rows[0].nonce_digest,
      challenge.rows[0].message_digest,
      'c'.repeat(64),
    ];
    const [verified, verifiedReplay] = await Promise.all([
      db.query(verifySql, verifyArgs),
      db.query(verifySql, verifyArgs),
    ]);
    assert.equal(verified.rows[0].verification_state, 'verified');
    assert.equal(verifiedReplay.rows[0].id, verified.rows[0].id);
    assert.equal(verified.rows[0].status, 'inactive');

    const activateSql = `select (public.transition_treasury_destination(
      $1::uuid, $2::uuid, 'request-5', 'activate-command', $3, 'activate'
    )).*`;
    await assert.rejects(
      () => db.query(activateSql, [destinationId, actor, digestA]),
      /operational readiness unavailable/,
    );
    await assert.rejects(
      () => db.query(activateSql, [destinationId, actor, digestA]),
      /operational readiness unavailable/,
    );

    await assert.rejects(
      () => db.exec(`update public.treasury_destination_events set metadata = '{}'::jsonb`),
      /append-only/,
    );
    await assert.rejects(
      () => createCandidate(db, 'identity-race', digestA),
      /treasury_destinations_address_identity_unique/,
    );

    const providerDestination = await db.query(`
      insert into public.treasury_destinations(
        provider, provider_treasury_id, environment, asset, network, network_identifier,
        destination_type, status, controller_type, custody_model, verification_state,
        verification_method, verification_evidence_digest, verified_at, activated_at
      ) values (
        'circle', 'provider-treasury-1', 'test', 'USDC', 'BASE-SEPOLIA', 'eip155:84532',
        'custody_wallet', 'active', 'provider', 'provider_custody', 'verified',
        'provider_attestation', '${'d'.repeat(64)}', now(), now()
      ) returning id
    `);
    const providerDestinationId = providerDestination.rows[0].id;
    const intent = await db.query(
      `insert into public.funding_intents(owner_id, environment, asset, network)
       values ($1, 'test', 'USDC', 'BASE-SEPOLIA') returning id`,
      [actor],
    );
    const route = await db.query(
      `insert into public.deposit_routes(
        owner_id, funding_intent_id, treasury_destination_id, provider,
        environment, asset, network, deposit_address, status
      ) values ($1, $2, $3, 'circle', 'test', 'USDC', 'BASE-SEPOLIA', 'provider-address', 'active')
      returning id`,
      [actor, intent.rows[0].id, providerDestinationId],
    );
    await db.query(
      `select (public.transition_treasury_destination(
        $1::uuid, $2::uuid, 'request-retire', 'retire-command', $3, 'retire'
      )).*`,
      [providerDestinationId, actor, digestA],
    );
    const historicalRoute = await db.query(
      `select treasury_destination_id, status from public.deposit_routes where id = $1`,
      [route.rows[0].id],
    );
    assert.equal(historicalRoute.rows[0].treasury_destination_id, providerDestinationId);
    assert.equal(historicalRoute.rows[0].status, 'revoked');
    const ledger = await db.query(`select marker from public.ledger_postings`);
    assert.deepEqual(ledger.rows, [{ marker: 'sentinel' }]);
  } finally {
    await db.close();
  }
});
