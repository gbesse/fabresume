import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compareRecoveryBranches } from '../src/index.js';
const input = () => JSON.parse(fs.readFileSync('fixtures/demo.json', 'utf8'));
test('independent recovery branches keep base journal unchanged in all languages', () => {
  for (const locale of ['fr', 'en', 'es']) {
    const base = input(),
      last = base.journal.at(-1),
      event = {
        id: 'next',
        seq: last.seq + 1,
        operationId: 'deposit',
        attemptId: 'deposit-1',
        type: 'inspection',
        physicalOutcome: 'applied',
      };
    const original = structuredClone(base);
    const x = compareRecoveryBranches(
      base,
      [
        { id: 'a', events: [event] },
        { id: 'b', events: [event] },
      ],
      { locale },
    );
    assert.equal(x.length, 2);
    assert.deepEqual(base, original);
    assert.equal(x[0].commandsExecuted, false);
    assert.deepEqual(x[0].report, x[1].report);
  }
});
test('duplicate branch identities rejected', () =>
  assert.throws(() =>
    compareRecoveryBranches(input(), [
      { id: 'a', events: [] },
      { id: 'a', events: [] },
    ]),
  ));
