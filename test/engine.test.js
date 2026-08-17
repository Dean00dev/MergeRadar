import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeChange } from '../src/engine.js';
import { formatCheckOutput } from '../src/format.js';

test('auth plus workflow changes produce high deterministic impact', () => {
  const report = analyzeChange({
    files: [
      { filename: 'src/auth/session.js', additions: 20, deletions: 2, changes: 22 },
      { filename: '.github/workflows/deploy.yml', additions: 4, deletions: 1, changes: 5 }
    ],
    codeownersText: '/src/auth/** @security\n/.github/workflows/** @platform'
  });

  assert.equal(report.impact, 'high');
  assert.deepEqual(report.reviewLanes, ['platform', 'security']);
  assert.equal(report.findings.some((finding) => finding.id === 'auth'), true);
  assert.equal(report.findings.some((finding) => finding.id === 'cicd'), true);
  assert.equal(report.unownedSensitiveFiles.length, 0);
});

test('ordinary documentation-only change stays low', () => {
  const report = analyzeChange({
    files: [{ filename: 'docs/guide.md', additions: 3, deletions: 0, changes: 3 }]
  });

  assert.equal(report.impact, 'low');
  assert.equal(report.findings.length, 0);
});

test('agent instruction change is visible as moderate impact', () => {
  const report = analyzeChange({
    files: [{ filename: 'AGENTS.md', additions: 8, deletions: 1, changes: 9 }]
  });

  assert.equal(report.impact, 'moderate');
  assert.equal(report.findings[0].id, 'agent-instructions');
});

test('check output states completion is not a safety verdict', () => {
  const report = analyzeChange({
    files: [{ filename: 'src/auth/login.js', additions: 1, deletions: 0, changes: 1 }]
  });
  const check = formatCheckOutput(report);

  assert.equal(check.conclusion, 'success');
  assert.match(check.output.summary, /does not certify that a change is safe/u);
  assert.match(check.output.title, /HIGH/u);
});

test('3,000-file ceiling becomes explicit incomplete state instead of a low verdict', () => {
  const report = analyzeChange({
    files: [{ filename: 'README.md', additions: 1, deletions: 0, changes: 1 }],
    truncated: true
  });
  const check = formatCheckOutput(report);

  assert.equal(report.complete, false);
  assert.equal(report.impact, 'incomplete');
  assert.equal(check.conclusion, 'neutral');
  assert.match(check.output.summary, /3,000 files/u);
});
