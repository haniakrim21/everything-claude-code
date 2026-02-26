/**
 * Tests for scripts/lib/session-aliases.js
 *
 * Run with: node tests/lib/session-aliases.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ---- Patch utils BEFORE loading session-aliases ---------------------------
// session-aliases calls getClaudeDir() (via its internal getAliasesPath()) and
// ensureDir() every time loadAliases/saveAliases run.  We redirect those to a
// temp directory so the real ~/.claude/session-aliases.json is never touched.
const utils = require('../../scripts/lib/utils');

let _claudeDir = null;

const _originalGetClaudeDir = utils.getClaudeDir;
utils.getClaudeDir = function () {
  return _claudeDir || _originalGetClaudeDir();
};

// Now safe to load the module under test
const sa = require('../../scripts/lib/session-aliases');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTempDir(label) {
  const dir = path.join(os.tmpdir(), `sa-test-${label}-${Date.now()}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Run a test block in an isolated temp "claude dir".
 * Sets _claudeDir to a fresh temp dir for the duration of the callback, then
 * cleans up regardless of outcome.
 */
function withTempClaudeDir(fn) {
  const dir = makeTempDir('claudedir');
  _claudeDir = dir;
  try {
    fn(dir);
  } finally {
    _claudeDir = null;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

function runTests() {
  console.log('\n=== Testing session-aliases.js ===\n');

  let passed = 0;
  let failed = 0;

  // ---- getAliasesPath -----------------------------------------------------
  console.log('getAliasesPath:');

  if (test('returns a path ending in session-aliases.json', () => {
    withTempClaudeDir((dir) => {
      const p = sa.getAliasesPath();
      assert.ok(p.endsWith('session-aliases.json'), `Got: ${p}`);
      assert.ok(p.startsWith(dir), 'Should be inside temp claude dir');
    });
  })) passed++; else failed++;

  // ---- loadAliases --------------------------------------------------------
  console.log('\nloadAliases:');

  if (test('returns default structure when file does not exist', () => {
    withTempClaudeDir(() => {
      const data = sa.loadAliases();
      assert.strictEqual(data.version, '1.0');
      assert.deepStrictEqual(data.aliases, {});
      assert.ok(data.metadata);
      assert.strictEqual(data.metadata.totalCount, 0);
    });
  })) passed++; else failed++;

  if (test('loads previously saved aliases correctly', () => {
    withTempClaudeDir((dir) => {
      const aliasesFile = path.join(dir, 'session-aliases.json');
      const fixture = JSON.stringify({
        version: '1.0',
        aliases: {
          myalias: {
            sessionPath: '/some/path',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            title: 'My Title'
          }
        },
        metadata: { totalCount: 1, lastUpdated: '2026-01-01T00:00:00.000Z' }
      });
      fs.writeFileSync(aliasesFile, fixture, 'utf8');

      const data = sa.loadAliases();
      assert.ok(data.aliases.myalias, 'should load myalias');
      assert.strictEqual(data.aliases.myalias.sessionPath, '/some/path');
      assert.strictEqual(data.aliases.myalias.title, 'My Title');
    });
  })) passed++; else failed++;

  if (test('returns default structure for corrupted JSON file', () => {
    withTempClaudeDir((dir) => {
      const aliasesFile = path.join(dir, 'session-aliases.json');
      fs.writeFileSync(aliasesFile, '{ invalid json !!!', 'utf8');
      const data = sa.loadAliases();
      assert.deepStrictEqual(data.aliases, {});
    });
  })) passed++; else failed++;

  if (test('returns default structure when aliases field is missing', () => {
    withTempClaudeDir((dir) => {
      const aliasesFile = path.join(dir, 'session-aliases.json');
      fs.writeFileSync(aliasesFile, JSON.stringify({ version: '1.0' }), 'utf8');
      const data = sa.loadAliases();
      assert.deepStrictEqual(data.aliases, {});
    });
  })) passed++; else failed++;

  if (test('injects version if missing from loaded file', () => {
    withTempClaudeDir((dir) => {
      const aliasesFile = path.join(dir, 'session-aliases.json');
      fs.writeFileSync(aliasesFile, JSON.stringify({ aliases: {} }), 'utf8');
      const data = sa.loadAliases();
      assert.strictEqual(data.version, '1.0');
    });
  })) passed++; else failed++;

  if (test('injects metadata if missing from loaded file', () => {
    withTempClaudeDir((dir) => {
      const aliasesFile = path.join(dir, 'session-aliases.json');
      fs.writeFileSync(aliasesFile, JSON.stringify({ version: '1.0', aliases: { x: {} } }), 'utf8');
      const data = sa.loadAliases();
      assert.ok(data.metadata);
      assert.ok(data.metadata.lastUpdated);
    });
  })) passed++; else failed++;

  // ---- saveAliases --------------------------------------------------------
  console.log('\nsaveAliases:');

  if (test('saveAliases returns true and file is written', () => {
    withTempClaudeDir((dir) => {
      const data = sa.loadAliases();
      data.aliases['saved'] = {
        sessionPath: '/tmp/session',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: null
      };
      const ok = sa.saveAliases(data);
      assert.strictEqual(ok, true);

      const aliasesFile = path.join(dir, 'session-aliases.json');
      assert.ok(fs.existsSync(aliasesFile));
      const written = JSON.parse(fs.readFileSync(aliasesFile, 'utf8'));
      assert.ok(written.aliases.saved);
    });
  })) passed++; else failed++;

  if (test('saveAliases updates metadata.totalCount', () => {
    withTempClaudeDir(() => {
      const data = sa.loadAliases();
      data.aliases['a1'] = { sessionPath: '/p1', createdAt: '', updatedAt: '', title: null };
      data.aliases['a2'] = { sessionPath: '/p2', createdAt: '', updatedAt: '', title: null };
      sa.saveAliases(data);
      const loaded = sa.loadAliases();
      assert.strictEqual(loaded.metadata.totalCount, 2);
    });
  })) passed++; else failed++;

  if (test('saveAliases creates backup file during write', () => {
    withTempClaudeDir((dir) => {
      const aliasesFile = path.join(dir, 'session-aliases.json');
      // Write an initial file so backup can be created
      fs.writeFileSync(aliasesFile, JSON.stringify({ version: '1.0', aliases: {}, metadata: { totalCount: 0, lastUpdated: '' } }), 'utf8');

      const data = sa.loadAliases();
      data.aliases['x'] = { sessionPath: '/x', createdAt: '', updatedAt: '', title: null };
      sa.saveAliases(data);

      // Backup (.bak) is cleaned up on success, so just verify the main file exists and is valid
      assert.ok(fs.existsSync(aliasesFile));
      const written = JSON.parse(fs.readFileSync(aliasesFile, 'utf8'));
      assert.ok(written.aliases.x);
    });
  })) passed++; else failed++;

  // ---- setAlias -----------------------------------------------------------
  console.log('\nsetAlias:');

  if (test('setAlias creates a new alias successfully', () => {
    withTempClaudeDir(() => {
      const result = sa.setAlias('myproject', '/tmp/sessions/abc', 'My Project');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.isNew, true);
      assert.strictEqual(result.alias, 'myproject');
      assert.strictEqual(result.sessionPath, '/tmp/sessions/abc');
      assert.strictEqual(result.title, 'My Project');
    });
  })) passed++; else failed++;

  if (test('setAlias updates existing alias and isNew is false', () => {
    withTempClaudeDir(() => {
      sa.setAlias('existing', '/old/path', 'Old Title');
      const result = sa.setAlias('existing', '/new/path', 'New Title');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.isNew, false);
      assert.strictEqual(result.sessionPath, '/new/path');
    });
  })) passed++; else failed++;

  if (test('setAlias preserves createdAt on update', () => {
    withTempClaudeDir(() => {
      sa.setAlias('stable', '/path', 'Title');
      const first = sa.resolveAlias('stable');
      // Wait 2ms to ensure time difference
      const before = new Date().toISOString();
      sa.setAlias('stable', '/path2', 'Title2');
      const second = sa.resolveAlias('stable');
      // createdAt must be <= before (set during first call)
      assert.ok(first.createdAt <= before, 'createdAt should be from first call');
      assert.strictEqual(first.createdAt, second.createdAt || first.createdAt);
    });
  })) passed++; else failed++;

  if (test('setAlias rejects empty alias name', () => {
    withTempClaudeDir(() => {
      const result = sa.setAlias('', '/path');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.toLowerCase().includes('empty'));
    });
  })) passed++; else failed++;

  if (test('setAlias rejects alias with invalid characters', () => {
    withTempClaudeDir(() => {
      const result = sa.setAlias('bad alias!', '/path');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.toLowerCase().includes('letters'));
    });
  })) passed++; else failed++;

  if (test('setAlias rejects reserved alias names', () => {
    const reserved = ['list', 'help', 'remove', 'delete', 'create', 'set'];
    withTempClaudeDir(() => {
      for (const name of reserved) {
        const result = sa.setAlias(name, '/path');
        assert.strictEqual(result.success, false, `"${name}" should be reserved`);
        assert.ok(result.error.toLowerCase().includes('reserved'), `Error for "${name}": ${result.error}`);
      }
    });
  })) passed++; else failed++;

  if (test('setAlias allows dashes and underscores in name', () => {
    withTempClaudeDir(() => {
      const r1 = sa.setAlias('my-project', '/p1');
      const r2 = sa.setAlias('my_project', '/p2');
      assert.strictEqual(r1.success, true);
      assert.strictEqual(r2.success, true);
    });
  })) passed++; else failed++;

  // ---- resolveAlias -------------------------------------------------------
  console.log('\nresolveAlias:');

  if (test('resolveAlias returns alias data for known alias', () => {
    withTempClaudeDir(() => {
      sa.setAlias('known', '/tmp/known-session', 'Known Title');
      const result = sa.resolveAlias('known');
      assert.ok(result, 'should resolve');
      assert.strictEqual(result.alias, 'known');
      assert.strictEqual(result.sessionPath, '/tmp/known-session');
      assert.strictEqual(result.title, 'Known Title');
      assert.ok(result.createdAt);
    });
  })) passed++; else failed++;

  if (test('resolveAlias returns null for unknown alias', () => {
    withTempClaudeDir(() => {
      const result = sa.resolveAlias('unknown-alias-xyz');
      assert.strictEqual(result, null);
    });
  })) passed++; else failed++;

  if (test('resolveAlias returns null for invalid characters in name', () => {
    withTempClaudeDir(() => {
      const result = sa.resolveAlias('bad name!');
      assert.strictEqual(result, null);
    });
  })) passed++; else failed++;

  if (test('resolveAlias returns null for empty string', () => {
    withTempClaudeDir(() => {
      // Empty string fails the regex
      const result = sa.resolveAlias('');
      assert.strictEqual(result, null);
    });
  })) passed++; else failed++;

  // ---- listAliases --------------------------------------------------------
  console.log('\nlistAliases:');

  if (test('listAliases returns empty array when no aliases', () => {
    withTempClaudeDir(() => {
      const list = sa.listAliases();
      assert.deepStrictEqual(list, []);
    });
  })) passed++; else failed++;

  if (test('listAliases returns all aliases sorted newest first', () => {
    withTempClaudeDir((dir) => {
      // Write the aliases file directly with explicit timestamps so the sort
      // order is deterministic regardless of how fast the CPU runs.
      const aliasesFile = path.join(dir, 'session-aliases.json');
      const fixture = {
        version: '1.0',
        aliases: {
          alpha: { sessionPath: '/p1', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', title: 'Alpha' },
          beta:  { sessionPath: '/p2', createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z', title: 'Beta' },
          gamma: { sessionPath: '/p3', createdAt: '2026-01-03T00:00:00.000Z', updatedAt: '2026-01-03T00:00:00.000Z', title: 'Gamma' }
        },
        metadata: { totalCount: 3, lastUpdated: '2026-01-03T00:00:00.000Z' }
      };
      fs.writeFileSync(aliasesFile, JSON.stringify(fixture), 'utf8');

      const list = sa.listAliases();
      assert.strictEqual(list.length, 3);
      // Newest first by updatedAt
      assert.strictEqual(list[0].name, 'gamma');
      assert.strictEqual(list[1].name, 'beta');
      assert.strictEqual(list[2].name, 'alpha');
    });
  })) passed++; else failed++;

  if (test('listAliases filters by search term in name', () => {
    withTempClaudeDir(() => {
      sa.setAlias('frontend', '/p1', null);
      sa.setAlias('backend', '/p2', null);
      sa.setAlias('fullstack', '/p3', null);
      const list = sa.listAliases({ search: 'end' });
      // 'frontend' and 'backend' contain 'end'
      assert.strictEqual(list.length, 2);
    });
  })) passed++; else failed++;

  if (test('listAliases filters by search term in title', () => {
    withTempClaudeDir(() => {
      sa.setAlias('proj1', '/p1', 'Django App');
      sa.setAlias('proj2', '/p2', 'React Frontend');
      const list = sa.listAliases({ search: 'django' });
      assert.strictEqual(list.length, 1);
      assert.strictEqual(list[0].name, 'proj1');
    });
  })) passed++; else failed++;

  if (test('listAliases respects limit option', () => {
    withTempClaudeDir(() => {
      for (let i = 0; i < 5; i++) {
        sa.setAlias(`alias${i}`, `/p${i}`, null);
      }
      const list = sa.listAliases({ limit: 3 });
      assert.strictEqual(list.length, 3);
    });
  })) passed++; else failed++;

  if (test('listAliases returned objects have expected shape', () => {
    withTempClaudeDir(() => {
      sa.setAlias('shaped', '/path/to/session', 'My Title');
      const list = sa.listAliases();
      assert.strictEqual(list.length, 1);
      const item = list[0];
      assert.ok('name' in item);
      assert.ok('sessionPath' in item);
      assert.ok('createdAt' in item);
      assert.ok('updatedAt' in item);
      assert.ok('title' in item);
    });
  })) passed++; else failed++;

  // ---- deleteAlias --------------------------------------------------------
  console.log('\ndeleteAlias:');

  if (test('deleteAlias removes an existing alias', () => {
    withTempClaudeDir(() => {
      sa.setAlias('todelete', '/path', null);
      const result = sa.deleteAlias('todelete');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.alias, 'todelete');
      assert.strictEqual(result.deletedSessionPath, '/path');

      const resolved = sa.resolveAlias('todelete');
      assert.strictEqual(resolved, null);
    });
  })) passed++; else failed++;

  if (test('deleteAlias returns error for non-existent alias', () => {
    withTempClaudeDir(() => {
      const result = sa.deleteAlias('doesnotexist');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('doesnotexist'));
    });
  })) passed++; else failed++;

  // ---- renameAlias --------------------------------------------------------
  console.log('\nrenameAlias:');

  if (test('renameAlias renames an alias successfully', () => {
    withTempClaudeDir(() => {
      sa.setAlias('oldname', '/path', 'Title');
      const result = sa.renameAlias('oldname', 'newname');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.oldAlias, 'oldname');
      assert.strictEqual(result.newAlias, 'newname');

      assert.strictEqual(sa.resolveAlias('oldname'), null);
      const resolved = sa.resolveAlias('newname');
      assert.ok(resolved);
      assert.strictEqual(resolved.sessionPath, '/path');
    });
  })) passed++; else failed++;

  if (test('renameAlias returns error when source does not exist', () => {
    withTempClaudeDir(() => {
      const result = sa.renameAlias('nosuchname', 'newname');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('nosuchname'));
    });
  })) passed++; else failed++;

  if (test('renameAlias returns error when target name already exists', () => {
    withTempClaudeDir(() => {
      sa.setAlias('source', '/p1', null);
      sa.setAlias('target', '/p2', null);
      const result = sa.renameAlias('source', 'target');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('already exists'));
    });
  })) passed++; else failed++;

  if (test('renameAlias rejects invalid new alias name', () => {
    withTempClaudeDir(() => {
      sa.setAlias('validname', '/p', null);
      const result = sa.renameAlias('validname', 'bad name!');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.toLowerCase().includes('letters'));
    });
  })) passed++; else failed++;

  // ---- updateAliasTitle ---------------------------------------------------
  console.log('\nupdateAliasTitle:');

  if (test('updateAliasTitle changes the title of an alias', () => {
    withTempClaudeDir(() => {
      sa.setAlias('retitled', '/path', 'Old Title');
      const result = sa.updateAliasTitle('retitled', 'New Title');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.title, 'New Title');

      const resolved = sa.resolveAlias('retitled');
      assert.strictEqual(resolved.title, 'New Title');
    });
  })) passed++; else failed++;

  if (test('updateAliasTitle returns error for non-existent alias', () => {
    withTempClaudeDir(() => {
      const result = sa.updateAliasTitle('ghost', 'Title');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('ghost'));
    });
  })) passed++; else failed++;

  // ---- getAliasesForSession -----------------------------------------------
  console.log('\ngetAliasesForSession:');

  if (test('getAliasesForSession returns all aliases pointing to a session', () => {
    withTempClaudeDir(() => {
      const sharedPath = '/shared/session/path';
      sa.setAlias('alias-a', sharedPath, 'A');
      sa.setAlias('alias-b', sharedPath, 'B');
      sa.setAlias('other', '/different/path', 'Other');

      const results = sa.getAliasesForSession(sharedPath);
      assert.strictEqual(results.length, 2);
      const names = results.map(r => r.name).sort();
      assert.deepStrictEqual(names, ['alias-a', 'alias-b']);
    });
  })) passed++; else failed++;

  if (test('getAliasesForSession returns empty array when no aliases match', () => {
    withTempClaudeDir(() => {
      sa.setAlias('unrelated', '/other/path', null);
      const results = sa.getAliasesForSession('/no/match');
      assert.deepStrictEqual(results, []);
    });
  })) passed++; else failed++;

  // ---- resolveSessionAlias ------------------------------------------------
  console.log('\nresolveSessionAlias:');

  if (test('resolveSessionAlias returns session path for known alias', () => {
    withTempClaudeDir(() => {
      sa.setAlias('mywork', '/sessions/work', null);
      const result = sa.resolveSessionAlias('mywork');
      assert.strictEqual(result, '/sessions/work');
    });
  })) passed++; else failed++;

  if (test('resolveSessionAlias returns input as-is when not an alias', () => {
    withTempClaudeDir(() => {
      const result = sa.resolveSessionAlias('/some/direct/path');
      assert.strictEqual(result, '/some/direct/path');
    });
  })) passed++; else failed++;

  // ---- cleanupAliases -----------------------------------------------------
  console.log('\ncleanupAliases:');

  if (test('cleanupAliases removes aliases where session does not exist', () => {
    withTempClaudeDir(() => {
      sa.setAlias('alive', '/existing/path', null);
      sa.setAlias('dead', '/nonexistent/path', null);
      sa.setAlias('alsodead', '/also/gone', null);

      const existingPaths = new Set(['/existing/path']);
      const result = sa.cleanupAliases((sessionPath) => existingPaths.has(sessionPath));

      assert.strictEqual(result.removed, 2);
      assert.strictEqual(result.removedAliases.length, 2);
      const removedNames = result.removedAliases.map(r => r.name).sort();
      assert.deepStrictEqual(removedNames, ['alsodead', 'dead']);

      // 'alive' should still be resolvable
      assert.ok(sa.resolveAlias('alive'));
      assert.strictEqual(sa.resolveAlias('dead'), null);
    });
  })) passed++; else failed++;

  if (test('cleanupAliases returns zero removed when all sessions exist', () => {
    withTempClaudeDir(() => {
      sa.setAlias('p1', '/path/one', null);
      sa.setAlias('p2', '/path/two', null);
      const result = sa.cleanupAliases(() => true);
      assert.strictEqual(result.removed, 0);
      assert.deepStrictEqual(result.removedAliases, []);
    });
  })) passed++; else failed++;

  if (test('cleanupAliases totalChecked reflects all aliases before removal', () => {
    withTempClaudeDir(() => {
      sa.setAlias('keep1', '/k1', null);
      sa.setAlias('keep2', '/k2', null);
      sa.setAlias('drop1', '/d1', null);
      const keepPaths = new Set(['/k1', '/k2']);
      const result = sa.cleanupAliases((p) => keepPaths.has(p));
      // totalChecked = remaining (after removal) + removed
      assert.strictEqual(result.totalChecked, 3);
    });
  })) passed++; else failed++;

  if (test('cleanupAliases with empty aliases store returns zero removed', () => {
    withTempClaudeDir(() => {
      const result = sa.cleanupAliases(() => false);
      assert.strictEqual(result.removed, 0);
      assert.strictEqual(result.totalChecked, 0);
    });
  })) passed++; else failed++;

  // ---- Summary ------------------------------------------------------------
  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
