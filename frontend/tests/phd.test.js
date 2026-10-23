import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, validate, checks } from '../src/planner.js';
import {
  defaultPhd, phdFor, validPhd, applicationReadiness,
  confirmedFunding, selectPhdApplications, nextPhdActions,
} from '../src/phd.js';

function app(id, deadline = '', overrides = {}) {
  return {
    id, university: 'University ' + id, program: 'Computer Science', url: '',
    deadline, status: 'Researching', notes: '',
    checks: Object.fromEntries(checks.map(key => [key, false])),
    ...overrides,
  };
}
test('legacy v1 applications import without new fields and remain unchanged', () => {
  const state = initial();
  state.apps.push(app('legacy', '2027-01-10'));
  const saved = JSON.stringify(state);
  const restored = validate(JSON.parse(saved));
  assert.equal(JSON.stringify(restored), saved);
  assert.equal(restored.apps[0].phd, undefined);
  assert.equal(phdFor(restored.apps[0]).funding, 'Unknown');
});
test('new metadata survives backup round trips alongside original fields', () => {
  const state = initial();
  state.apps.push(app('funded', '2027-02-01', {
    phd: { ...defaultPhd(), funding: 'Fully funded', fundingEvidence: 'Verified',
      fundingUrl: 'https://university.example/funding', researchFit: '5',
      eligibility: 'Needs review', nextAction: 'Email lab', actionDue: '2026-11-02' },
  }));
  assert.deepEqual(validate(JSON.parse(JSON.stringify(state))), state);
  assert.equal(confirmedFunding(state.apps[0]), true);
});
test('metadata rejects invalid dates, unsafe URLs, invalid enums and extra keys', () => {
  assert.equal(validPhd({ ...defaultPhd(), actionDue: '2027-02-30' }), false);
  assert.equal(validPhd({ ...defaultPhd(), fundingUrl: 'javascript:alert(1)' }), false);
  assert.equal(validPhd({ ...defaultPhd(), funding: 'Guaranteed admission' }), false);
  assert.equal(validPhd({ ...defaultPhd(), fakeEligibilityScore: 100 }), false);
  assert.equal(validPhd({ ...defaultPhd(), eligibilityNotes: 'x'.repeat(5001) }), false);
  const state = initial();
  state.apps.push(app('bad', '', { phd: { ...defaultPhd(), requirementsUrl: 'data:text/html,evil' } }));
  assert.throws(() => validate(state));
});
test('readiness is exactly the original six document/evidence checklist items', () => {
  const first = app('1');
  assert.deepEqual(applicationReadiness(first), { completed: 0, total: 6, missing: checks });
  first.checks['CV ready'] = true;
  first.checks['Statement ready'] = true;
  assert.equal(applicationReadiness(first).completed, 2);
  assert.deepEqual(applicationReadiness(first).missing,
    checks.filter(key => !first.checks[key]));
});
test('funding is not confirmed from a claim, checkbox or an unlinked source', () => {
  const first = app('1', '', { phd: { ...defaultPhd(), funding: 'Fully funded' } });
  first.checks['Funding verified'] = true;
  assert.equal(confirmedFunding(first), false);
  first.phd.fundingEvidence = 'Verified';
  assert.equal(confirmedFunding(first), false);
  first.phd.fundingUrl = 'https://university.example/funding';
  assert.equal(confirmedFunding(first), true);
});
test('comparison sorts deterministically and respects all filters', () => {
  const first = app('low', '2027-01-05', { phd: { ...defaultPhd(), priority: 'Low', researchFit: '2' } });
  const second = app('high', '2027-02-01', { phd: { ...defaultPhd(), priority: 'High',
    researchFit: '5', funding: 'Fully funded', eligibility: 'Needs review' }, status: 'Preparing' });
  const third = app('unknown', '', { phd: { ...defaultPhd() } });
  assert.deepEqual(selectPhdApplications([third,second,first]).map(a => a.id), ['low','high','unknown']);
  assert.deepEqual(selectPhdApplications([third,second,first], { sort: 'Priority' }).map(a => a.id), ['high','low','unknown']);
  assert.deepEqual(selectPhdApplications([third,second,first], { sort: 'Research fit' }).map(a => a.id), ['high','low','unknown']);
  assert.deepEqual(selectPhdApplications([third,second,first], { funding: 'Fully funded', eligibility: 'Needs review', status: 'Preparing' }).map(a => a.id), ['high']);
  assert.equal(selectPhdApplications([first], { status: 'Interview' }).length, 0);
});

test('next PhD actions appear in target-date order and ignore closed records', () => {
  const a = app('a', '2027-03-01', { phd: { ...defaultPhd(), nextAction: 'Request reference', actionDue: '2026-11-04' } });
  const b = app('b', '2027-03-02', { phd: { ...defaultPhd(), nextAction: 'Check eligibility', actionDue: '2026-10-29' } });
  const c = app('c', '2027-03-03', { phd: { ...defaultPhd(), nextAction: 'Send email', actionDue: '2026-10-24' }, status: 'Closed' });
  const d = app('d', '', { phd: { ...defaultPhd(), nextAction: ' ' } });
  assert.deepEqual(nextPhdActions([a,c,d,b]).map(x => x.id), ['b','a']);
});
