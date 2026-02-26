/**
 * Tests for scripts/lib/session-manager.js
 *
 * Run with: node tests/lib/session-manager.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ---- Patch utils before loading session-manager ----
// session-manager requires('./utils') and calls getSessionsDir() at call time,
// so we patch the cached utils module after it is first required.
const utils = require('../../scripts/lib/utils');

let _sessionsDir = null;

// Override getSessionsDir so session-manager uses our temp directory
const _originalGetSessionsDir = utils.getSessionsDir;
utils.getSessionsDir = function () {
  return _sessionsDir || _originalGetSessionsDir();
};

// Now load session-manager (it will pick up patched utils via module cache)
const sm = require('../../scripts/lib/session-manager');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTempDir(label) {
  const dir = path.join(os.tmpdir(), `sm-test-${label}-${Date.now()}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Write a session file into a temp sessions dir and return its full path. */
function writeSession(sessionsDir, filename, content) {
  const fp = path.join(sessionsDir, filename);
  fs.writeFileSync(fp, content, 'utf8');
  return fp;
}

// ---------------------------------------------------------------------------
// Test runner (same pattern as utils.test.js)
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
  console.log('\n=== Testing session-manager.js ===\n');

  let passed = 0;
  let failed = 0;

  // ---- parseSessionFilename -----------------------------------------------
  console.log('parseSessionFilename:');

  if (test('parses new format with short ID', () => {
    const result = sm.parseSessionFilename('2026-01-17-abc12345-session.tmp');
    assert.ok(result, 'should return object');
    assert.strictEqual(result.date, '2026-01-17');
    assert.strictEqual(result.shortId, 'abc12345');
    assert.strictEqual(result.filename, '2026-01-17-abc12345-session.tmp');
    assert.ok(result.datetime instanceof Date);
  })) passed++; else failed++;

  if (test('parses old format without short ID', () => {
    const result = sm.parseSessionFilename('2026-01-17-session.tmp');
    assert.ok(result, 'should return object');
    assert.strictEqual(result.date, '2026-01-17');
    assert.strictEqual(result.shortId, 'no-id');
    assert.strictEqual(result.filename, '2026-01-17-session.tmp');
  })) passed++; else failed++;

  if (test('parses new format with 8-char alphanumeric ID', () => {
    const result = sm.parseSessionFilename('2025-12-31-abcd1234-session.tmp');
    assert.ok(result);
    assert.strictEqual(result.shortId, 'abcd1234');
  })) passed++; else failed++;

  if (test('parses new format with longer ID (more than 8 chars)', () => {
    const result = sm.parseSessionFilename('2026-02-01-longerid99-session.tmp');
    assert.ok(result);
    assert.strictEqual(result.shortId, 'longerid99');
  })) passed++; else failed++;

  if (test('returns null for invalid filename', () => {
    assert.strictEqual(sm.parseSessionFilename('random-file.txt'), null);
    assert.strictEqual(sm.parseSessionFilename('2026-01-17.tmp'), null);
    assert.strictEqual(sm.parseSessionFilename(''), null);
  })) passed++; else failed++;

  if (test('returns null for short ID with fewer than 8 chars', () => {
    // IDs must be 8+ alphanumeric; "abc" is too short so the regex treats it
    // as non-matching for the ID group — falls back to old-format check
    const result = sm.parseSessionFilename('2026-01-17-abc-session.tmp');
    // With only 3 chars in the "id" position the regex won't capture it as an ID
    // The filename as a whole will fail the full pattern (no separate date segment)
    // so we just assert that we don't crash and the return value is null or object
    // (Regex: shortId must be [a-z0-9]{8,})
    assert.strictEqual(result, null);
  })) passed++; else failed++;

  if (test('datetime is a valid Date object', () => {
    const result = sm.parseSessionFilename('2026-01-15-deadbeef-session.tmp');
    assert.ok(result);
    assert.ok(!isNaN(result.datetime.getTime()));
  })) passed++; else failed++;

  // ---- parseSessionMetadata -----------------------------------------------
  console.log('\nparseSessionMetadata:');

  const sampleContent = `# My Test Session

**Date:** 2026-01-17
**Started:** 09:30
**Last Updated:** 11:45

## Tasks

### In Progress
- [ ] Write more tests
- [ ] Fix the linter

### Completed
- [x] Set up project
- [x] Add CI

### Notes for Next Session
Remember to update the README.

### Context to Load
\`\`\`
project = my-project
branch = main
\`\`\`
`;

  if (test('extracts title from heading', () => {
    const meta = sm.parseSessionMetadata(sampleContent);
    assert.strictEqual(meta.title, 'My Test Session');
  })) passed++; else failed++;

  if (test('extracts date field', () => {
    const meta = sm.parseSessionMetadata(sampleContent);
    assert.strictEqual(meta.date, '2026-01-17');
  })) passed++; else failed++;

  if (test('extracts started time', () => {
    const meta = sm.parseSessionMetadata(sampleContent);
    assert.strictEqual(meta.started, '09:30');
  })) passed++; else failed++;

  if (test('extracts lastUpdated time', () => {
    const meta = sm.parseSessionMetadata(sampleContent);
    assert.strictEqual(meta.lastUpdated, '11:45');
  })) passed++; else failed++;

  if (test('extracts completed items array', () => {
    const meta = sm.parseSessionMetadata(sampleContent);
    assert.deepStrictEqual(meta.completed, ['Set up project', 'Add CI']);
  })) passed++; else failed++;

  if (test('extracts inProgress items array', () => {
    const meta = sm.parseSessionMetadata(sampleContent);
    assert.deepStrictEqual(meta.inProgress, ['Write more tests', 'Fix the linter']);
  })) passed++; else failed++;

  if (test('extracts notes', () => {
    const meta = sm.parseSessionMetadata(sampleContent);
    assert.ok(meta.notes.includes('README'));
  })) passed++; else failed++;

  if (test('extracts context block', () => {
    const meta = sm.parseSessionMetadata(sampleContent);
    assert.ok(meta.context.includes('project = my-project'));
  })) passed++; else failed++;

  if (test('returns default structure for null/empty content', () => {
    const metaNull = sm.parseSessionMetadata(null);
    assert.strictEqual(metaNull.title, null);
    assert.deepStrictEqual(metaNull.completed, []);
    assert.deepStrictEqual(metaNull.inProgress, []);

    const metaEmpty = sm.parseSessionMetadata('');
    assert.strictEqual(metaEmpty.title, null);
  })) passed++; else failed++;

  if (test('handles content with no sections gracefully', () => {
    const meta = sm.parseSessionMetadata('# Simple Title\n\nJust some text.');
    assert.strictEqual(meta.title, 'Simple Title');
    assert.deepStrictEqual(meta.completed, []);
    assert.deepStrictEqual(meta.inProgress, []);
    assert.strictEqual(meta.notes, '');
    assert.strictEqual(meta.context, '');
  })) passed++; else failed++;

  // ---- writeSessionContent / getSessionContent / sessionExists ------------
  console.log('\nwriteSessionContent / getSessionContent / sessionExists:');

  if (test('writeSessionContent writes and getSessionContent reads back', () => {
    const tmpDir = makeTempDir('write');
    try {
      const fp = path.join(tmpDir, 'test-session.tmp');
      const content = '# Test\n\nHello world';
      const ok = sm.writeSessionContent(fp, content);
      assert.strictEqual(ok, true);
      const read = sm.getSessionContent(fp);
      assert.strictEqual(read, content);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getSessionContent returns null for missing file', () => {
    const result = sm.getSessionContent('/non/existent/path/session.tmp');
    assert.strictEqual(result, null);
  })) passed++; else failed++;

  if (test('sessionExists returns true for existing file', () => {
    const tmpDir = makeTempDir('exists');
    try {
      const fp = path.join(tmpDir, 'exists.tmp');
      fs.writeFileSync(fp, 'content', 'utf8');
      assert.strictEqual(sm.sessionExists(fp), true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('sessionExists returns false for missing file', () => {
    assert.strictEqual(sm.sessionExists('/non/existent/session.tmp'), false);
  })) passed++; else failed++;

  // ---- appendSessionContent -----------------------------------------------
  console.log('\nappendSessionContent:');

  if (test('appendSessionContent appends to existing file', () => {
    const tmpDir = makeTempDir('append');
    try {
      const fp = path.join(tmpDir, 'append.tmp');
      sm.writeSessionContent(fp, 'Line 1\n');
      const ok = sm.appendSessionContent(fp, 'Line 2\n');
      assert.strictEqual(ok, true);
      const content = sm.getSessionContent(fp);
      assert.ok(content.includes('Line 1'));
      assert.ok(content.includes('Line 2'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ---- deleteSession ------------------------------------------------------
  console.log('\ndeleteSession:');

  if (test('deleteSession removes the file and returns true', () => {
    const tmpDir = makeTempDir('delete');
    try {
      const fp = path.join(tmpDir, 'to-delete.tmp');
      fs.writeFileSync(fp, 'bye', 'utf8');
      assert.strictEqual(sm.deleteSession(fp), true);
      assert.ok(!fs.existsSync(fp));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('deleteSession returns false for non-existent file', () => {
    assert.strictEqual(sm.deleteSession('/non/existent/gone.tmp'), false);
  })) passed++; else failed++;

  // ---- getSessionSize -----------------------------------------------------
  console.log('\ngetSessionSize:');

  if (test('getSessionSize returns "0 B" for missing file', () => {
    assert.strictEqual(sm.getSessionSize('/non/existent/file.tmp'), '0 B');
  })) passed++; else failed++;

  if (test('getSessionSize returns bytes for small file', () => {
    const tmpDir = makeTempDir('size');
    try {
      const fp = path.join(tmpDir, 'small.tmp');
      fs.writeFileSync(fp, 'Hello', 'utf8');
      const size = sm.getSessionSize(fp);
      assert.ok(size.endsWith(' B'), `Expected bytes, got: ${size}`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getSessionSize returns KB for larger file', () => {
    const tmpDir = makeTempDir('size-kb');
    try {
      const fp = path.join(tmpDir, 'large.tmp');
      fs.writeFileSync(fp, 'x'.repeat(2048), 'utf8');
      const size = sm.getSessionSize(fp);
      assert.ok(size.endsWith(' KB'), `Expected KB, got: ${size}`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ---- getSessionStats ----------------------------------------------------
  console.log('\ngetSessionStats:');

  if (test('getSessionStats returns correct counts', () => {
    const tmpDir = makeTempDir('stats');
    try {
      const fp = path.join(tmpDir, 'stat.tmp');
      fs.writeFileSync(fp, sampleContent, 'utf8');
      const stats = sm.getSessionStats(fp);
      assert.strictEqual(stats.completedItems, 2);
      assert.strictEqual(stats.inProgressItems, 2);
      assert.strictEqual(stats.totalItems, 4);
      assert.strictEqual(stats.hasNotes, true);
      assert.strictEqual(stats.hasContext, true);
      assert.ok(stats.lineCount > 0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getSessionStats handles non-existent file gracefully', () => {
    const stats = sm.getSessionStats('/non/existent/session.tmp');
    assert.strictEqual(stats.lineCount, 0);
    assert.strictEqual(stats.totalItems, 0);
  })) passed++; else failed++;

  // ---- getSessionTitle ----------------------------------------------------
  console.log('\ngetSessionTitle:');

  if (test('getSessionTitle returns title from content', () => {
    const tmpDir = makeTempDir('title');
    try {
      const fp = path.join(tmpDir, 'titled.tmp');
      fs.writeFileSync(fp, '# My Great Title\n\nSome content', 'utf8');
      assert.strictEqual(sm.getSessionTitle(fp), 'My Great Title');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getSessionTitle returns "Untitled Session" when no heading', () => {
    const tmpDir = makeTempDir('notitle');
    try {
      const fp = path.join(tmpDir, 'notitle.tmp');
      fs.writeFileSync(fp, 'No heading here at all', 'utf8');
      assert.strictEqual(sm.getSessionTitle(fp), 'Untitled Session');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getSessionTitle returns "Untitled Session" for missing file', () => {
    assert.strictEqual(sm.getSessionTitle('/non/existent.tmp'), 'Untitled Session');
  })) passed++; else failed++;

  // ---- getAllSessions ------------------------------------------------------
  console.log('\ngetAllSessions:');

  if (test('getAllSessions returns empty result when sessions dir missing', () => {
    const tmpDir = makeTempDir('allsessions-missing');
    _sessionsDir = path.join(tmpDir, 'nonexistent-sessions');
    try {
      const result = sm.getAllSessions();
      assert.deepStrictEqual(result.sessions, []);
      assert.strictEqual(result.total, 0);
      assert.strictEqual(result.hasMore, false);
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getAllSessions lists session files', () => {
    const tmpDir = makeTempDir('allsessions');
    _sessionsDir = tmpDir;
    try {
      writeSession(tmpDir, '2026-01-10-aabbccdd-session.tmp', '# Session A');
      writeSession(tmpDir, '2026-01-11-eeff0011-session.tmp', '# Session B');
      writeSession(tmpDir, 'not-a-session.txt', 'ignored');
      const result = sm.getAllSessions();
      assert.strictEqual(result.total, 2);
      assert.strictEqual(result.sessions.length, 2);
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getAllSessions filters by date', () => {
    const tmpDir = makeTempDir('allsessions-date');
    _sessionsDir = tmpDir;
    try {
      writeSession(tmpDir, '2026-01-10-aabbccdd-session.tmp', '# A');
      writeSession(tmpDir, '2026-01-11-eeff0011-session.tmp', '# B');
      const result = sm.getAllSessions({ date: '2026-01-10' });
      assert.strictEqual(result.total, 1);
      assert.strictEqual(result.sessions[0].date, '2026-01-10');
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getAllSessions filters by search (short ID prefix)', () => {
    const tmpDir = makeTempDir('allsessions-search');
    _sessionsDir = tmpDir;
    try {
      writeSession(tmpDir, '2026-01-10-aabbccdd-session.tmp', '# A');
      writeSession(tmpDir, '2026-01-11-eeff0011-session.tmp', '# B');
      const result = sm.getAllSessions({ search: 'aabb' });
      assert.strictEqual(result.total, 1);
      assert.ok(result.sessions[0].shortId.includes('aabb'));
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getAllSessions pagination with limit and offset', () => {
    const tmpDir = makeTempDir('allsessions-page');
    _sessionsDir = tmpDir;
    try {
      writeSession(tmpDir, '2026-01-01-aaaaaaaa-session.tmp', '# A');
      writeSession(tmpDir, '2026-01-02-bbbbbbbb-session.tmp', '# B');
      writeSession(tmpDir, '2026-01-03-cccccccc-session.tmp', '# C');
      const page1 = sm.getAllSessions({ limit: 2, offset: 0 });
      assert.strictEqual(page1.sessions.length, 2);
      assert.strictEqual(page1.total, 3);
      assert.strictEqual(page1.hasMore, true);

      const page2 = sm.getAllSessions({ limit: 2, offset: 2 });
      assert.strictEqual(page2.sessions.length, 1);
      assert.strictEqual(page2.hasMore, false);
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getAllSessions ignores non-.tmp files', () => {
    const tmpDir = makeTempDir('allsessions-ignore');
    _sessionsDir = tmpDir;
    try {
      writeSession(tmpDir, '2026-01-10-aabbccdd-session.tmp', '# A');
      writeSession(tmpDir, 'README.md', '# readme');
      writeSession(tmpDir, 'data.json', '{}');
      const result = sm.getAllSessions();
      assert.strictEqual(result.total, 1);
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ---- getSessionById -----------------------------------------------------
  console.log('\ngetSessionById:');

  if (test('getSessionById finds session by exact short ID', () => {
    const tmpDir = makeTempDir('byid');
    _sessionsDir = tmpDir;
    try {
      writeSession(tmpDir, '2026-01-10-aabbccdd-session.tmp', '# Found');
      const result = sm.getSessionById('aabbccdd');
      assert.ok(result, 'should find session');
      assert.strictEqual(result.shortId, 'aabbccdd');
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getSessionById finds session by prefix of short ID', () => {
    const tmpDir = makeTempDir('byid-prefix');
    _sessionsDir = tmpDir;
    try {
      writeSession(tmpDir, '2026-01-10-aabbccdd-session.tmp', '# Found');
      const result = sm.getSessionById('aabb');
      assert.ok(result, 'should find by prefix');
      assert.strictEqual(result.shortId, 'aabbccdd');
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getSessionById returns null when not found', () => {
    const tmpDir = makeTempDir('byid-missing');
    _sessionsDir = tmpDir;
    try {
      writeSession(tmpDir, '2026-01-10-aabbccdd-session.tmp', '# A');
      const result = sm.getSessionById('zzzzzzzzz');
      assert.strictEqual(result, null);
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getSessionById returns null when sessions dir missing', () => {
    const tmpDir = makeTempDir('byid-nodir');
    _sessionsDir = path.join(tmpDir, 'nonexistent');
    try {
      const result = sm.getSessionById('anyid');
      assert.strictEqual(result, null);
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getSessionById with includeContent loads content and stats', () => {
    const tmpDir = makeTempDir('byid-content');
    _sessionsDir = tmpDir;
    try {
      writeSession(tmpDir, '2026-01-10-aabbccdd-session.tmp', sampleContent);
      const result = sm.getSessionById('aabbccdd', true);
      assert.ok(result, 'should find session');
      assert.ok(result.content, 'should have content');
      assert.ok(result.metadata, 'should have metadata');
      assert.ok(result.stats, 'should have stats');
      assert.strictEqual(result.metadata.title, 'My Test Session');
      assert.strictEqual(result.stats.completedItems, 2);
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('getSessionById finds old-format session by date prefix', () => {
    const tmpDir = makeTempDir('byid-oldformat');
    _sessionsDir = tmpDir;
    try {
      writeSession(tmpDir, '2026-01-10-session.tmp', '# Old Format');
      // Old format has shortId === 'no-id'; lookup by full filename without .tmp
      const result = sm.getSessionById('2026-01-10-session.tmp');
      assert.ok(result, 'should find old-format session');
      assert.strictEqual(result.shortId, 'no-id');
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ---- getSessionPath (integration sanity check) --------------------------
  console.log('\ngetSessionPath:');

  if (test('getSessionPath returns path combining sessions dir and filename', () => {
    const tmpDir = makeTempDir('spath');
    _sessionsDir = tmpDir;
    try {
      const result = sm.getSessionPath('2026-01-17-aabbccdd-session.tmp');
      assert.ok(result.startsWith(tmpDir));
      assert.ok(result.endsWith('2026-01-17-aabbccdd-session.tmp'));
    } finally {
      _sessionsDir = null;
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  // ---- Summary ------------------------------------------------------------
  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
