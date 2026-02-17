# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Everything Claude Code is a Claude Code plugin providing 196 agents, 1,035 skills, 89 commands, 29 rules, and 22 hooks. It is a configuration/content repository — no compiled output, zero runtime dependencies. All scripts are Node.js (ES2022, CommonJS) for cross-platform compatibility (Windows, macOS, Linux).

**Component breakdown:**
- 196 agents (specialized subagents — planner, security-reviewer, tdd-guide, code-reviewer, etc.)
- 1,035 skills (includes 940+ Composio automation skills for tool integrations)
- 89 commands (slash commands like `/commit`, `/tdd`, `/plan-feature`)
- 29 rules (14 common + language-specific for TypeScript, Python, Go)
- 22 hooks (PreToolUse, PostToolUse, SessionStart, SessionEnd, PreCompact, Stop)
- 69 tests (custom runner, zero framework dependencies)
- 21 scripts (cross-platform Node.js utilities powering hooks)

## Commands

```bash
# Install dependencies
npm ci

# Run all tests
node tests/run-all.js

# Run a single test file
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js

# Lint JavaScript
npx eslint scripts/**/*.js tests/**/*.js

# Lint Markdown (agents, skills, commands, rules)
npx markdownlint "agents/**/*.md" "skills/**/*.md" "commands/**/*.md" "rules/**/*.md"

# Validate components (CI scripts)
node scripts/ci/validate-agents.js
node scripts/ci/validate-hooks.js
node scripts/ci/validate-commands.js
node scripts/ci/validate-skills.js
node scripts/ci/validate-rules.js

# Security audit
npm audit --audit-level=high
```

## Architecture

The plugin follows a layered component model where each layer builds on the one below:

1. **Rules** (`rules/`) — Always-loaded guidelines. Structured as `common/` (language-agnostic) + language-specific directories (`typescript/`, `python/`, `golang/`). Rules cannot be distributed via the plugin system — users must copy them to `~/.claude/rules/`.

2. **Skills** (`skills/`) — Reusable workflow definitions and domain knowledge. Each skill is a directory containing a `SKILL.md`. Skills can reference other skills.

3. **Agents** (`agents/`) — Specialized subagents for delegation via the Task tool. Each is a single `.md` file with YAML frontmatter (`name`, `description`, `tools`, `model`). Registered in `.claude-plugin/plugin.json`.

4. **Commands** (`commands/`) — User-invoked slash commands (e.g., `/plan`, `/tdd`). Each is a `.md` file with YAML frontmatter. Commands orchestrate skills and agents.

5. **Hooks** (`hooks/hooks.json`) — Event-driven automations triggered on `PreToolUse`, `PostToolUse`, `SessionStart`, `SessionEnd`, `PreCompact`, and `Stop`. Implementations live in `scripts/hooks/`.

6. **Scripts** (`scripts/`) — Cross-platform Node.js utilities. `scripts/lib/` has shared code (utils, package-manager detection). `scripts/ci/` has CI validation scripts. `scripts/hooks/` has hook implementations.

**Plugin manifest:** `.claude-plugin/plugin.json` registers agents and skill/command paths. **CRITICAL:** Do NOT add a `"hooks"` field to `.claude-plugin/plugin.json` — Claude Code v2.1+ auto-loads `hooks/hooks.json` by convention. Adding it causes duplicate detection errors. This is enforced by a regression test in `tests/hooks/hooks.test.js`.

**Hooks auto-loading:** Hooks are loaded from `hooks/hooks.json` automatically. This avoids duplication and follows the Claude Code v2.1+ convention.

## Key Conventions

### Commit messages
Conventional commits format: `<type>: <description>`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`. Max header length: 100 characters. Scoped types encouraged: `feat(skills):`, `fix(hooks):`.

### ESLint config
ES2022, CommonJS. Prefix unused variables with `_`. Strict `no-undef`. `eqeqeq` as warning.

### Markdown files
All agents, skills, commands, and rules are Markdown with YAML frontmatter. Markdownlint is enforced.

### File naming
Lowercase with hyphens: `python-reviewer.md`, `tdd-workflow/SKILL.md`.

### Adding new components
- **Agent:** Create `agents/<name>.md` with frontmatter (`name`, `description`, `tools`, `model`), add path to `agents` array in `.claude-plugin/plugin.json`.
- **Skill:** Create `skills/<name>/SKILL.md` with frontmatter (`name`, `description`).
- **Command:** Create `commands/<name>.md` with frontmatter (`description`).
- **Rule:** Add to the appropriate `rules/common/` or `rules/<language>/` directory.
- **Hook:** Add entries to `hooks/hooks.json`; implement logic in `scripts/hooks/`.

### Testing
Tests use a custom Node.js test runner (no external framework). Test files follow `*.test.js` naming. The runner in `tests/run-all.js` executes all tests and aggregates results. CI runs tests across a matrix of 3 OS (ubuntu, windows, macos) × 3 Node versions (18, 20, 22) × 4 package managers (npm, pnpm, yarn, bun) = 36 combinations.

### Package manager detection
Scripts auto-detect package manager using this priority:
1. `CLAUDE_PACKAGE_MANAGER` env var
2. `.claude/package-manager.json` (project-level)
3. `package.json` `packageManager` field
4. Lock file detection (package-lock.json, pnpm-lock.yaml, yarn.lock, bun.lockb)
5. `~/.claude/package-manager.json` (global)
6. Fallback: first available in PATH

This enables cross-platform compatibility without hardcoded package manager assumptions.

## Important Development Notes

### Zero runtime dependencies
The project has ZERO runtime dependencies. All functionality uses vanilla Node.js (ES2022, CommonJS). Only dev dependencies are for linting (ESLint, markdownlint). This is a core design principle — never add runtime dependencies.

### Cross-platform scripts
All scripts in `scripts/` must work on Windows, macOS, and Linux. Use Node.js APIs, not bash-specific commands. Use `path.join()` for paths, avoid hardcoded slashes.

### CI validation
Before merging, CI validates:
- All agents have valid YAML frontmatter and required fields
- All skills have valid frontmatter
- All commands have valid frontmatter
- All rules are well-formed
- Hooks JSON is valid
- Tests pass on all 36 OS/Node/PM combinations
- No regression in hooks duplicate detection

Run validation scripts locally: `node scripts/ci/validate-agents.js` (and similar for hooks, commands, skills, rules).
