import { readFileSync } from 'node:fs';
import { createPrivateKey, createPublicKey } from 'node:crypto';
import assert from 'node:assert/strict';
import { MemWal } from '@mysten-incubation/memwal';

const { MEMWAL_PRIVATE_KEY, MEMWAL_ACCOUNT_ID, TATUM_API_KEY } = process.env;
assert(MEMWAL_PRIVATE_KEY && MEMWAL_ACCOUNT_ID && TATUM_API_KEY, 'set the three integration credentials');
const privateBytes = Buffer.from(MEMWAL_PRIVATE_KEY.replace(/^0x/, ''), 'hex');
assert.equal(privateBytes.length, 32);
const pkcs8 = Buffer.concat([Buffer.from('302e020100300506032b657004220420', 'hex'), privateBytes]);
const publicBytes = createPublicKey(createPrivateKey({ key: pkcs8, type: 'pkcs8', format: 'der' }))
  .export({ type: 'spki', format: 'der' }).subarray(-32);

// Tatum's live gateway advertises GraphQL. Its former JSON-RPC root returned 404 in this pilot.
const query = 'query MemoryAccount($id: SuiAddress!) { object(address: $id) { address version asMoveObject { contents { type { repr } json } } } }';
const response = await fetch('https://sui-mainnet.gateway.tatum.io/graphql', {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': TATUM_API_KEY },
  body: JSON.stringify({ query, variables: { id: MEMWAL_ACCOUNT_ID }, operationName: 'MemoryAccount' }) });
assert(response.ok, `Tatum HTTP ${response.status}`);
const data = await response.json();
assert(!data.errors, JSON.stringify(data.errors));
const object = data.data.object;
assert.equal(object.address, MEMWAL_ACCOUNT_ID);
const account = object.asMoveObject.contents.json;
assert(object.asMoveObject.contents.type.repr.endsWith('::account::MemWalAccount'));
assert(account.active && !account.admin_quarantined);
assert(account.delegate_keys.some(k => Buffer.from(k.public_key, 'base64').equals(publicBytes)), 'current account authorizes this delegate');

const client = MemWal.create({ key: MEMWAL_PRIVATE_KEY, accountId: MEMWAL_ACCOUNT_ID,
  serverUrl: 'https://relayer.memory.walrus.xyz', namespace: 'paypatch' });
const [operation, argument] = process.argv.slice(2);
if (operation === 'gate') {
  console.log(JSON.stringify({ account_match: true, delegate_authorized: true, active: true,
    object_version: object.version, transport: 'Tatum Sui Gateway GraphQL' }, null, 2));
} else if (operation === 'remember') {
  const accepted = await client.rememberAsync(readFileSync(argument, 'utf8'));
  console.log(JSON.stringify({ accepted }));
  const result = await client.waitForRememberJob(accepted.job_id, { timeoutMs: 120000, pollIntervalMs: 2500 });
  console.log(JSON.stringify(result, null, 2));
} else {
  assert.equal(operation, 'recall', 'use gate, remember <feedback-file>, or recall <export-profile>');
  console.log(JSON.stringify(await client.recall({
    query: `For export profile ${argument}, how should I resolve the recipient of a new payment draft?`, limit: 5 }), null, 2));
}
