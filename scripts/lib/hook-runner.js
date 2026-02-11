#!/usr/bin/env node
/**
 * Hook Runner - Adapter bridge from Claude Code hook stdin to script argv[2]
 *
 * Claude Code hooks pass data via stdin as JSON: { tool_input: {...}, tool_output: {...} }
 * Many hook scripts expect input via process.argv[2] as a JSON string.
 * This adapter bridges the two interfaces.
 *
 * Usage in hooks.json:
 *   node "${CLAUDE_PLUGIN_ROOT}/scripts/lib/hook-runner.js" "${CLAUDE_PLUGIN_ROOT}/scripts/hooks/<script>.js"
 *
 * Cross-platform (Windows, macOS, Linux)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const scriptPath = process.argv[2];
if (!scriptPath) {
  process.exit(0);
}

// Validate the script exists before attempting to run
if (!fs.existsSync(scriptPath)) {
  console.error(`[hook-runner] Script not found: ${scriptPath}`);
  process.exit(0); // Don't block on missing scripts
}

let stdinData = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { stdinData += chunk; });
process.stdin.on('end', () => {
  let hookData = {};
  try {
    hookData = stdinData.trim() ? JSON.parse(stdinData) : {};
  } catch (_e) {
    // If stdin isn't valid JSON, pass empty object to script
  }

  // Extract tool_input for the target script (argv[2] format)
  const toolInput = hookData.tool_input || {};
  const inputArg = JSON.stringify(toolInput);

  // Spawn the target script with tool_input as argv[2]
  const child = spawn(process.execPath, [scriptPath, inputArg], {
    stdio: ['pipe', 'pipe', 'inherit'], // inherit stderr so script logs are visible
    env: process.env
  });

  let childStdout = '';
  child.stdout.on('data', chunk => { childStdout += chunk; });

  child.on('close', code => {
    // If child exited non-zero, propagate the block
    if (code !== 0) {
      if (childStdout.trim()) {
        process.stdout.write(childStdout);
      }
      process.exit(code);
    }

    // Parse child output to check for block decisions
    let childOutput = {};
    try {
      childOutput = childStdout.trim() ? JSON.parse(childStdout) : {};
    } catch (_e) {
      // Non-JSON output, pass through original stdin
    }

    if (childOutput.decision === 'block' || childOutput.blocked === true) {
      // Script wants to block — output its message and exit non-zero
      process.stdout.write(childStdout);
      process.exit(1);
    }

    // Pass through original stdin data for hook chaining
    if (stdinData.trim()) {
      process.stdout.write(stdinData);
    }
    process.exit(0);
  });

  child.on('error', err => {
    console.error(`[hook-runner] Failed to run ${path.basename(scriptPath)}: ${err.message}`);
    // Don't block on runner errors — pass through original data
    if (stdinData.trim()) {
      process.stdout.write(stdinData);
    }
    process.exit(0);
  });
});
