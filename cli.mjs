import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { nativeAccount } from './native.mjs';

const [operation, argument] = process.argv.slice(2);
assert(['gate', 'remember', 'recall'].includes(operation), 'Use gate, remember <feedback-file>, or recall <export-profile>.');
if (operation === 'remember') assert(process.env.MEMWAL_NAMESPACE, 'Set MEMWAL_NAMESPACE to the namespace for your new experience.');
const { gate, client } = await nativeAccount();
if (operation === 'gate') {
  console.log(JSON.stringify(gate, null, 2));
} else if (operation === 'remember') {
  const accepted = await client.rememberAsync(readFileSync(argument, 'utf8'));
  console.log(JSON.stringify({ accepted }));
  const result = await client.waitForRememberJob(accepted.job_id, { timeoutMs: 120000, pollIntervalMs: 2500 });
  console.log(JSON.stringify(result, null, 2));
} else {
  assert(argument, 'Name the export profile to recall.');
  console.log(JSON.stringify(await client.recall({
    query: `For export profile ${argument}, how should I resolve the recipient of a new payment draft?`, limit: 5 }), null, 2));
}
