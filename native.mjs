import { createPrivateKey, createPublicKey } from 'node:crypto';
import assert from 'node:assert/strict';
import { MemWal } from '@mysten-incubation/memwal';

export async function nativeAccount(env = process.env) {
  const { MEMWAL_PRIVATE_KEY, MEMWAL_ACCOUNT_ID, TATUM_API_KEY } = env;
  assert(MEMWAL_PRIVATE_KEY && MEMWAL_ACCOUNT_ID && TATUM_API_KEY, 'Set the three integration credentials.');
  const privateBytes = Buffer.from(MEMWAL_PRIVATE_KEY.replace(/^0x/, ''), 'hex');
  assert.equal(privateBytes.length, 32);
  const pkcs8 = Buffer.concat([Buffer.from('302e020100300506032b657004220420', 'hex'), privateBytes]);
  const publicBytes = createPublicKey(createPrivateKey({ key: pkcs8, type: 'pkcs8', format: 'der' }))
    .export({ type: 'spki', format: 'der' }).subarray(-32);
  const query = 'query MemoryAccount($id: SuiAddress!) { object(address: $id) { address version asMoveObject { contents { type { repr } json } } } }';
  const response = await fetch('https://sui-mainnet.gateway.tatum.io/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': TATUM_API_KEY },
    body: JSON.stringify({ query, variables: { id: MEMWAL_ACCOUNT_ID }, operationName: 'MemoryAccount' }),
    signal: AbortSignal.timeout(25000) });
  assert(response.ok, `Tatum HTTP ${response.status}`);
  const data = await response.json();
  assert(!data.errors, 'Tatum returned a GraphQL error.');
  const object = data.data.object;
  assert.equal(object.address, MEMWAL_ACCOUNT_ID);
  const account = object.asMoveObject.contents.json;
  assert(object.asMoveObject.contents.type.repr.endsWith('::account::MemWalAccount'));
  assert(account.active && !account.admin_quarantined);
  assert(account.delegate_keys.some(k => Buffer.from(k.public_key, 'base64').equals(publicBytes)), 'Current account authorizes this delegate.');
  return { gate: { account_match: true, delegate_authorized: true, active: true,
    object_version: object.version, transport: 'Tatum Sui Gateway GraphQL', checked_at: new Date().toISOString() },
    client: MemWal.create({ key: MEMWAL_PRIVATE_KEY, accountId: MEMWAL_ACCOUNT_ID,
      serverUrl: 'https://relayer.memory.walrus.xyz', namespace: env.MEMWAL_NAMESPACE || 'gain-totalrecall-learning379' }) };
}
