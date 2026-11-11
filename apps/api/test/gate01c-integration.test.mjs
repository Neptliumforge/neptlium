import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { combined } from './gate01c/schema.mjs';
import { sql } from './gate01c/isolation.mjs';
const enabled=process.env.NEPTLIUM_GATE01B_ALLOW_DISPOSABLE_SQL==='1'&&Boolean(process.env.NEPTLIUM_GATE01C_CONTAINER_ID);
const owner='22222222-2222-4222-8222-222222222222';
const suspended='11111111-1111-4111-8111-111111111111';
const onboarding=JSON.stringify({firstName:'Isolated',lastName:'Fixture',country:'GB',investorType:'individual',acceptedTerms:true});

test('combined native schema: profile containment, one-time provisioning and ledger initialization', {skip:!enabled},async()=>{
  const {db,name}=await combined();
  assert.equal((await db.query(`select count(*)::integer as count from public.capital_ledger_initializations`)).rows[0].count,0);
  for(const statement of [`update public.profiles set compliance_status='active' where id=auth.uid()`,
    `update public.profiles set provisioned_at=now() where id=auth.uid()`,
    `update public.profiles set organization_id=gen_random_uuid() where id=auth.uid()`,
    `truncate public.profiles cascade`,
    `select public.initialize_capital_ledger('${owner}','BACKFILL')`,
    `select public.canonical_capital_balance_summary('${owner}')`])
    await assert.rejects(()=>sql(name,`begin;set local request.jwt.claim.sub='${owner}';set local role authenticated;${statement};commit;`),/permission denied/);
  const before=(await db.query(`select provisioned_at from public.profiles where id=$1`,[suspended])).rows[0].provisioned_at;
  await sql(name,`begin;set local role service_role;select public.complete_account_onboarding('${suspended}','${onboarding}');commit;`,'inactive_onboarding_replay');
  const inactive=(await db.query(`select compliance_status,provisioned_at from public.profiles where id=$1`,[suspended])).rows[0];
  assert.equal(inactive.compliance_status,'suspended');assert.equal(inactive.provisioned_at,before);
  await Promise.all([1,2].map(()=>sql(name,`begin;set local role service_role;select public.complete_account_onboarding('${owner}','${onboarding}');commit;`,'concurrent_onboarding')));
  const summary=(await db.query(`select public.canonical_capital_balance_summary($1) as summary`,[owner])).rows[0].summary;
  assert.ok(summary.initialized_at);assert.deepEqual(summary.balances,[]);
  assert.equal((await db.query(`select count(*)::integer as count from public.capital_ledger_initializations`)).rows[0].count,1);
  const replay=(await db.query(`select public.initialize_capital_ledger($1,'ONBOARDING') as time`,[owner])).rows[0].time;
  assert.equal(replay,summary.initialized_at);
  assert.equal((await db.query(`select count(*)::integer as count from public.ledger_postings`)).rows[0].count,0);
  for(const verb of ['insert into public.capital_ledger_initializations(owner_id,source) values(\''+suspended+'\',\'BACKFILL\')','truncate public.capital_ledger_initializations'])
    await assert.rejects(()=>sql(name,`begin;set local role service_role;${verb};commit;`),/permission denied/);
  const count=await sql(name,`begin;set local request.jwt.claim.sub='${owner}';set local role authenticated;select count(*) from public.profiles;commit;`,'owner_scoped_profile_read');
  assert.equal(count,'1');
});

async function accounts(db) {
  return (await db.query(`insert into public.ledger_accounts(owner_id,account_code,asset,network,account_class) values
    ($1,'capital:available','USDC','BASE','liability'),(null,'treasury:pending','USDC','BASE','asset'),
    (null,'treasury:reconciled','USDC','BASE','asset'),(null,'treasury:pending','USDC','OTHER','asset') returning id`,[owner])).rows.map(row=>row.id);
}
const leg=(id,direction,amount='1',network='BASE')=>({account_id:id,asset:'USDC',network,direction,amount_atomic:amount});
const post=(db,values,reference=randomUUID())=>db.query(`select public.post_balanced_journal($1,'isolated',$2,'request',null,$3) as journal`,[owner,reference,values]);

test('combined native ledger: exact aggregation, immutable history, idempotency and deferred commit invariants', {skip:!enabled},async()=>{
  const {db,name}=await combined();const a=await accounts(db);const amount='9007199254740993123456789';const reference=randomUUID();
  await post(db,[leg(a[0],'credit',amount),leg(a[1],'debit',amount)],reference);
  const summary=(await db.query(`select public.canonical_capital_balance_summary($1) as summary`,[owner])).rows[0].summary;
  assert.equal(summary.balances[0].available_atomic,amount);
  await assert.rejects(()=>post(db,[leg(a[0],'credit',amount),leg(a[1],'debit',amount)],reference),/duplicate key/);
  for(const values of [null,[],[leg(a[0],'credit','1.4'),leg(a[1],'debit','1.4')],[leg(a[0],'credit','1e3'),leg(a[1],'debit','1e3')],
    [leg(a[0],'credit'),leg(a[3],'debit','1','OTHER')],[leg(a[0],'credit','0'),leg(a[1],'debit','0')]]) await assert.rejects(()=>post(db,values));
  for(const statement of [`insert into public.ledger_journals(owner_id,source_type,source_id,request_id) values('${owner}','empty',gen_random_uuid(),'request')`,
    `update public.ledger_postings set amount_atomic=1`,`delete from public.ledger_journals`])
    await assert.rejects(()=>sql(name,`${statement};`),/empty|append-only/);
  for(const role of ['anon','authenticated','service_role']) for(const table of ['ledger_accounts','ledger_journals','ledger_postings'])
    await assert.rejects(()=>sql(name,`begin;set local role ${role};truncate public.${table} cascade;commit;`),/permission denied/);
  assert.equal((await db.query(`select count(*)::integer as count from public.ledger_journals`)).rows[0].count,1);
});

test('negative control: canonical main posting permits fractional rounding defect fixed by proposal', {skip:!enabled},async()=>{
  const {db}=await combined({harden:false});const a=await accounts(db);
  await post(db,[leg(a[0],'credit','2.8'),leg(a[1],'debit','1.4'),leg(a[2],'debit','1.4')]);
  const rows=await db.query(`select sum(case when direction='debit' then amount_atomic else -amount_atomic end)::text as imbalance from public.ledger_postings`);
  assert.equal(rows.rows[0].imbalance,'-1');
});
