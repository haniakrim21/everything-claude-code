#!/usr/bin/env node
/**
 * Install Everything Claude Code skills, commands, and agents globally.
 *
 * Symlinks (default) or copies components into ~/.claude/ so they are
 * available in every Claude Code project on this machine.
 *
 * Usage:
 *   node scripts/install.js               # symlink skills + commands
 *   node scripts/install.js --copy        # copy instead of symlink
 *   node scripts/install.js --skills      # skills only
 *   node scripts/install.js --commands    # commands only
 *   node scripts/install.js --all         # skills + commands + agents
 *   node scripts/install.js --dry-run     # preview without writing
 *   node scripts/install.js --uninstall   # remove installed links/copies
 *   node scripts/install.js --status      # show what is installed
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── Paths ────────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');
const CLAUDE_DIR = path.join(os.homedir(), '.claude');

const SRC = {
  skills:   path.join(REPO_ROOT, 'skills'),
  commands: path.join(REPO_ROOT, 'commands'),
  agents:   path.join(REPO_ROOT, 'agents'),
};

const DEST = {
  skills:   path.join(CLAUDE_DIR, 'skills'),
  commands: path.join(CLAUDE_DIR, 'commands'),
  agents:   path.join(CLAUDE_DIR, 'agents'),
};

// ─── CLI flags ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
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
};

// Default: install skills + commands (agents are large, opt-in via --all or --agents)
const installSkills   = flags.all || flags.skills   || (!flags.commands && !flags.agents);
const installCommands = flags.all || flags.commands || (!flags.skills   && !flags.agents);
const installAgents   = flags.all || flags.agents;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg)   { process.stdout.write(msg + '\n'); }
function ok(msg)    { log(`  \u2713 ${msg}`); }
function skip(msg)  { log(`  \u2014 ${msg}`); }
function warn(msg)  { log(`  ! ${msg}`); }
function err(msg)   { log(`  \u2717 ${msg}`); }

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    if (!flags.dryRun) fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * List immediate child entries in a directory.
 * - skills:   subdirectories (each contains SKILL.md)
 * - commands: .md files directly in the directory
 * - agents:   .md files directly in the directory
 */
function listEntries(srcDir, type) {
  if (!fs.existsSync(srcDir)) return [];
  return fs.readdirSync(srcDir).filter(name => {
    if (name.startsWith('.') || name === 'README.md') return false;
    const full = path.join(srcDir, name);
    const stat = fs.statSync(full);
    if (type === 'agents' || type === 'commands') return stat.isFile() && name.endsWith('.md');
    return stat.isDirectory();
  });
}

// ─── Status ───────────────────────────────────────────────────────────────────

function showStatus() {
  log('\nEverything Claude Code — installation status\n');

  const categories = [
    { label: 'Skills',   src: SRC.skills,   dest: DEST.skills,   type: 'dir' },
    { label: 'Commands', src: SRC.commands, dest: DEST.commands, type: 'dir' },
    { label: 'Agents',   src: SRC.agents,   dest: DEST.agents,   type: 'file' },
  ];

  for (const { label, src, dest, type } of categories) {
    const entries = listEntries(src, type === 'file' ? 'agents' : label.toLowerCase());
    let linked = 0, copied = 0, missing = 0;

    for (const name of entries) {
      const destPath = path.join(dest, name);
      if (!fs.existsSync(destPath)) { missing++; continue; }
      try {
        const lstat = fs.lstatSync(destPath);
        if (lstat.isSymbolicLink()) linked++;
        else copied++;
      } catch { missing++; }
    }

    const total = entries.length;
    log(`${label} (${total} total):`);
    if (linked)  log(`    ${linked} symlinked`);
    if (copied)  log(`    ${copied} copied`);
    if (missing) log(`    ${missing} not installed`);
    if (!linked && !copied) log('    none installed');
    log('');
  }
}

// ─── Uninstall ────────────────────────────────────────────────────────────────

function uninstallCategory(srcDir, destDir, type) {
  const entries = listEntries(srcDir, type);
  let removed = 0;

  for (const name of entries) {
    const destPath = path.join(destDir, name);
    if (!fs.existsSync(destPath) && !fs.existsSync(destPath)) continue;

    try {
      const lstat = fs.lstatSync(destPath);
      if (lstat.isSymbolicLink()) {
        if (!flags.dryRun) fs.unlinkSync(destPath);
        ok(`removed symlink: ${name}`);
        removed++;
      } else if (lstat.isDirectory()) {
        if (!flags.dryRun) fs.rmSync(destPath, { recursive: true, force: true });
        ok(`removed copy: ${name}`);
        removed++;
      } else if (lstat.isFile()) {
        if (!flags.dryRun) fs.unlinkSync(destPath);
        ok(`removed: ${name}`);
        removed++;
      }
    } catch (e) {
      err(`failed to remove ${name}: ${e.message}`);
    }
  }

  return removed;
}

// ─── Install ──────────────────────────────────────────────────────────────────

function installEntry(srcPath, destPath, name) {
  // Already installed?
  if (fs.existsSync(destPath) || fs.existsSync(destPath)) {
    try {
      const lstat = fs.lstatSync(destPath);
      if (lstat.isSymbolicLink()) {
        const target = fs.readlinkSync(destPath);
        if (target === srcPath) {
          skip(`already linked: ${name}`);
          return 'skip';
        }
        // Wrong target — replace
        if (!flags.dryRun) fs.unlinkSync(destPath);
      } else {
        skip(`already exists (not a symlink): ${name}`);
        return 'skip';
      }
    } catch { /* continue */ }
  }

  if (flags.copy) {
    if (!flags.dryRun) {
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
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
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function installCategory(label, srcDir, destDir, type) {
  log(`\n${label}`);
  log('─'.repeat(40));

  if (!fs.existsSync(srcDir)) {
    warn(`source directory not found: ${srcDir}`);
    return { done: 0, skipped: 0 };
  }

  ensureDir(destDir);
  const entries = listEntries(srcDir, type);
  let done = 0, skipped = 0;

  for (const name of entries) {
    const srcPath = path.join(srcDir, name);
    const destPath = path.join(destDir, name);
    const result = installEntry(srcPath, destPath, name);
    if (result === 'done') done++;
    else skipped++;
  }

  log(`\n  ${done} installed, ${skipped} skipped`);
  return { done, skipped };
}

// ─── Help ─────────────────────────────────────────────────────────────────────

function showHelp() {
  log(`
Everything Claude Code — Install Script

Symlinks (or copies) skills, commands, and agents into ~/.claude/ so
they are available in every Claude Code project on this machine.

Usage:
  node scripts/install.js [options]

Options:
  (none)         Install skills + commands (default)
  --skills       Install skills only
  --commands     Install commands only
  --agents       Install agents only
  --all          Install skills + commands + agents
  --copy         Copy files instead of symlinking
  --dry-run      Preview what would be installed without writing
  --uninstall    Remove all installed links/copies
  --status       Show current installation status
  --help         Show this message

Examples:
  node scripts/install.js               # symlink skills + commands globally
  node scripts/install.js --all         # include agents too
  node scripts/install.js --copy        # copy instead of symlink
  node scripts/install.js --dry-run     # preview
  node scripts/install.js --status      # check what's installed
  node scripts/install.js --uninstall   # remove everything
`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (flags.help) { showHelp(); process.exit(0); }

  log('\nEverything Claude Code — Installer');
  log(`Mode: ${flags.dryRun ? 'DRY RUN — ' : ''}${flags.copy ? 'copy' : 'symlink'}`);
  log(`Target: ${CLAUDE_DIR}`);

  if (flags.status) { showStatus(); process.exit(0); }

  if (flags.uninstall) {
    log('\nUninstalling...');
    let total = 0;
    if (installSkills)   total += uninstallCategory(SRC.skills,   DEST.skills,   'skills');
    if (installCommands) total += uninstallCategory(SRC.commands, DEST.commands, 'commands');
    if (installAgents)   total += uninstallCategory(SRC.agents,   DEST.agents,   'agents');

    log(`\nDone. Removed ${total} entries.`);
    process.exit(0);
  }

  let totalDone = 0;
  let totalSkipped = 0;

  if (installSkills) {
    const r = installCategory('Skills',   SRC.skills,   DEST.skills,   'skills');
    totalDone += r.done; totalSkipped += r.skipped;
  }
  if (installCommands) {
    const r = installCategory('Commands', SRC.commands, DEST.commands, 'commands');
    totalDone += r.done; totalSkipped += r.skipped;
  }
  if (installAgents) {
    const r = installCategory('Agents',   SRC.agents,   DEST.agents,   'agents');
    totalDone += r.done; totalSkipped += r.skipped;
  }

  log('\n' + '═'.repeat(40));
  log(`Total: ${totalDone} installed, ${totalSkipped} skipped`);
  if (flags.dryRun) log('\n(dry run — nothing was written)');
  log('');
  log('All skills are now available in every Claude Code project.');
  log('Reload Claude Code if it is currently open.\n');
}

main();
