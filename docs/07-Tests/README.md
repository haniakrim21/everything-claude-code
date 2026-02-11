# Testing Strategy

## Overview

- **69 tests** across 3 test suites
- **Custom test runner** — no external framework dependencies
- **CI matrix:** 3 OS (Ubuntu, Windows, macOS) x 3 Node versions (18, 20, 22) x 4 package managers (npm, pnpm, yarn, bun)

## Running Tests

```bash
# All tests
node tests/run-all.js

# Individual suites
node tests/lib/utils.test.js           # 27 tests
node tests/lib/package-manager.test.js  # 23 tests
node tests/hooks/hooks.test.js          # 19 tests
```

## Test Suites

### 1. Utils (`tests/lib/utils.test.js`) — 27 tests

Core utility functions:
- Platform detection (OS, architecture)
- File operations (read, write, exists, temp files)
- Date/time formatting
- String utilities (slugify, truncate, sanitize)
- Path normalization (cross-platform)
- JSON parsing with fallbacks

### 2. Package Manager (`tests/lib/package-manager.test.js`) — 23 tests

Auto-detection and command mapping:
- Detects npm, pnpm, yarn, bun from lock files
- Falls back to npm when no lock file present
- Maps abstract commands to manager-specific syntax
- Handles edge cases (multiple lock files, corrupted files)

### 3. Hooks (`tests/hooks/hooks.test.js`) — 19 tests

Hook system validation:
- `hooks.json` structure validation (valid JSON, required fields)
- Matcher patterns compile correctly (regex, glob)
- Blocking hooks exit non-zero with reason
- Async hooks have timeouts defined
- No hook blocks on its own failure
- `plugin.json` does NOT have explicit hooks declaration (regression)

## CI Validation Scripts

```bash
node scripts/ci/validate-hooks.js      # 22 hook matchers
node scripts/ci/validate-agents.js     # 490 agent files
node scripts/ci/validate-commands.js   # 359 command files
node scripts/ci/validate-skills.js     # 854 skill directories
node scripts/ci/validate-rules.js      # 38 rule files
```

Each validator checks:
- File exists and is readable
- YAML frontmatter parses correctly
- Required fields are present
- No duplicate names or conflicting definitions

## Test Philosophy

### What We Test

| Layer | What's tested | How |
|---|---|---|
| Scripts | Pure functions, utilities | Unit tests with assertions |
| Hooks | JSON structure, matchers, decisions | Structural validation |
| Agents | Frontmatter, required fields | CI validator |
| Commands | Frontmatter, descriptions | CI validator |
| Skills | Directory structure, SKILL.md | CI validator |
| Rules | File presence, no conflicts | CI validator |

### What We Don't Test

- Claude Code runtime behavior (tested by Anthropic)
- Individual agent prompt quality (validated by usage)
- Skill content accuracy (maintained by domain experts)
- Hook script integration with live Claude sessions (requires manual verification)

## Test Runner Design

The custom runner (`tests/run-all.js`) was chosen over external frameworks because:

1. **Zero dependencies** — no node_modules needed
2. **Cross-platform** — works identically on Windows, macOS, Linux
3. **Fast** — no framework overhead, runs in <2 seconds
4. **Simple** — each test file is a standalone script with assertions
5. **CI-friendly** — exits non-zero on any failure

## Adding Tests

```javascript
// tests/my-feature.test.js
const assert = require('assert');

// Group tests
console.log('My Feature Tests:');

// Individual test
try {
  const result = myFunction('input');
  assert.strictEqual(result, 'expected');
  console.log('  PASS: myFunction returns expected value');
} catch (e) {
  console.error('  FAIL: myFunction returns expected value');
  console.error('   ', e.message);
  process.exitCode = 1;
}
```

Register in `tests/run-all.js` to include in the full suite.

## Coverage Target

**80% minimum** — enforced by the `tdd-guide` agent and `auto-test` hook for project code. The plugin itself maintains functional coverage through structural validation rather than line-level coverage metrics.
