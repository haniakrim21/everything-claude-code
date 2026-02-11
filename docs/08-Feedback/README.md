# Feedback & Learnings

## What Worked Well

### 1. Global Installation Model
Installing to `~/.claude/` (user-level) instead of per-project was the highest-leverage decision. Every project gets the full toolkit without setup. No `.npmrc`, no `devDependencies`, no lock file conflicts.

### 2. stdin-to-argv Adapter Bridge
The `hook-runner.js` pattern solved the impedance mismatch between Claude Code's stdin-based hook protocol and our argv-based scripts. One 91-line file unified 14 scripts without modifying any of them.

### 3. Async PostToolUse Hooks
Making lint, typecheck, test, and bundle hooks async with timeouts was critical. Synchronous PostToolUse hooks would have made every edit feel slow. The current design gives instant feedback without blocking flow.

### 4. Progressive Disclosure in Commands
The 3-tier command system works well:
- Tier 1 (`/commit`) — zero friction for daily tasks
- Tier 2 (`/fix-issue 42`) — targeted with an argument
- Tier 3 (`/riper`) — full multi-phase workflows when needed

### 5. Guard Rails, Not Gates
Blocking only destructive actions (force push, leaked secrets) while warning on risky patterns (console.log, missing tests) hit the right balance. Developers don't fight the system.

## What We'd Do Differently

### 1. Hook Testing Earlier
The 14 disconnected hook scripts existed before `hooks.json` wired them up. Earlier integration testing would have caught the stdin/argv mismatch sooner.

### 2. Agent Count Management
490 agents is powerful but overwhelming for discoverability. A tiered system (core 13 bundled + extended installable) was the right call, but clearer categorization in the agent index would help.

### 3. Skill Deduplication
854 skills accumulated organically. Some overlap exists between similar domains (e.g., `postgres-patterns` vs `postgres-optimization` vs `database-optimization`). A periodic dedup pass would reduce confusion.

### 4. Documentation-Driven Development
This docs/ folder should have been created at project inception, not after 359 commands and 490 agents were built. Writing requirements first would have prevented some naming inconsistencies.

## Recurring Patterns

### Pattern: "Detect, Don't Configure"
The most successful components auto-detect context:
- Package manager detection from lock files
- Language detection from file extensions
- Project type detection from config files
- Agent selection from task context

**Lesson:** Every time we added a configuration option, we later replaced it with auto-detection.

### Pattern: "Fix It, Don't Flag It"
Auto-formatting (lint-fix) is used 10x more than manual warnings. When something can be fixed automatically, fix it. When it can't, block or warn — but never require manual action for fixable issues.

### Pattern: "One Command, Full Workflow"
The most-used commands (`/do-issue`, `/commit`, `/riper`) orchestrate multiple steps. Users want outcomes, not intermediate steps. Commands that do one thing well are utilities; commands that complete a workflow are products.

## Open Questions

1. **Internationalization** — `docs/zh-CN/` and `docs/zh-TW/` directories exist but are empty. Is there demand for translated documentation?
2. **Plugin marketplace** — Should extended agents be installable individually, or always bundled?
3. **Telemetry** — The `learning-log` hook captures session patterns locally. Would opt-in anonymized telemetry improve the plugin?
4. **Version management** — As the plugin grows, should components be independently versioned?

## Metrics

| Metric | Value |
|---|---|
| Commands | 359 |
| Agents | 490 (13 bundled + 477 extended) |
| Skills | 854 |
| Rules | 38 (20 common + 18 language-specific) |
| Hooks | 22 (6 PreToolUse + 8 PostToolUse + 2 SessionStart + 3 SessionEnd + 1 PreCompact + 2 Stop) |
| Tests | 69 (27 utils + 23 package-manager + 19 hooks) |
| CI matrix | 36 combinations (3 OS x 3 Node x 4 pkg managers) |
| Scripts | 21 (16 hooks + 5 CI validators) |
| External dependencies | 0 (runtime) |
