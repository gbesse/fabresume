import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { appendRecoveryEvents } from '../src/index.js';
const demo = () => JSON.parse(fs.readFileSync('fixtures/demo.json'));
for (const locale of ['fr', 'en', 'es'])
  test(`append inspection ${locale}`, () => {
    const d = demo(),
      before = JSON.stringify(d),
      last = d.journal.at(-1);
    const result = appendRecoveryEvents(
      d,
      [
        {
          id: 'new-inspect',
          seq: last.seq + 1,
          operationId: 'deposit',
          attemptId: 'deposit-1',
          type: 'inspection',
          physicalOutcome: 'not_applied',
        },
      ],
      { locale },
    );
    assert.equal(result.input.journal.length, d.journal.length + 1);
    assert.equal(JSON.stringify(d), before);
    assert.equal(result.report.plan.find((x) => x.id === 'deposit').action, 'new_attempt');
  });
test('invalid sequence leaves original journal untouched', () => {
  const d = demo(),
    before = JSON.stringify(d);
  assert.throws(() => appendRecoveryEvents(d, [d.journal[0]]));
  assert.equal(JSON.stringify(d), before);
});
