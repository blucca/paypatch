# An invoice changed. The lesson stayed.

## A PayPatch learning loop, with receipts

An accounts-payable operator repeatedly receives exports from the same enterprise system. Invoice numbers, amounts and counterparties change; the exporter's field conventions persist. PayPatch explores retaining a verified convention across agent sessions, then applying it to the current directory. The intended paying user operates recurring enterprise-export or AP automation.

The experiment uses fictional invoices and a local payment-draft ledger. Its evidence is two recorded, fresh `gpt-6.1-sol` sessions, actual sandbox execution, one encrypted mainnet Walrus experience and actual SDK retrieval. The measured scope is one fictional exporter profile and two tasks. History availability is the designed intervention; the model and instruction text stay fixed.

The [recorded experiment](../experiment/result.json) completed on **3 November 2026 UTC**. The public workbench separates those recorded observations from today's native reads and editable sandbox execution.

## Freeze the contract, then observe the cold action

Before either model session, the validator's [export contract](../experiment/sandbox-contract.json) was frozen for `harbor-erp-v3`. In that profile, `ref_a` identifies the booking entity and `ref_b` identifies the contract counterparty. The task uses neutral reference names, so identifying the receiving party requires knowledge of that convention.

The first session received `INV-101`, 12,500 minor units, references `R17` and `R42`, and a directory containing `demo:larch` and `demo:birch`. Its experience list was empty. The shared instructions explicitly choose `HOLD` when reference-field roles have a knowledge gap.

The model returned `HOLD`. The sandbox actually recorded `sandbox-action-001` as `HOLD_RECORDED`, with zero drafts. That is the workflow's valid cold state: the operator has a concrete clarification requirement before draft creation. Both the [action](../experiment/cold-action.json) and its executed receipt remain part of the evidence.

The contract was frozen at 22:50:11 UTC; the HOLD receipt was executed at 22:50:56 UTC. Feedback followed that receipt. This ordering makes the learning event inspectable: execution first, trusted evaluation second, persistence third.

## Store an observed lesson

The frozen-contract validator produced [feedback](../experiment/feedback.json) identifying `ref_b` as the counterparty field. Its reusable rule is:

`current task.directory[current task[recipient_field]].recipient_id`

The experience envelope combines that rule with the observed HOLD receipt, exporter profile, feedback source, fictional-sandbox marker and account-gate proof. Its [public export](../experiment/stored-experience.json) redacts account identifiers. The receipt explains where the lesson came from; the operating rule explains how a later task should use it.

The official `@mysten-incubation/memwal` SDK, pinned to `0.1.12`, submitted this envelope with `rememberAsync`. The adapter waited for the job's terminal `done` status and recorded its Walrus blob ID. This experience lives in `gain-totalrecall-learning379`, isolated from ten earlier fictional pilot memories in another namespace. The account's original ten-plus-one completed records remain intact. Demonstration replay and live-read operation reuse them through reads.

The memory lifecycle has distinct receipts: write acceptance, terminal completion and decrypted retrieval. A completed write establishes the stored artifact; retrieval supplies the experience to the next session. Walrus Memory handles embedding, encryption, storage and authorized decrypted retrieval through the official relayer at `https://relayer.memory.walrus.xyz`.

A later correction belongs to a newly executed, reviewed episode. Existing receipts retain their audit role. The public files contain fictional business samples and sanitized proof; registered credentials stay on the server side.

## Put Tatum on the access path

[The native adapter](../cli.mjs) reads the real mainnet MemWal Account through **Tatum Sui Gateway GraphQL**:

`https://sui-mainnet.gateway.tatum.io/graphql`

The gateway's advertised `/_methods` and `/llms.txt` identified this transport during integration; the legacy JSON-RPC root returned HTTP 404. The actual account query returned HTTP 200.

Before memory access, the adapter checks the requested object address, its `::account::MemWalAccount` type, account activation, quarantine status and delegate membership. It derives the delegate's public key locally and compares it with the account's on-chain keys. Thus Tatum verifies that the configured account is active and authorizes the delegate used for the memory operation. An HTTP or GraphQL failure, object mismatch, inactive account, quarantine or missing delegate stops that access path.

The public workbench opens in recorded mode, identifying its historical date and file sources. Live recall connects to the read-only `/api/recall` endpoint, which performs this gate and SDK retrieval against the original learning namespace. Its response contains a sanitized operating rule and proof. Model action cards describe the two recorded generations; current directory edits run the workbench's deterministic draft kernel.

## Recall the rule, resolve today's identity

The second task changed its invoice to `INV-202`, amount to 9,800 minor units, references to `R68` and `R91`, and every recipient to `demo:elm` and `demo:fir`. The stored experience contains zero occurrences of that task's invoice, references or recipient identifiers. Those values belong to the current task.

Actual SDK recall returned the stored experience. A second fresh `gpt-6.1-sol` session received the same instruction text, the new task and this retrieved history. Its recorded output was `STAGE_PAYMENT_DRAFT`: resolve `ref_b` to `R91`, look up `R91` in today's directory, and stage 9,800 minor units for `demo:fir`. The sandbox executed `sandbox-action-002` and produced exactly that [ledger draft](../experiment/warm-ledger.json).

The persistent knowledge is a field convention. Recipient identity and amount come from the current input. After checking the matching profile, trusted rule, directory entry and positive safe-integer amount, the workbench can express the execution kernel in four lines:

```text
if matching trusted rule is absent: return HOLD
reference = task[rule.recipient_field]
recipient = task.directory[reference].recipient_id
return STAGE_PAYMENT_DRAFT(task.invoice_id, recipient, task.amount_minor)
```

Editing a directory recipient or amount therefore produces a new deterministic sandbox result. The original warm model action stays visible as a recorded observation. The execution target remains a draft ledger; financial settlement is outside this experiment's scope.

## Reproduce the evidence and continue

From the repository root, check the recorded evidence and start the local workbench:

```sh
python3 experiment/check.py
npm install
npm start
```

The check verifies action types, identical instruction prefixes, future-identifier isolation, stored/returned experience equality, the current-directory recipient, exact amount, completed native-memory proof and ledger contents. It reports the recorded HOLD-to-draft chain as a reproducible artifact check.

The Node standard-library server listens on loopback port `17612` by default. Follow the [README](../README.md) for credential environment-variable setup and the current public live-reader URL. With registered integration credentials configured, `node cli.mjs gate` checks today's account authorization. Read the original experience with:

```sh
MEMWAL_NAMESPACE=gain-totalrecall-learning379 node cli.mjs recall harbor-erp-v3
```

New writes require an explicitly selected namespace for the operator's own observed episodes. The original experiment is replayed through reads.

Operational boundaries are explicit. Absent matching experience keeps a task on HOLD. An unresolved directory reference or invalid minor-unit amount stops draft execution. Failed native access appears as a retrieval failure. A changed exporter convention needs reviewed feedback under a distinct versioned profile.

A next independent measurement would use a held-out fictional exporter profile, a contract frozen before inference, fresh invoice identifiers and a fresh directory. It preserves the same-instruction protocol and scores recipient selection, amount, HOLD behavior and receipt lineage. A new observed episode gets its own memory record and namespace. That extends the evidence one controlled profile at a time.
