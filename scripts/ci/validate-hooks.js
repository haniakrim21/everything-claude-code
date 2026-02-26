#!/usr/bin/env node
/**
 * Validate hooks.json schema
 */

const fs = require('fs');
const path = require('path');

const HOOKS_FILE = path.join(__dirname, '../../hooks/hooks.json');
const VALID_EVENTS = ['PreToolUse', 'PostToolUse', 'PreCompact', 'SessionStart', 'SessionEnd', 'Stop', 'Notification', 'SubagentStop'];

function validateHooks() {
  if (!fs.existsSync(HOOKS_FILE)) {
    console.log('No hooks.json found, skipping validation');
    process.exit(0);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(HOOKS_FILE, 'utf-8'));
  } catch (e) {
    console.error(`ERROR: Invalid JSON in hooks.json: ${e.message}`);
    process.exit(1);
  }

  // Support both object format { hooks: {...} } and array format
  const hooks = data.hooks || data;
  let hasErrors = false;
  let totalMatchers = 0;

  if (typeof hooks === 'object' && !Array.isArray(hooks)) {
    // Object format: { EventType: [matchers] }
    for (const [eventType, matchers] of Object.entries(hooks)) {
      if (!VALID_EVENTS.includes(eventType)) {
        console.error(`ERROR: Invalid event type: ${eventType}`);
        hasErrors = true;
        continue;
      }

      if (!Array.isArray(matchers)) {
        console.error(`ERROR: ${eventType} must be an array`);
        hasErrors = true;
        continue;
      }

      for (let i = 0; i < matchers.length; i++) {
        const matcher = matchers[i];
        if (typeof matcher !== 'object' || matcher === null) {
          console.error(`ERROR: ${eventType}[${i}] is not an object`);
          hasErrors = true;
          continue;
        }
        if (!matcher.matcher) {
          console.error(`ERROR: ${eventType}[${i}] missing 'matcher' field`);
          hasErrors = true;
        }
        if (!matcher.hooks || !Array.isArray(matcher.hooks)) {
          console.error(`ERROR: ${eventType}[${i}] missing 'hooks' array`);
          hasErrors = true;
        } else {
          // Validate each hook entry
          for (let j = 0; j < matcher.hooks.length; j++) {
            const hook = matcher.hooks[j];
            if (!hook.type || typeof hook.type !== 'string') {
              console.error(`ERROR: ${eventType}[${i}].hooks[${j}] missing or invalid 'type' field`);
              hasErrors = true;
            }
            if (!hook.command || (typeof hook.command !== 'string' && !Array.isArray(hook.command))) {
              console.error(`ERROR: ${eventType}[${i}].hooks[${j}] missing or invalid 'command' field`);
              hasErrors = true;
            }
          }
        }
        totalMatchers++;
      }
    }
  } else if (Array.isArray(hooks)) {
    // Array format (legacy)
    for (let i = 0; i < hooks.length; i++) {
      const hook = hooks[i];
      if (!hook.matcher) {
        console.error(`ERROR: Hook ${i} missing 'matcher' field`);
        hasErrors = true;
      }
      if (!hook.hooks || !Array.isArray(hook.hooks)) {
        console.error(`ERROR: Hook ${i} missing 'hooks' array`);
        hasErrors = true;
      } else {
        // Validate each hook entry
        for (let j = 0; j < hook.hooks.length; j++) {
          const h = hook.hooks[j];
          if (!h.type || typeof h.type !== 'string') {
            console.error(`ERROR: Hook ${i}.hooks[${j}] missing or invalid 'type' field`);
            hasErrors = true;
          }
          if (!h.command || (typeof h.command !== 'string' && !Array.isArray(h.command))) {
            console.error(`ERROR: Hook ${i}.hooks[${j}] missing or invalid 'command' field`);
            hasErrors = true;
          }
        }
      }
      totalMatchers++;
    }
  } else {
    console.error('ERROR: hooks.json must be an object or array');
    process.exit(1);
  }

  if (hasErrors) {
    process.exit(1);
  }

  // Verify hook scripts exist on disk
  const PLUGIN_ROOT = path.resolve(__dirname, '..', '..');
  let scriptErrors = 0;
  for (const [, hookArray] of Object.entries(hooks)) {
    if (!Array.isArray(hookArray)) continue;
    for (const entry of hookArray) {
      if (!entry.hooks || !Array.isArray(entry.hooks)) continue;
      for (const hook of entry.hooks) {
        if (hook.type === 'command' && typeof hook.command === 'string' && hook.command.includes('scripts/hooks/')) {
          const resolved = hook.command
            .replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, PLUGIN_ROOT)
            .split(' ')
            .map(p => p.replace(/^"|"$/g, ''))
            .find(p => p.includes('scripts/hooks/'));
          if (resolved && !fs.existsSync(resolved)) {
            console.error(`  ERROR: Hook script not found: ${resolved}`);
            scriptErrors++;
          }
        }
      }
    }
  }
  if (scriptErrors > 0) process.exit(1);

  // Detect hook scripts on disk that are not referenced in hooks.json
  const HOOKS_SCRIPTS_DIR = path.join(PLUGIN_ROOT, 'scripts', 'hooks');
  if (fs.existsSync(HOOKS_SCRIPTS_DIR)) {
    const referenced = new Set();
    for (const [, hookArray] of Object.entries(hooks)) {
      if (!Array.isArray(hookArray)) continue;
      for (const entry of hookArray) {
        if (!entry.hooks || !Array.isArray(entry.hooks)) continue;
        for (const hook of entry.hooks) {
          if (typeof hook.command === 'string') {
            const m = hook.command.match(/scripts\/hooks\/([a-z0-9-]+\.js)/);
            if (m) referenced.add(m[1]);
          }
        }
      }
    }
    const onDisk = fs.readdirSync(HOOKS_SCRIPTS_DIR).filter(f => f.endsWith('.js'));
    const orphaned = onDisk.filter(f => !referenced.has(f));
    if (orphaned.length > 0) {
      console.warn(`  WARN: ${orphaned.length} hook script(s) not referenced in hooks.json: ${orphaned.join(', ')}`);
    }
  }

  console.log(`Validated ${totalMatchers} hook matchers`);
}

validateHooks();
