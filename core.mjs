// The interactive demo executes a learned rule. Recorded model generations live in experiment/.
export function experienceFrom(result, profile = 'harbor-erp-v3') {
  for (const item of result.results || []) {
    let value;
    try { value = JSON.parse(item.text); } catch { continue; }
    const feedback = value.feedback;
    if (value.product === 'PayPatch' && value.kind === 'observed_exporter_operating_experience'
      && feedback?.export_profile === profile
      && feedback.source === 'frozen-export-contract-validator'
      && feedback.observed_receipt?.status === 'HOLD_RECORDED'
      && ['ref_a', 'ref_b'].includes(feedback.operating_rule?.recipient_field)) {
      // Publish the operating rule and provenance, keeping the account gate's identifiers private.
      return { export_profile: profile, source: feedback.source,
        recipient_field: feedback.operating_rule.recipient_field,
        field_meanings: feedback.operating_rule.field_meanings,
        receipt_id: feedback.observed_receipt.receipt_id,
        receipt_status: feedback.observed_receipt.status,
        blob_id: item.blob_id, created_at: item.created_at };
    }
  }
  return null;
}

export function stageDraft(task, experience) {
  const hold = reason => ({ status: 'HOLD_RECORDED', reason, draft: null });
  if (!task || typeof task.invoice_id !== 'string' || !task.invoice_id.trim()) return hold('Give this invoice an ID.');
  if (!Number.isSafeInteger(task.amount_minor) || task.amount_minor <= 0) return hold('Use a positive whole-number amount in minor units.');
  if (!experience || experience.export_profile !== task.export_profile) return hold('Recall trusted experience for this exporter before staging a draft.');
  const field = experience.recipient_field;
  if (!['ref_a', 'ref_b'].includes(field)) return hold('This experience needs a supported reference field.');
  const reference = task[field];
  const recipient = task.directory?.[reference]?.recipient_id;
  if (typeof reference !== 'string' || !reference.trim() || typeof recipient !== 'string' || !recipient.trim()) {
    return hold(`Add the current directory recipient for ${field}.`);
  }
  return { status: 'DRAFT_STAGED', reason: `${field} identifies the contract counterparty; resolve ${reference} from this invoice's directory.`,
    draft: { invoice_id: task.invoice_id, recipient_id: recipient, amount_minor: task.amount_minor },
    evidence: { recipient_field: field, reference, memory_blob: experience.blob_id } };
}
