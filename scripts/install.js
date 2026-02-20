#!/usr/bin/env node
/**
 * Install Everything Claude Code globally — skills, commands, agents, hooks, and scripts.
 *
 * Skills/commands/agents are symlinked (or copied) into ~/.claude/.
 * Hooks are merged into ~/.claude/settings.json so they auto-activate on every project.
 * Scripts are symlinked to ~/.claude/scripts/ (required by hooks).
 * CLAUDE_PLUGIN_ROOT env var is set in settings.json pointing to this repo.
 *
 * Usage:
 *   node scripts/install.js           # symlink skills + commands + hooks (default)
 *   node scripts/install.js --all     # everything: skills + commands + agents + hooks
 *   node scripts/install.js --copy    # copy instead of symlink
 *   node scripts/install.js --skills  # skills only
 *   node scripts/install.js --commands
 *   node scripts/install.js --agents
 *   node scripts/install.js --hooks   # hooks + scripts only
 *   node scripts/install.js --dry-run
 *   node scripts/install.js --uninstall
 *   node scripts/install.js --status
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

// ─── Paths ────────────────────────────────────────────────────────────────────

const REPO_ROOT  = path.resolve(__dirname, '..');
const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const SETTINGS   = path.join(CLAUDE_DIR, 'settings.json');

const SRC = {
  skills:   path.join(REPO_ROOT, 'skills'),
  commands: path.join(REPO_ROOT, 'commands'),
  agents:   path.join(REPO_ROOT, 'agents'),
  hooks:    path.join(REPO_ROOT, 'hooks', 'hooks.json'),
  scripts:  path.join(REPO_ROOT, 'scripts'),
};

const DEST = {
  skills:   path.join(CLAUDE_DIR, 'skills'),
  commands: path.join(CLAUDE_DIR, 'commands'),
  agents:   path.join(CLAUDE_DIR, 'agents'),
  scripts:  path.join(CLAUDE_DIR, 'scripts'),
};

// ─── CLI flags ────────────────────────────────────────────────────────────────

const args  = process.argv.slice(2);
const flags = {
  copy:      args.includes('--copy'),
  dryRun:    args.includes('--dry-run'),
  uninstall: args.includes('--uninstall'),
  status:    args.includes('--status'),
  help:      args.includes('--help') || args.includes('-h'),
  all:       args.includes('--all'),
  skills:    args.includes('--skills'),
  commands:  args.includes('--commands'),
  agents:    args.includes('--agents'),
  hooks:     args.includes('--hooks'),
};

const anySpecific = flags.skills || flags.commands || flags.agents || flags.hooks;

const installSkills   = flags.all || flags.skills   || !anySpecific;
const installCommands = flags.all || flags.commands || !anySpecific;
const installAgents   = flags.all || flags.agents;
const installHooks    = flags.all || flags.hooks    || !anySpecific;

// ─── Logging ──────────────────────────────────────────────────────────────────

function log(msg)  { process.stdout.write(msg + '\n'); }
function ok(msg)   { log(`  \u2713 ${msg}`); }
function skip(msg) { log(`  \u2014 ${msg}`); }
function warn(msg) { log(`  ! ${msg}`); }
function fail(msg) { log(`  \u2717 ${msg}`); }

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath) && !flags.dryRun) fs.mkdirSync(dirPath, { recursive: true });
}

// ─── Entry listing ────────────────────────────────────────────────────────────

function listEntries(srcDir, type) {
  if (!fs.existsSync(srcDir)) return [];
  return fs.readdirSync(srcDir).filter(name => {
    if (name.startsWith('.') || name === 'README.md') return false;
    const stat = fs.statSync(path.join(srcDir, name));
    if (type === 'agents' || type === 'commands') return stat.isFile() && name.endsWith('.md');
    return stat.isDirectory();
  });
}

// ─── Settings helpers ─────────────────────────────────────────────────────────

function readSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS, 'utf8')); } catch { return {}; }
}

function writeSettings(data) {
  if (!flags.dryRun) fs.writeFileSync(SETTINGS, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// ─── Hooks install ────────────────────────────────────────────────────────────

function installHooksAndScripts() {
  log('\nHooks & Scripts');
  log('─'.repeat(40));

  if (!fs.existsSync(SRC.hooks)) {
    warn('hooks/hooks.json not found — skipping');
    return;
  }

  // 1. Symlink scripts/ → ~/.claude/scripts so hook-runner.js resolves
  const scriptsDest = DEST.scripts;
  if (!fs.existsSync(scriptsDest)) {
    if (!flags.dryRun) fs.symlinkSync(SRC.scripts, scriptsDest);
    ok('linked: scripts/ → ~/.claude/scripts/');
  } else {
    try {
      const lstat = fs.lstatSync(scriptsDest);
      if (lstat.isSymbolicLink() && fs.readlinkSync(scriptsDest) === SRC.scripts) {
        skip('already linked: scripts/');
      } else {
        skip('scripts/ already exists (not replaced)');
      }
    } catch { skip('scripts/ exists'); }
  }

  // 2. Set CLAUDE_PLUGIN_ROOT in settings.json env
  const settings = readSettings();
  if (!settings.env) settings.env = {};

  if (settings.env.CLAUDE_PLUGIN_ROOT === REPO_ROOT) {
    skip('CLAUDE_PLUGIN_ROOT already set');
  } else {
    settings.env.CLAUDE_PLUGIN_ROOT = REPO_ROOT;
    ok(`set CLAUDE_PLUGIN_ROOT = ${REPO_ROOT}`);
  }

  // 3. Merge hooks from hooks.json into settings.json
  const repoHooks = JSON.parse(fs.readFileSync(SRC.hooks, 'utf8')).hooks || {};
  if (!settings.hooks) settings.hooks = {};

  let added = 0, skipped = 0;
  for (const [event, hookList] of Object.entries(repoHooks)) {
    if (!settings.hooks[event]) settings.hooks[event] = [];
    const existingJson = settings.hooks[event].map(h => JSON.stringify(h));

    for (const hook of hookList) {
      const hookJson = JSON.stringify(hook);
      if (existingJson.includes(hookJson)) {
        skipped++;
      } else {
        settings.hooks[event].push(hook);
        added++;
      }
    }
  }

  writeSettings(settings);
  ok(`hooks merged: ${added} added, ${skipped} already present`);
  log(`\n  hooks + scripts installed`);
}

function uninstallHooksAndScripts() {
  // Remove scripts symlink
  if (fs.existsSync(DEST.scripts)) {
    try {
      const lstat = fs.lstatSync(DEST.scripts);
      if (lstat.isSymbolicLink()) {
        if (!flags.dryRun) fs.unlinkSync(DEST.scripts);
        ok('removed symlink: scripts/');
      }
    } catch { /* ignore */ }
  }

  // Remove CLAUDE_PLUGIN_ROOT and hooks from settings
  const settings = readSettings();
  let changed = false;

  if (settings.env && settings.env.CLAUDE_PLUGIN_ROOT) {
    delete settings.env.CLAUDE_PLUGIN_ROOT;
    ok('removed CLAUDE_PLUGIN_ROOT from env');
    changed = true;
  }

  if (settings.hooks && Object.keys(settings.hooks).length > 0) {
    // Load repo hooks to know which ones to remove
    if (fs.existsSync(SRC.hooks)) {
      const repoHooks = JSON.parse(fs.readFileSync(SRC.hooks, 'utf8')).hooks || {};
      let removed = 0;
      for (const [event, hookList] of Object.entries(repoHooks)) {
        if (!settings.hooks[event]) continue;
        const repoSet = new Set(hookList.map(h => JSON.stringify(h)));
        const before = settings.hooks[event].length;
        settings.hooks[event] = settings.hooks[event].filter(h => !repoSet.has(JSON.stringify(h)));
        removed += before - settings.hooks[event].length;
        if (settings.hooks[event].length === 0) delete settings.hooks[event];
      }
      ok(`removed ${removed} hook entries`);
      changed = true;
    }
  }

  if (changed) writeSettings(settings);
}

// ─── Status ───────────────────────────────────────────────────────────────────

function showStatus() {
  log('\nEverything Claude Code — installation status\n');

  const cats = [
    { label: 'Skills',   src: SRC.skills,   dest: DEST.skills,   type: 'skills' },
    { label: 'Commands', src: SRC.commands, dest: DEST.commands, type: 'commands' },
    { label: 'Agents',   src: SRC.agents,   dest: DEST.agents,   type: 'agents' },
  ];

  for (const { label, src, dest, type } of cats) {
    const entries = listEntries(src, type);
    let linked = 0, copied = 0, missing = 0;
    for (const name of entries) {
      const dp = path.join(dest, name);
      if (!fs.existsSync(dp)) { missing++; continue; }
      try { fs.lstatSync(dp).isSymbolicLink() ? linked++ : copied++; }
      catch { missing++; }
    }
    log(`${label} (${entries.length} total):`);
    if (linked)  log(`    ${linked} symlinked`);
    if (copied)  log(`    ${copied} copied`);
    if (missing) log(`    ${missing} not installed`);
    if (!linked && !copied) log('    none installed');
    log('');
  }

  // Hooks status
  const settings = readSettings();
  const pluginRoot = settings.env && settings.env.CLAUDE_PLUGIN_ROOT;
  const hookCount  = Object.values(settings.hooks || {}).reduce((s, a) => s + a.length, 0);

  log('Hooks:');
  log(`    CLAUDE_PLUGIN_ROOT: ${pluginRoot || 'not set'}`);
  log(`    Active hook entries in settings.json: ${hookCount}`);
  log(`    Scripts linked: ${fs.existsSync(DEST.scripts) ? 'yes' : 'no'}`);
  log('');
}

// ─── Uninstall ────────────────────────────────────────────────────────────────

function uninstallCategory(srcDir, destDir, type) {
  const entries = listEntries(srcDir, type);
  let removed = 0;
  for (const name of entries) {
    const dp = path.join(destDir, name);
    try {
      const lstat = fs.lstatSync(dp);
      if (lstat.isSymbolicLink()) {
        if (!flags.dryRun) fs.unlinkSync(dp);
      } else if (lstat.isDirectory()) {
        if (!flags.dryRun) fs.rmSync(dp, { recursive: true, force: true });
      } else if (lstat.isFile()) {
        if (!flags.dryRun) fs.unlinkSync(dp);
      }
      ok(`removed: ${name}`);
      removed++;
    } catch { /* not installed */ }
  }
  return removed;
}

// ─── Install entries ──────────────────────────────────────────────────────────

function installEntry(srcPath, destPath, name) {
  if (fs.existsSync(destPath)) {
    try {
      const lstat = fs.lstatSync(destPath);
      if (lstat.isSymbolicLink() && fs.readlinkSync(destPath) === srcPath) {
        skip(`already linked: ${name}`);
        return 'skip';
      }
      if (lstat.isSymbolicLink()) {
        if (!flags.dryRun) fs.unlinkSync(destPath); // replace stale link
      } else {
        skip(`already exists: ${name}`);
        return 'skip';
      }
    } catch { /* continue */ }
  }

  if (flags.copy) {
    if (!flags.dryRun) {
      fs.statSync(srcPath).isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
    }
    ok(`copied: ${name}`);
  } else {
    if (!flags.dryRun) fs.symlinkSync(srcPath, destPath);
    ok(`linked: ${name}`);
  }
  return 'done';
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry), d = path.join(dest, entry);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function installCategory(label, srcDir, destDir, type) {
  log(`\n${label}`);
  log('─'.repeat(40));
  if (!fs.existsSync(srcDir)) { warn(`not found: ${srcDir}`); return { done: 0, skipped: 0 }; }
  ensureDir(destDir);
  let done = 0, skipped = 0;
  for (const name of listEntries(srcDir, type)) {
    const r = installEntry(path.join(srcDir, name), path.join(destDir, name), name);
    r === 'done' ? done++ : skipped++;
  }
  log(`\n  ${done} installed, ${skipped} skipped`);
  return { done, skipped };
}

// ─── Help ─────────────────────────────────────────────────────────────────────

function showHelp() {
  log(`
Everything Claude Code — Install Script

Installs skills, commands, agents, and hooks globally into ~/.claude/
so they auto-activate in every Claude Code project on this machine.

Usage:
  node scripts/install.js [options]

Options:
  (none)         Skills + commands + hooks (default)
  --all          Everything: skills + commands + agents + hooks
  --skills       Skills only
  --commands     Commands only
  --agents       Agents only
  --hooks        Hooks + scripts only
  --copy         Copy files instead of symlinking
  --dry-run      Preview without writing
  --uninstall    Remove everything installed by this script
  --status       Show current installation state
  --help         Show this message

npm shortcuts:
  npm run install-skills   # skills + commands + hooks
  npm run install-all      # include agents too
  npm run install-copy     # copy instead of symlink
  npm run uninstall        # remove everything
  npm run status           # check what's installed
`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (flags.help) { showHelp(); process.exit(0); }

  log('\nEverything Claude Code — Installer');
  log(`Mode: ${flags.dryRun ? 'DRY RUN  ' : ''}${flags.copy ? 'copy' : 'symlink'}`);
  log(`Target: ${CLAUDE_DIR}`);

  if (flags.status) { showStatus(); process.exit(0); }

  if (flags.uninstall) {
    log('\nUninstalling...');
    let total = 0;
    if (installSkills)   total += uninstallCategory(SRC.skills,   DEST.skills,   'skills');
    if (installCommands) total += uninstallCategory(SRC.commands, DEST.commands, 'commands');
    if (installAgents)   total += uninstallCategory(SRC.agents,   DEST.agents,   'agents');
    if (installHooks)    uninstallHooksAndScripts();
    log(`\nDone. Removed ${total} file entries.`);
    process.exit(0);
  }

  let totalDone = 0, totalSkipped = 0;

  if (installSkills)   { const r = installCategory('Skills',   SRC.skills,   DEST.skills,   'skills');   totalDone += r.done; totalSkipped += r.skipped; }
  if (installCommands) { const r = installCategory('Commands', SRC.commands, DEST.commands, 'commands'); totalDone += r.done; totalSkipped += r.skipped; }
  if (installAgents)   { const r = installCategory('Agents',   SRC.agents,   DEST.agents,   'agents');   totalDone += r.done; totalSkipped += r.skipped; }
  if (installHooks)    installHooksAndScripts();

  log('\n' + '═'.repeat(40));
  log(`Total: ${totalDone} installed, ${totalSkipped} skipped`);
  if (flags.dryRun) log('\n(dry run — nothing was written)');
  log('');
  log('Everything is installed. Skills, commands, and hooks are now');
  log('active in every Claude Code project on this machine.');
  log('Reload Claude Code if it is currently open.\n');
}

main();
