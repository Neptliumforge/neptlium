import assert from 'node:assert/strict';
import test from 'node:test';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { Signer as Bip322Signer } from 'bip322-js';
import {
  assertChallengeUsable,
  assertTreasuryActivationReady,
  issueTreasuryOwnershipChallenge,
  normalizeTreasuryDestinationAddress,
  treasuryDestinationIdentityKey,
  verifyEvmTreasuryOwnership,
  verifyBitcoinTreasuryOwnership,
} from '../dist/treasury-destination-domain.js';

const candidate = '0x3a1bf79e5d4adaeb2c5b5f8ad9e57b5339609be2';

test('Base and Ethereum accept a 20-byte EVM candidate but remain distinct identities', () => {
  const normalized = normalizeTreasuryDestinationAddress('EVM', candidate);
  assert.equal(normalized, candidate);
  assert.notEqual(
    treasuryDestinationIdentityKey({
      environment: 'LIVE',
      asset: 'USDC',
      network: 'BASE',
      normalizedAddress: normalized,
    }),
    treasuryDestinationIdentityKey({
      environment: 'LIVE',
      asset: 'ETH',
      network: 'ETHEREUM',
      normalizedAddress: normalized,
    }),
  );
});

test('invalid EVM address is rejected', () => {
  assert.throws(
    () => normalizeTreasuryDestinationAddress('EVM', '0x1234'),
    /exactly 40 hexadecimal/,
  );
});

test('Bitcoin mainnet Bech32 checksum is validated and testnet is rejected for LIVE identity', () => {
  assert.equal(
    normalizeTreasuryDestinationAddress('BITCOIN', 'bc1qqjt26jg07ygrzhqg4fc7m0gp9m76ev4jfyp827'),
    'bc1qqjt26jg07ygrzhqg4fc7m0gp9m76ev4jfyp827',
  );
  assert.throws(() =>
    normalizeTreasuryDestinationAddress('BITCOIN', 'bc1qqjt26jg07ygrzhqg4fc7m0gp9m76ev4jfyp828'),
  );
  assert.throws(() =>
    normalizeTreasuryDestinationAddress('BITCOIN', 'tb1qfm7xpszr7ps2se4wc8ev73kjqqe3jjcquv3ev7'),
  );
});

test('Solana address must decode to exactly 32 bytes and stays internal in registry policy', () => {
  assert.equal(
    normalizeTreasuryDestinationAddress('SOLANA', 'Hmmc5gGXd5Xb3yaj2RiWgY6uEiZRsxJHKZha2oEtWKxM'),
    'Hmmc5gGXd5Xb3yaj2RiWgY6uEiZRsxJHKZha2oEtWKxM',
  );
  assert.throws(() => normalizeTreasuryDestinationAddress('SOLANA', '1111'));
});

test('challenge is short-lived, purpose-bound, and expiry/replay fail closed', () => {
  const issued = issueTreasuryOwnershipChallenge(
    {
      destinationId: 'destination-1',
      normalizedAddress: candidate,
      network: 'BASE',
      networkIdentifier: 'base-mainnet',
      environment: 'LIVE',
    },
    new Date('2026-08-19T00:00:00Z'),
  );
  assert.match(issued.message, /NEPTLIUM_TREASURY_OWNERSHIP_VERIFICATION/);
  assert.match(issued.message, /base-mainnet/);
  assert.equal(
    new Date(issued.binding.expiresAt).getTime() - new Date(issued.binding.issuedAt).getTime(),
    300_000,
  );
  assert.throws(
    () =>
      assertChallengeUsable(
        { consumedAt: '2026-08-19T00:01:00Z', expiresAt: issued.binding.expiresAt, attempts: 1 },
        new Date('2026-08-19T00:02:00Z'),
      ),
    /already been consumed/,
  );
  assert.throws(
    () =>
      assertChallengeUsable(
        { consumedAt: null, expiresAt: issued.binding.expiresAt, attempts: 0 },
        new Date('2026-08-19T00:06:00Z'),
      ),
    /expired/,
  );
});

test('EVM personal-message verification accepts the bound signer and rejects another signer', async () => {
  const account = privateKeyToAccount(generatePrivateKey());
  const wrong = privateKeyToAccount(generatePrivateKey());
  const challenge = issueTreasuryOwnershipChallenge({
    destinationId: 'destination-1',
    normalizedAddress: account.address.toLowerCase(),
    network: 'BASE',
    networkIdentifier: 'base-mainnet',
    environment: 'LIVE',
  });
  const signature = await account.signMessage({ message: challenge.message });
  await verifyEvmTreasuryOwnership({
    address: account.address,
    message: challenge.message,
    signature,
  });
  const wrongSignature = await wrong.signMessage({ message: challenge.message });
  await assert.rejects(
    () =>
      verifyEvmTreasuryOwnership({
        address: account.address,
        message: challenge.message,
        signature: wrongSignature,
      }),
    /does not prove control/,
  );
});

test('ownership verification remains distinct from activation readiness', () => {
  assert.throws(
    () =>
      assertTreasuryActivationReady({
        asset: 'USDC',
        network: 'BASE',
        environment: 'LIVE',
        verificationState: 'VERIFIED',
        status: 'INACTIVE',
      }),
    /readiness has not been proven/,
  );
});

test('Bitcoin BIP-322 verifies a Phantom-compatible mainnet signature and rejects altered evidence', () => {
  const privateKey = 'L3VFeEujGtevx9w18HD1fhRbCH67Az2dpCymeRE1SoPK6XQtaN2k';
  const address = 'bc1q9vza2e8x573nczrlzms0wvx3gsqjx7vavgkx0l';
  const wrongAddress = 'bc1qqjt26jg07ygrzhqg4fc7m0gp9m76ev4jfyp827';
  const message = 'Neptlium deterministic BIP-322 ownership challenge';
  const signature = Bip322Signer.sign(privateKey, address, message);
  verifyBitcoinTreasuryOwnership({ address, message, signature });
  assert.throws(
    () => verifyBitcoinTreasuryOwnership({ address, message: message + '.', signature }),
    /does not prove control/,
  );
  assert.throws(
    () => verifyBitcoinTreasuryOwnership({ address: wrongAddress, message, signature }),
    /does not prove control/,
  );
  assert.throws(
    () => verifyBitcoinTreasuryOwnership({ address, message, signature: 'not-base64!' }),
    /Invalid Bitcoin BIP-322/,
  );
  assert.throws(
    () =>
      verifyBitcoinTreasuryOwnership({
        address: 'tb1q9vza2e8x573nczrlzms0wvx3gsqjx7vaxwd45v',
        message,
        signature,
      }),
    /valid mainnet/,
  );
});
