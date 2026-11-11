import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { newDatabase, sql, handle } from './gate01c/isolation.mjs';
const enabled = process.env.NEPTLIUM_GATE01B_ALLOW_DISPOSABLE_SQL === '1' && Boolean(process.env.NEPTLIUM_GATE01C_CONTAINER_ID);
const owner='11111111-1111-4111-8111-111111111111';
async function setup() {
  const name=await newDatabase('security');const db=handle(name);
  for(const path of ['fixture.sql','webhook-fencing.sql','ledger-hardening.sql']) await db.exec(await readFile(new URL(`../../../docs/engineering/proposals/gate-01b/${path}`,import.meta.url),'utf8'));
  await db.query(`insert into public.subscriptions(id,user_id,plan,stripe_customer_id,stripe_subscription_id) values('22222222-2222-4222-8222-222222222222',$1,'pro','cus_1','sub_1'),('33333333-3333-4333-8333-333333333333',$1,'elite','cus_2','sub_2')`,[owner]);
  await db.exec(`insert into public.stripe_subscription_bindings values('22222222-2222-4222-8222-222222222222','test','cus_1','sub_1','pro'),('33333333-3333-4333-8333-333333333333','test','cus_2','sub_2','elite')`);
  return {db,name};
}
const payload=(id)=>({id,created:100,livemode:false,type:'customer.subscription.updated',data:{object:{id:'sub_1',customer:'cus_1',status:'canceled'}}});
async function seed(db,value,provider='stripe',environment='test') {
  await db.query(`insert into public.provider_webhook_inbox(provider,environment,provider_event_id,payload,payload_digest,signature_verified_at) values($1,$2,$3,$4,'test-only',now())`,[provider,environment,value.id,value]);
  return (await db.query(`select public.claim_provider_webhook_v2($1,$2,$3) as claim`,[provider,environment,value.id])).rows[0].claim;
}
const command=(p)=>({action:'subscription_update',command:{kind:'sync_subscription',customerId:'cus_1',subscriptionId:'sub_1',status:'canceled',environment:'test',eventId:p.id,eventCreated:p.created}});
const finish=(db,p,token,d,provider='stripe',environment='test')=>db.query(`select public.finish_provider_webhook_v2($1,$2,$3,$4,$5)`,[provider,environment,p.id,token,d]);

test('native adversarial: signed payload identity/status cannot be replaced by caller command', {skip:!enabled},async()=>{
  const {db}=await setup();
  for(const mutate of [d=>{d.command.status='active';},d=>{d.command.customerId='cus_2';d.command.subscriptionId='sub_2';}]) {
    const p=payload(`evt_${randomUUID().replaceAll('-','')}`);const lease=await seed(db,p);const d=command(p);mutate(d);
    await assert.rejects(()=>finish(db,p,lease.token,d),/payload|binding|scope/);
  }
});

test('native concurrency: separate connections acquire one token and complete exactly once', {skip:!enabled},async()=>{
  const {db,name}=await setup();const p=payload('evt_race');
  await db.query(`insert into public.provider_webhook_inbox(provider,environment,provider_event_id,payload,payload_digest,signature_verified_at) values('stripe','test',$1,$2,'test-only',now())`,[p.id,p]);
  const claims=await Promise.all(Array.from({length:8},()=>db.query(`select public.claim_provider_webhook_v2('stripe','test',$1) as claim`,[p.id])));
  const acquired=claims.map(r=>r.rows[0].claim).filter(c=>c.acquired);assert.equal(acquired.length,1);
  const outcomes=await Promise.allSettled([finish(db,p,acquired[0].token,command(p)),finish(db,p,acquired[0].token,command(p))]);
  assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);
  const state=(await db.query(`select attempts,processing_state from public.provider_webhook_inbox`)).rows[0];
  assert.equal(state.attempts,1);assert.equal(state.processing_state,'processed');
  await assert.rejects(()=>sql(name,`begin;set local role authenticated;select public.claim_provider_webhook_v2('stripe','test','evt_race');commit;`),/permission denied/);
});

test('native adversarial: Alchemy observation must match signed activity and valid exact evidence', {skip:!enabled},async()=>{
  const {db}=await setup(); const route=randomUUID(), intent=randomUUID(), destination=randomUUID();
  await db.query(`insert into public.deposit_routes(id,funding_intent_id,treasury_destination_id,environment,asset,network,deposit_address) values($1,$2,$3,'live','USDC','BASE',$4)`,[route,intent,destination,`0x${'4'.repeat(40)}`]);
  const value={id:'alchemy_test',webhookId:'wh_test',type:'ADDRESS_ACTIVITY',createdAt:'2026-11-11T00:00:00Z',event:{network:'BASE_MAINNET',activity:[{hash:`0x${'1'.repeat(64)}`} ]}};
  const evidence={canonical:false,environment:'LIVE',source:'ALCHEMY',chainId:8453,asset:'USDC',network:'BASE',receiptStatus:'SUCCESS',tokenContract:'0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',tokenDecimals:6,transferType:'ERC20',transactionHash:`0x${'2'.repeat(64)}`,txHash:`0x${'2'.repeat(64)}`,blockHash:`0x${'3'.repeat(64)}`,blockNumber:'0x10',logIndex:0,rawAtomicAmount:'1000000',amountAtomic:'1000000',sender:`0x${'5'.repeat(40)}`,recipient:`0x${'4'.repeat(40)}`,address:`0x${'4'.repeat(40)}`,depositRouteId:route,fundingIntentId:intent,treasuryDestinationId:destination,observedAt:'2026-11-11T00:00:00Z',confirmations:1,finalityState:'CONFIRMING',state:'observed'};
  const lease=await seed(db,value,'alchemy','live');
  await assert.rejects(()=>finish(db,value,lease.token,{action:'evidence_recorded',observations:[evidence]},'alchemy','live'),/observation|payload/);
  evidence.transactionHash=value.event.activity[0].hash;evidence.txHash=evidence.transactionHash;
  for(const changed of [{rawAtomicAmount:'1e6'},{logIndex:-1},{confirmations:-1},{canonical:'false'},{blockHash:'unknown'}])
    await assert.rejects(()=>finish(db,value,lease.token,{action:'evidence_recorded',observations:[{...evidence,...changed}]},'alchemy','live'),/observation/);
  await finish(db,value,lease.token,{action:'evidence_recorded',observations:[evidence]},'alchemy','live');
  assert.equal((await db.query(`select count(*)::integer as count from public.provider_observation_evidence_v2`)).rows[0].count,1);
  assert.equal((await db.query(`select count(*)::integer as count from public.ledger_journals`)).rows[0].count,0);
});
