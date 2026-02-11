# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Claude Code Runtime                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  Rules    │  │  Skills  │  │  Agents  │  │ Commands │           │
│  │  (38)     │  │  (854)   │  │  (490)   │  │  (359)   │           │
│  │ always on │  │ auto-load│  │ auto-pick│  │ user /cmd│           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│       ↑              ↑             ↑             ↑                  │
│       └──────────────┴─────────────┴─────────────┘                  │
│                            ↑                                        │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                    Hooks Engine (22)                      │       │
│  │  PreToolUse(6) PostToolUse(8) Session(5) Compact(1) Stop(2) │   │
│  └─────────────────────────────────────────────────────────┘       │
│                            ↑                                        │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │              Scripts (scripts/)                           │       │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │       │
│  │  │ lib/         │  │ hooks/        │  │ ci/            │  │       │
│  │  │ utils.js     │  │ 16 scripts    │  │ 5 validators   │  │       │
│  │  │ hook-runner  │  │               │  │                │  │       │
│  │  │ pkg-manager  │  │               │  │                │  │       │
│  │  │ session-*    │  │               │  │                │  │       │
│  │  └─────────────┘  └──────────────┘  └───────────────┘  │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Layout

```
everything-claude-code/
├── .claude-plugin/
│   └── plugin.json          # Manifest — registers agents + skill/command paths
├── agents/                  # 490 agent definitions (.md with YAML frontmatter)
├── commands/                # 359 slash commands (.md with YAML frontmatter)
├── skills/                  # 854 skills (directories with SKILL.md)
├── rules/
│   ├── common/              # Language-agnostic rules (20)
│   ├── typescript/          # TypeScript rules (5)
│   ├── python/              # Python rules (5)
│   └── golang/              # Go rules (5)
├── hooks/
│   └── hooks.json           # 22 hook definitions (auto-loaded by convention)
├── scripts/
│   ├── lib/                 # Shared utilities
│   │   ├── utils.js         # Platform detection, file ops, dates
│   │   ├── hook-runner.js   # stdin → argv[2] adapter bridge
│   │   ├── package-manager.js  # Auto-detect npm/pnpm/yarn/bun
│   │   └── session-aliases.js  # Session alias management
│   ├── hooks/               # Hook implementations (16 scripts)
│   └── ci/                  # CI validation scripts (5)
├── tests/                   # Test suite (69 tests)
└── docs/                    # This documentation
```

## Data Flow

### PreToolUse Hook Flow
```
Claude invokes tool (e.g., Bash with "git push --force main")
  ↓
hooks.json matcher evaluates: tool == "Bash" && command matches "git push"
  ↓
hook-runner.js reads stdin JSON → extracts tool_input → passes as argv[2]
  ↓
pre-push-check.js evaluates command
  ↓
Decision: { decision: "block", reason: "Force pushing to main is blocked" }
  ↓
hook-runner.js detects block → exits non-zero → tool execution prevented
```

### PostToolUse Hook Flow (async)
```
Claude edits a .ts file
  ↓
hooks.json matcher: tool == "Edit" && file_path matches "\\.ts$"
  ↓
lint-fix.js runs async (timeout: 30s) → auto-formats file
type-check.js runs async (timeout: 30s) → reports type errors
auto-test.js runs async (timeout: 60s) → runs related tests
secret-scanner.js runs async (timeout: 15s) → scans for leaked secrets
  ↓
All run in parallel, none blocks the main flow
```

### Session Lifecycle
```
SessionStart → session-start.js (load previous context, detect package manager)
            → context-loader.js (load CLAUDE.md, git state, project type)
  ↓
... developer works ...
  ↓
PreCompact → pre-compact.js (save state before context compaction)
  ↓
... more work ...
  ↓
Stop → check-console-log.js (audit modified files)
    → stop-check.js (remind about tests and unstaged changes)
  ↓
SessionEnd → session-end.js (persist session state)
          → evaluate-session.js (extract learnable patterns)
          → learning-log.js (log activity)
```

## Key Architectural Decisions

### ADR-1: stdin-to-argv Adapter Bridge
**Decision:** Create `hook-runner.js` to bridge stdin-based hooks to argv-based scripts.
**Context:** Claude Code hooks pass data via stdin, but scripts were written to accept argv[2].
**Consequence:** All 14 argv-based scripts work without modification. New scripts can use either interface.

### ADR-2: No "hooks" Field in plugin.json
**Decision:** Hooks are loaded from `hooks/hooks.json` by convention, not declared in plugin.json.
**Context:** Claude Code v2.1+ auto-detects hooks.json. Adding a "hooks" field causes duplicate detection errors.
**Consequence:** Regression test enforces this (`plugin.json Validation: plugin.json does NOT have explicit hooks declaration`).

### ADR-3: Async PostToolUse Hooks with Timeouts
**Decision:** Heavy PostToolUse hooks (lint, typecheck, test, bundle) run async with 15-60s timeouts.
**Context:** Synchronous PostToolUse hooks would block Claude between every edit.
**Consequence:** Developer flow is uninterrupted. Results appear when ready.

### ADR-4: Global Installation
**Decision:** Everything installs to `~/.claude/` (user-level), not per-project.
**Context:** Users want the same tooling in every project without per-repo setup.
**Consequence:** Works in any project automatically. Hook scripts reference the plugin repo path via `${CLAUDE_PLUGIN_ROOT}`.
