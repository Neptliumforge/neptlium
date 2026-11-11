import test from 'node:test';
import assert from 'node:assert/strict';
import { combined } from './gate01c/schema.mjs';
import { sql } from './gate01c/isolation.mjs';
const enabled=process.env.NEPTLIUM_GATE01B_ALLOW_DISPOSABLE_SQL==='1'&&Boolean(process.env.NEPTLIUM_GATE01C_CONTAINER_ID);
const owner='22222222-2222-4222-8222-222222222222';
test('dependency security: missing consent or investor classification cannot provision/initialize', {skip:!enabled}, async()=>{
  const {name,db}=await combined();
  const valid={firstName:'Isolated',lastName:'Fixture',country:'GB',investorType:'individual',acceptedTerms:true};
  for(const changed of [{acceptedTerms:undefined},{investorType:undefined},{acceptedTerms:null},{investorType:null}]) {
    const payload=JSON.stringify({...valid,...changed});
    await assert.rejects(()=>sql(name,`begin;set local role service_role;select public.complete_account_onboarding('${owner}','${payload}');commit;`),/invalid onboarding/);
  }
  assert.equal((await db.query(`select count(*)::integer as count from public.capital_ledger_initializations`)).rows[0].count,0);
});
test('dependency security: initialization facts give service role exactly SELECT privilege', {skip:!enabled}, async()=>{
  const {db}=await combined();
  for(const privilege of ['INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) {
    const result=await db.query(`select has_table_privilege('service_role','public.capital_ledger_initializations',$1) as allowed`,[privilege]);
    assert.equal(result.rows[0].allowed,false,privilege);
  }
});
