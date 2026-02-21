#!/usr/bin/env node
/**
 * Context Guard — Auto-block tool calls when context window is filling up.
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs as PreToolUse on Bash, Read, Grep, and Task tool calls.
 * After THRESHOLD calls, blocks the tool and tells Claude to /compact.
 * Allows a GRACE period of calls after blocking so Claude can compact.
 * Counter resets automatically when /compact is run (via pre-compact.js).
 *
 * Why this exists:
 *   Each Bash/Grep/Read call adds output to the conversation context.
 *   After ~30-40 heavy tool calls, the accumulated context causes
 *   "Prompt is too long" errors. This hook intercepts before that happens.
 */

'use strict';

const os   = require('os');
const fs   = require('fs');
const path = require('path');

const THRESHOLD = parseInt(process.env.CONTEXT_GUARD_THRESHOLD || '35', 10);
const GRACE     = 5; // Allow N calls after blocking so Claude can /compact

const sessionId = process.env.CLAUDE_SESSION_ID || String(process.ppid || 'default');
const tmpDir    = os.tmpdir();
const countFile = path.join(tmpDir, `ctx-guard-count-${sessionId}`);
const blockFile = path.join(tmpDir, `ctx-guard-block-${sessionId}`);

function readInt(f) {
  try { return parseInt(fs.readFileSync(f, 'utf8').trim(), 10) || 0; } catch { return 0; }
}

function writeInt(f, n) {
  try { fs.writeFileSync(f, String(n)); } catch { /* ignore write errors */ }
}

const count = readInt(countFile) + 1;
writeInt(countFile, count);

// Under threshold — allow freely
if (count < THRESHOLD) {
  process.exit(0);
}

// Over threshold — check grace period
const lastBlock      = readInt(blockFile);
const callsSinceBlock = lastBlock ? count - lastBlock : GRACE + 1;

if (callsSinceBlock > GRACE) {
  // Block: tell Claude to /compact before continuing
  writeInt(blockFile, count);
  console.log(
    `[ContextGuard] ${count} tool calls this session — context window is filling up.\n` +
    `Run /compact to compress conversation history and prevent "Prompt is too long" errors.\n` +
    `After compacting, this operation will proceed normally.`
  );
  process.exit(2); // Block the tool call
}

// Within grace period — allow so Claude can run /compact
process.exit(0);
