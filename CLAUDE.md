# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Everything Claude Code is a Claude Code plugin providing production-ready agents, skills, hooks, commands, and rules. It is a configuration/content repository — no compiled output, no runtime dependencies. All scripts are Node.js (ES2022, CommonJS) for cross-platform compatibility (Windows, macOS, Linux).

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

**Plugin manifest:** `.claude-plugin/plugin.json` registers agents and skill/command paths. Do NOT add a `"hooks"` field — Claude Code v2.1+ auto-loads `hooks/hooks.json` by convention. Adding it causes duplicate detection errors. This is enforced by a regression test.

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
Tests use a custom Node.js test runner (no external framework). Test files follow `*.test.js` naming. CI runs tests across a matrix of OS (ubuntu, windows, macos), Node versions (18, 20, 22), and package managers (npm, pnpm, yarn, bun).
