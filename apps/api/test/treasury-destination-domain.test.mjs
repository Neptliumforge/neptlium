import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  assertTreasuryDestinationSemantics,
  normalizeEvmAddress,
  normalizeTreasuryDestinationAddress,
  treasuryDestinationIdentityKey,
} from '../dist/treasury-destination-domain.js';

const migrationUrl = new URL(
  '../../../supabase/migrations/20260818120000_self_custody_treasury_destination_foundation.sql',
  import.meta.url,
);
const migration = await readFile(migrationUrl, 'utf8');

test('EVM treasury destinations are validated and normalized deterministically', () => {
  const mixed = '0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD';
  assert.equal(normalizeEvmAddress(mixed), mixed.toLowerCase());
  assert.equal(normalizeTreasuryDestinationAddress('EVM', mixed), mixed.toLowerCase());
  assert.throws(() => normalizeEvmAddress('0x1234'), /exactly 40 hexadecimal/);
  assert.throws(
    () => normalizeEvmAddress('abcdefabcdefabcdefabcdefabcdefabcdefabcd'),
    /exactly 40 hexadecimal/,
  );
  assert.throws(
    () => normalizeEvmAddress('0xgggggggggggggggggggggggggggggggggggggggg'),
    /exactly 40 hexadecimal/,
  );
});

const validSelfCustody = {
  controllerType: 'NEPTLIUM',
  custodyModel: 'SELF_CUSTODY',
  provider: null,
  providerTreasuryId: null,
  address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  normalizedAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  verificationState: 'PENDING_VERIFICATION',
  verificationMethod: null,
  verificationEvidenceDigest: null,
  verifiedAt: null,
  status: 'INACTIVE',
  activatedAt: null,
};

test('self-custody semantics are provider-free and address-bound', () => {
  assert.doesNotThrow(() => assertTreasuryDestinationSemantics(validSelfCustody));
  assert.throws(
    () =>
      assertTreasuryDestinationSemantics({
        ...validSelfCustody,
        provider: 'phantom',
      }),
    /Self-custody treasury destination semantics are inconsistent/,
  );
});

test('provider custody requires provider control and provider identity', () => {
  assert.throws(
    () =>
      assertTreasuryDestinationSemantics({
        ...validSelfCustody,
        controllerType: 'PROVIDER',
        custodyModel: 'PROVIDER_CUSTODY',
        address: null,
        normalizedAddress: null,
      }),
    /Provider-custody treasury destination semantics are inconsistent/,
  );
});

test('verified state requires method, evidence, and timestamp', () => {
  assert.throws(
    () =>
      assertTreasuryDestinationSemantics({
        ...validSelfCustody,
        verificationState: 'VERIFIED',
        verifiedAt: '2026-08-18T00:00:00.000Z',
      }),
    /requires method, evidence, and timestamp/,
  );
});

test('activation remains separate from ownership verification', () => {
  assert.throws(
    () =>
      assertTreasuryDestinationSemantics({
        ...validSelfCustody,
        status: 'ACTIVE',
      }),
    /requires completed verification and activation/,
  );
  assert.throws(
    () =>
      assertTreasuryDestinationSemantics({
        ...validSelfCustody,
        verificationState: 'VERIFIED',
        verificationMethod: 'governed_review',
        verificationEvidenceDigest: 'sha256:synthetic-evidence',
        verifiedAt: '2026-08-18T00:00:00.000Z',
        status: 'ACTIVE',
      }),
    /requires completed verification and activation/,
  );
  assert.doesNotThrow(() =>
    assertTreasuryDestinationSemantics({
      ...validSelfCustody,
      verificationState: 'VERIFIED',
      verificationMethod: 'governed_review',
      verificationEvidenceDigest: 'sha256:synthetic-evidence',
      verifiedAt: '2026-08-18T00:00:00.000Z',
      status: 'ACTIVE',
      activatedAt: '2026-08-18T00:01:00.000Z',
    }),
  );
});

test('invalid Solana public keys fail closed at the typed boundary', () => {
  assert.throws(
    () => normalizeTreasuryDestinationAddress('SOLANA', 'not-validated'),
    /exactly 32 bytes/,
  );
});

test('destination identity includes governed network', () => {
  const address = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
  const base = treasuryDestinationIdentityKey({
    environment: 'LIVE',
    asset: 'ETH',
    network: 'BASE',
    normalizedAddress: address,
  });
  const ethereum = treasuryDestinationIdentityKey({
    environment: 'LIVE',
    asset: 'ETH',
    network: 'ETHEREUM',
    normalizedAddress: address,
  });
  assert.notEqual(base, ethereum);
});

test('migration enforces custody, verification, lifecycle, and immutable identity invariants', () => {
  assert.match(
    migration,
    /custody_model = 'self_custody'[\s\S]*controller_type = 'neptlium'[\s\S]*provider is null[\s\S]*provider_treasury_id is null[\s\S]*address is not null/,
  );
  assert.match(
    migration,
    /custody_model = 'provider_custody'[\s\S]*controller_type = 'provider'[\s\S]*provider is not null/,
  );
  assert.match(
    migration,
    /status <> 'active'[\s\S]*verification_state = 'verified'[\s\S]*verified_at is not null[\s\S]*activated_at is not null/,
  );
  assert.match(migration, /environment, asset, network, normalized_address/);
  assert.match(migration, /nulls not distinct/);
  assert.match(migration, /treasury destination identity is immutable/);
  assert.match(migration, /treasury destination verification evidence is immutable/);
  assert.match(migration, /old\.status = 'retired'[\s\S]*new\.status <> 'retired'/);
});

test('migration contains no seeded destination address and keeps destination events append-only', () => {
  assert.doesNotMatch(migration, /0x3a1bf79e|bc1qqjt26|Hmmc5gGXd/i);
  assert.match(migration, /create_treasury_destination_candidate/);
  assert.match(migration, /treasury destination history is append-only/);
  assert.match(
    migration,
    /revoke all on public\.treasury_destination_events from public, anon, authenticated, service_role/,
  );
  assert.match(migration, /grant select on public\.treasury_destination_events to service_role/);
  assert.match(
    migration,
    /revoke insert, update, delete on public\.treasury_destinations from service_role/,
  );
  assert.doesNotMatch(migration, /retired_at\s*=\s*coalesce\(retired_at,\s*created_at\)/);
});
