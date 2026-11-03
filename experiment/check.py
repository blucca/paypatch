from pathlib import Path
import json
p=Path(__file__).resolve().parent
read=lambda n:json.loads((p/n).read_text())
cold,warm=read('cold-action.json'),read('warm-action.json')
task,contract=read('warm-task.json'),read('sandbox-contract.json')
assert cold['action']=='HOLD' and warm['action']=='STAGE_PAYMENT_DRAFT'
expected=task['directory'][task[contract['recipient_field']]]['recipient_id']
assert warm['recipient_id']==expected and warm['amount_minor']==task['amount_minor']
assert isinstance(warm['amount_minor'],int) and warm['amount_minor']>=0
assert read('warm-ledger.json')['drafts']==[{k:warm[k] for k in ['invoice_id','recipient_id','amount_minor']}]
for stage in ['cold','warm']:
 assert (p/(stage+'-prompt.txt')).read_text().split('\n\n',1)[0]==(p/'instructions.txt').read_text().strip()
experience=json.dumps(read('stored-experience.json'))
for v in [task['invoice_id'],task['ref_a'],task['ref_b']]+[d['recipient_id'] for d in task['directory'].values()]:
 assert v not in experience
recalled=read('recalled-experience.json')
assert any(json.loads(r['text'])==read('stored-experience.json') for r in recalled['results'])
assert read('memory-proof.json')['status']=='done' and read('chain-proof.json')['delegate_authorized']
assert read('result.json')['valid_generations']==2
print('PASS: actual HOLD -> mainnet experience -> recalled rule -> new sandbox draft')
