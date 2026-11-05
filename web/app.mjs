import { experienceFrom, stageDraft } from './core.mjs';
const $ = id => document.getElementById(id);
const read = async file => { const response = await fetch(file); if (!response.ok) throw new Error(`Load failed: ${file}`); return response.json(); };
let experience = null, mode = 'recorded';
const config = await read('config.json').catch(() => ({}));
const template = await read('experiment/warm-task.json');
const taskFromForm = () => ({ ...template, invoice_id: $('invoice-id').value.trim(), amount_minor: Number($('amount').value),
  directory: { R68: { recipient_id: $('recipient-a').value.trim() }, R91: { recipient_id: $('recipient-b').value.trim() } } });
const element = (tag, value) => { const el = document.createElement(tag); el.textContent = value; return el; };
function emptyReceipt() {
  $('receipt').className = 'draft-receipt';
  $('receipt').replaceChildren(element('h3', 'Your next action'), element('p', 'Stage with empty history to see a hold, or recall the experience first.'));
}
function reset() {
  experience = null; emptyReceipt();
  $('memory-rule').replaceChildren(element('span', 'History is empty'), element('strong', '?'), element('p', 'Recall the trusted exporter feedback to connect these sessions.'));
  $('recall-status').textContent = mode === 'recorded' ? 'The saved mainnet experience is ready to replay.' : 'Read the account gate and original experience from mainnet.';
  $('memory-provenance').replaceChildren();
  $('provenance').open = false;
}
function setMode(next) {
  mode = next;
  for (const name of ['recorded', 'live']) { $(name + '-mode').classList.toggle('selected', name === mode); $(name + '-mode').setAttribute('aria-pressed', String(name === mode)); }
  reset();
}
$('recorded-mode').onclick = () => setMode('recorded');
$('live-mode').onclick = () => setMode('live');
$('reset').onclick = reset;
$('invoice-form').addEventListener('input', emptyReceipt);
$('recall').onclick = async () => {
  for (const id of ['recall', 'recorded-mode', 'live-mode', 'reset']) $(id).disabled = true;
  $('recall').textContent = 'Recalling…'; $('recall-status').textContent = mode === 'live' ? 'Tatum account read, then encrypted Walrus recall…' : 'Opening the actual recorded native recall…';
  try {
    let evidence;
    if (mode === 'live') {
      const endpoint = config.live_endpoint || (location.hostname === '127.0.0.1' || location.hostname === 'localhost' ? '/api/recall' : null);
      if (!endpoint) throw new Error('Choose recorded proof, or run the native adapter locally for live mainnet recall.');
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(45000) });
      evidence = await response.json();
      if (!response.ok) throw new Error(evidence.error || 'Live recall stopped. Choose recorded proof or retry.');
      experience = evidence.experience;
    } else {
      const [recall, gate] = await Promise.all([read('experiment/recalled-experience.json'), read('experiment/chain-proof.json')]);
      experience = experienceFrom(recall);
      evidence = { mode: 'recorded', recalled_at: '2026-11-03T23:23:19Z', gate };
    }
    if (!experience) throw new Error('This namespace needs the trusted exporter experience.');
    $('memory-rule').replaceChildren(element('span', 'Contract counterparty field'), element('strong', experience.recipient_field), element('p', 'Resolve this reference in the current task’s directory.'));
    $('recall-status').textContent = mode === 'live' ? `Live mainnet read completed ${new Date(evidence.recalled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}. Active account, authorized delegate.` : 'Actual mainnet recall, recorded November 3, 2026 UTC.';
    $('memory-provenance').replaceChildren();
    for (const [key, value] of [['Source', mode === 'live' ? 'Live Walrus native recall' : 'Recorded Walrus native recall'], ['Receipt', experience.receipt_id + ' / ' + experience.receipt_status], ['Blob ID', experience.blob_id], ['Account read', evidence.gate.transport], ['Delegate', 'Active and authorized'], ['Rule', experience.recipient_field + ' → current directory']]) {
      const row = document.createElement('div'); row.append(element('dt', key), element('dd', value)); $('memory-provenance').append(row);
    }
    emptyReceipt();
  } catch (error) { experience = null; $('recall-status').textContent = error.message; }
  finally { for (const id of ['recall', 'recorded-mode', 'live-mode', 'reset']) $(id).disabled = false; $('recall').textContent = 'Recall experience'; }
};
$('invoice-form').onsubmit = event => {
  event.preventDefault(); const result = stageDraft(taskFromForm(), experience);
  $('receipt').replaceChildren();
  if (result.draft) {
    $('receipt').className = 'draft-receipt staged'; $('receipt').append(element('h3', 'Draft staged'));
    const list = document.createElement('dl');
    for (const [key, value] of [['Invoice', result.draft.invoice_id], ['Recipient', result.draft.recipient_id], ['Amount', result.draft.amount_minor.toLocaleString('en-US') + ' minor units']]) { const row = document.createElement('div'); row.append(element('dt', key), element('dd', value)); list.append(row); }
    $('receipt').append(list);
  } else { $('receipt').className = 'draft-receipt held'; $('receipt').append(element('h3', 'Hold recorded'), element('p', result.reason)); }
};
if (config.film_ready) { $('film').hidden = false; if (location.hash === '#film') $('film').scrollIntoView({ block: 'start' }); }
