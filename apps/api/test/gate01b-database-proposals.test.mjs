import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// PREPARED ONLY. Do not set this gate in CI or run it without explicit isolated-SQL authorization.
const authorized = process.env.NEPTLIUM_GATE01B_ALLOW_DISPOSABLE_SQL === '1';
const owner = '11111111-1111-4111-8111-111111111111';
const proposal = (name) =>
  readFile(
    new URL(`../../../docs/engineering/proposals/gate-01b/${name}`, import.meta.url),
    'utf8',
  );
async function database() {
  const native = process.env.NEPTLIUM_GATE01C_CONTAINER_ID;
  const adapter = native ? await import('./gate01c/isolation.mjs') : null;
  const db = adapter ? adapter.handle(await adapter.newDatabase('proposal')) : new PGlite();
  await db.exec(await proposal('fixture.sql'));
  await db.exec(await proposal('webhook-fencing.sql'));
  await db.exec(await proposal('ledger-hardening.sql'));
  return db;
}
const scope = ['stripe', 'test', 'evt_1'];
const claim = async (db, id = 'evt_1') =>
  (await db.query(`select public.claim_provider_webhook_v2('stripe','test',$1) as value`, [id]))
    .rows[0].value;
const finish = (db, token, disposition, id = 'evt_1') =>
  db.query(`select public.finish_provider_webhook_v2('stripe','test',$1,$2,$3)`, [
    id,
    token,
    disposition,
  ]);
const event = (id, created, status = 'active') => ({
  id,
  created,
  livemode: false,
  type: 'customer.subscription.updated',
  data: { object: { id: 'sub_1', customer: 'cus_1', status } },
});
const seed = (db, payload) =>
  db.query(
    `insert into public.provider_webhook_inbox(provider,environment,provider_event_id,payload,payload_digest,signature_verified_at)
  values('stripe','test',$1,$2,'fixture-digest',now())`,
    [payload.id, payload],
  );
const disposition = (payload) => ({
  action: 'subscription_update',
  reason: 'supported_subscription_event',
  command: {
    kind: 'sync_subscription',
    customerId: 'cus_1',
    subscriptionId: 'sub_1',
    environment: 'test',
    eventId: payload.id,
    eventCreated: payload.created,
    status: payload.data.object.status,
  },
});

test(
  'PROPOSED SQL: unique fence, expired-owner rejection, retries, dead-letter and least privilege',
  { skip: !authorized },
  async () => {
    const db = await database();
    try {
      await seed(db, event('evt_1', 100));
      const [first, second] = await Promise.all([claim(db), claim(db)]);
      assert.equal(first.acquired, true);
      assert.equal(second.acquired, false);
      await db.exec(
        `update public.provider_webhook_inbox set lease_expires_at=now()-interval '1 second'`,
      );
      const replacement = await claim(db);
      assert.notEqual(replacement.token, first.token);
      await assert.rejects(() => finish(db, first.token, { action: 'ignored' }), /fence lost/);
      await db.query(`select public.fail_provider_webhook_v2($1,$2,$3,$4,'fixture_failure')`, [
        ...scope,
        replacement.token,
      ]);
      assert.equal((await claim(db)).acquired, false);
      await db.exec(
        `update public.provider_webhook_inbox set attempts=8,next_attempt_at=now()-interval '1 second'`,
      );
      assert.equal((await claim(db)).state, 'dead_letter');
      for (const role of ['anon', 'authenticated']) {
        const result = await db.query(
          `select has_function_privilege($1,'public.claim_provider_webhook_v2(text,public.provider_environment,text)','execute') as allowed`,
          [role],
        );
        assert.equal(result.rows[0].allowed, false);
      }
      assert.equal(
        (
          await db.query(
            `select has_function_privilege('service_role','public.complete_provider_webhook(text,public.provider_environment,text)','execute') as allowed`,
          )
        ).rows[0].allowed,
        false,
      );
    } finally {
      await db.close();
    }
  },
);

test(
  'PROPOSED SQL: exact binding, atomic rollback, stale events and same-timestamp ambiguity',
  { skip: !authorized },
  async () => {
    const db = await database();
    try {
      await db.query(
        `insert into public.subscriptions(id,user_id,plan,stripe_customer_id,stripe_subscription_id)
      values('22222222-2222-4222-8222-222222222222',$1,'pro','cus_1','sub_1')`,
        [owner],
      );
      await db.exec(
        `insert into public.stripe_subscription_bindings values('22222222-2222-4222-8222-222222222222','test','cus_1','sub_1','pro')`,
      );
      const latest = event('evt_1', 200, 'canceled');
      await seed(db, latest);
      const leased = await claim(db);
      const wrong = disposition(latest);
      wrong.command.subscriptionId = 'sub_other';
      await assert.rejects(() => finish(db, leased.token, wrong));
      assert.equal(
        (await db.query(`select status from public.subscriptions`)).rows[0].status,
        'active',
      );
      await finish(db, leased.token, disposition(latest));
      const stale = event('evt_old', 100);
      await seed(db, stale);
      const oldLease = await claim(db, 'evt_old');
      await finish(db, oldLease.token, disposition(stale), 'evt_old');
      assert.equal(
        (await db.query(`select status from public.subscriptions`)).rows[0].status,
        'canceled',
      );
      const tied = event('evt_tied', 200);
      await seed(db, tied);
      const tiedLease = await claim(db, 'evt_tied');
      await assert.rejects(
        () => finish(db, tiedLease.token, disposition(tied), 'evt_tied'),
        /ambiguous/,
      );
      await assert.rejects(() =>
        db.exec(
          `insert into public.stripe_subscription_bindings select * from public.stripe_subscription_bindings`,
        ),
      );
    } finally {
      await db.close();
    }
  },
);

test(
  'PROPOSED SQL: integer/null/network integrity, balanced commit and denied destructive grants',
  { skip: !authorized },
  async () => {
    const db = await database();
    try {
      const accounts = (
        await db.query(
          `insert into public.ledger_accounts(owner_id,account_code,asset,network,account_class)
      values($1,'capital:available','USDC','BASE','liability'),($1,'capital:pending','USDC','BASE','liability'),
      ($1,'capital:available','USDC','OTHER','liability') returning id`,
          [owner],
        )
      ).rows;
      const postings = (amount = '1', second = 1) => [
        {
          account_id: accounts[0].id,
          asset: 'USDC',
          network: 'BASE',
          direction: 'debit',
          amount_atomic: amount,
        },
        {
          account_id: accounts[second].id,
          asset: 'USDC',
          network: second === 2 ? 'OTHER' : 'BASE',
          direction: 'credit',
          amount_atomic: amount,
        },
      ];
      const post = (values) =>
        db.query(
          `select public.post_balanced_journal($1,'fixture',gen_random_uuid(),'request',null,$2)`,
          [owner, values],
        );
      for (const value of [
        null,
        [],
        postings('1.4'),
        postings('1e3'),
        postings('0'),
        postings('-1'),
        postings('1', 2),
      ])
        await assert.rejects(() => post(value));
      await post(postings('9007199254740993000'));
      assert.equal(
        (await db.query(`select count(*)::integer as count from public.ledger_postings`)).rows[0]
          .count,
        2,
      );
      for (const role of ['anon', 'authenticated', 'service_role']) {
        const acl = await db.query(
          `select has_table_privilege($1,'public.ledger_journals','truncate') as allowed`,
          [role],
        );
        assert.equal(acl.rows[0].allowed, false);
      }
    } finally {
      await db.close();
    }
  },
);
