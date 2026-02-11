# Development Guide

## Quick Start

### First Time in Any Project

```
/prime
```

That's it. Claude loads the project context, detects the stack, and you're ready to work. All 359 commands, 490 agents, 854 skills, 38 rules, and 22 hooks activate automatically.

### Starting Your Day

```
/prime → describe what you need
```

Agents, hooks, and rules kick in automatically as you work.

## Workflow Cheat Sheet

### Fix a Bug

```
/do-issue 123
```

Branches, implements with TDD, tests, creates PR. One command.

Or manually:

```
/fix-issue 123          ← TDD fix only
/create-pr              ← PR from branch changes
```

### Build a Feature

**Small feature:**
```
/prime → describe it → /commit → /create-pr
```

**Medium feature:**
```
/create-plan → build it → /check → /commit → /create-pr
```

**Big feature (structured phases):**
```
/riper
```

RIPER walks through: Research → Innovate → Plan → Execute → Review

**Complex multi-session feature:**
```
/ab-master
```

Creates spec, breaks into missions and tasks.

### "Just Get It Done" Mode

```
/ralph
```

Autonomous loop — Claude keeps working until the task is complete.

### End of Day

```
/commit
```

Smart conventional commit with auto-detection.

### Full CI Locally

```
/run-ci
```

Runs lint, types, tests, build — same as CI pipeline.

## Active Hooks (Automatic)

These run in the background — no action needed:

| Hook | Trigger | Action |
|---|---|---|
| Dev Server Blocker | `npm run dev` outside tmux | Blocks execution |
| Tmux Reminder | Long-running commands | Suggests tmux/screen |
| Force Push Guard | `git push --force main` | Blocks execution |
| Commit Guard | `git commit -m "..."` | Validates conventional format |
| Doc File Guard | Creating random .md files | Blocks creation |
| Suggest Compact | Many edits in session | Suggests `/compact` |
| PR URL Logger | `gh pr create` | Shows PR URL |
| Build Analysis | Build completes | Async notification |
| Lint Fix | Edit .ts/.js/.py/.go/.rs/.css | Auto-formats (async) |
| Type Check | Edit .ts/.tsx | Runs tsc (async) |
| Console.log Warning | Edit .ts/.js/.tsx/.jsx | Flags console.log |
| Auto Test | Edit source files | Runs related tests (async) |
| Bundle Check | Edit frontend files | Checks bundle size (async) |
| Secret Scanner | Any file write/edit | Scans for secrets (async) |
| Session Start | New session | Loads context, detects pkg manager |
| Context Loader | New session | Loads CLAUDE.md, git state |
| Pre-Compact | Before compaction | Saves state |
| Session End | Session ends | Persists state |
| Evaluate Session | Session ends | Extracts patterns |
| Learning Log | Session ends | Logs activity |
| Console.log Audit | Response complete | Checks modified files |
| Stop Check | Response complete | Reminds about tests |

## Project Setup (Optional)

For full project management with specs and tracking:

```
/conductor-setup
```

Creates a `conductor/` directory with product requirements, tech stack docs, and feature tracking.

## Command Categories

### Daily (use every session)
`/prime`, `/commit`, `/commit-fast`, `/check`, `/run-ci`

### Issue & PR
`/do-issue`, `/fix-issue`, `/analyze-issue`, `/fix-pr`, `/create-pr`, `/pr-review`

### Planning
`/riper`, `/ralph`, `/ab-master`, `/create-plan`, `/create-prp`, `/mermaid`

### Code Quality
`/tdd-implement`, `/optimize`, `/code-review`, `/todo`, `/refactor-clean`

### Documentation
`/create-docs`, `/doc-gen`, `/api-docs`, `/update-docs`

### Deployment
`/release`, `/deploy`, `/ci-pipeline`, `/dockerfile`, `/k8s-manifest`

### Security
`/audit`, `/secrets-scan`, `/hardening`, `/csp`

### Advanced
`/orchestrate`, `/multi-agent`, `/worktree`, `/memory-bank`, `/sessions`

## Adding New Components

### New Command
```bash
# Create command file
cat > ~/.claude/commands/my-command.md << 'EOF'
---
description: What this command does
---
Your prompt template here with $ARGUMENTS placeholder
EOF
```

### New Agent
```bash
# Create agent file
cat > ~/.claude/agents/my-agent.md << 'EOF'
---
name: my-agent
description: What this agent specializes in
tools: [Read, Edit, Bash, Grep, Glob]
model: sonnet
---
Your agent system prompt here
EOF
```

### New Hook
Edit `hooks/hooks.json` and add entry under the appropriate event type. Implement logic in `scripts/hooks/`.

### New Rule
Add `.md` file to `rules/common/` (all languages) or `rules/<language>/` (specific).
