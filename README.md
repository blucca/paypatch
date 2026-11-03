# PayPatch

**Learn an export format once. Act on the next invoice.**

A small agent-runtime experiment: trusted feedback from an executed task becomes encrypted Walrus Memory. A fresh agent recalls that experience, resolves today's counterparties, and stages a correct payment draft in a fictional local ledger.

## Observed learning loop

| Session | Available experience | Executed result |
|---|---|---|
| Cold: `INV-101` | Empty | `HOLD_RECORDED` — reference-field roles need clarification |
| Warm: `INV-202` | Actual native Walrus recall | `DRAFT_STAGED` — current `R91 → demo:fir`, 9,800 minor units |

The two fresh `gpt-6.1-sol` sessions used identical task instructions. The second task changed its invoice, references, amount and every recipient. The stored experience contains the first action receipt and the export-profile rule; the new recipient is resolved from the second task's directory.

**The measured effect is cross-session business-knowledge continuity.** History availability is the intervention. The experiment covers one fictional exporter profile and two tasks.

## Native integration

- Mainnet MemWal Account and delegate were registered using the official sponsored setup.
- Tatum's free Sui Gateway read the real Account and its active delegate before the memory operation.
- `@mysten-incubation/memwal` stored the observed feedback in a fresh namespace, completed its job, and returned a Walrus blob ID.
- Native recall returned that experience; the fresh agent used its rule in the next executed action.
- The execution target is a sandbox payment-draft ledger. All business samples are fictional.

The live Tatum gateway advertised **GraphQL** through `/_methods` and `/llms.txt`; the legacy JSON-RPC root returned HTTP 404. The CLI uses the actual advertised endpoint.

## Replay the recorded result

```sh
python3 experiment/check.py
```

`experiment/` contains the frozen sandbox contract, both prompts and actions, actual trusted feedback, stored/returned experience, native memory proof and resulting ledger. Account identifiers are redacted in this public export. Exact original API responses and private credentials remain in private storage.

## Use the native adapter

```sh
npm install
export MEMWAL_PRIVATE_KEY=...  # registered Ed25519 delegate, 32-byte hex
export MEMWAL_ACCOUNT_ID=...   # existing mainnet MemWal Account
export TATUM_API_KEY=...       # mainnet Tatum key
node cli.mjs gate
node cli.mjs remember experiment/stored-experience.json
node cli.mjs recall harbor-erp-v3
```

The adapter reads Account activation and delegate membership through Tatum on each invocation. Walrus handles embedding, encryption, storage and decrypted retrieval. Keep credentials in the environment.

Built with Codex. This repository publishes the bounded technical pilot; product UI and formal competition entry follow the remaining entry fields.
