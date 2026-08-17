import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compileCodeownersPattern,
  evaluateCodeowners,
  ownersForPath,
  parseCodeowners
} from '../src/codeowners.js';

test('bounded CODEOWNERS parser applies last matching rule', () => {
  const parsed = parseCodeowners(`
* @everyone
/src/ @platform
/src/auth/** @security
`);

  assert.deepEqual(ownersForPath('src/auth/session.js', parsed.entries).owners, ['@security']);
  assert.deepEqual(ownersForPath('src/ui/button.js', parsed.entries).owners, ['@platform']);
  assert.deepEqual(ownersForPath('README.md', parsed.entries).owners, ['@everyone']);
});

test('directory and recursive patterns match expected common cases', () => {
  assert.equal(compileCodeownersPattern('/docs/').test('docs/guide.md'), true);
  assert.equal(compileCodeownersPattern('/docs/').test('src/docs/guide.md'), false);
  assert.equal(compileCodeownersPattern('*.md').test('nested/README.md'), true);
  assert.equal(compileCodeownersPattern('/src/**').test('src/auth/session.js'), true);
});

test('unsupported CODEOWNERS syntax is explicit rather than guessed', () => {
  const parsed = parseCodeowners('[ab].js @team\n!secret.txt @team');
  assert.equal(parsed.entries.length, 0);
  assert.equal(parsed.diagnostics.length, 2);
});

test('coverage reports unowned changed paths', () => {
  const result = evaluateCodeowners(
    [{ filename: 'src/auth/session.js' }, { filename: 'README.md' }],
    '/src/** @platform'
  );
  assert.deepEqual(result.unowned, ['README.md']);
  assert.equal(result.covered[0].owners[0], '@platform');
});
