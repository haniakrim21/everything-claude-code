# Frameworks & Design Principles

## Core Philosophy

**Automate everything. Ask nothing. Block only what's dangerous.**

## Design Principles

### 1. Zero Configuration
Everything works out of the box after `npm run setup`. No per-project configuration needed. The plugin detects project type, language, and framework automatically.

### 2. Silent Automation
Hooks, agents, and rules run without announcing themselves. The developer sees results, not process. Auto-formatting happens silently. Security scanning runs in the background. Type checking triggers automatically.

### 3. Progressive Disclosure
- **Simple tasks** stay simple: `/commit`, `/check`, `/fix-issue 42`
- **Medium tasks** get structure: `/create-plan`, `/tdd-implement`
- **Complex tasks** get full workflow: `/riper`, `/ab-master`, `/conductor-setup`

### 4. Guard Rails, Not Gates
- Block only destructive actions (force push to main, dev servers outside tmux)
- Warn on risky patterns (console.log, non-conventional commits, missing tests)
- Auto-fix what can be fixed (formatting, lint issues)
- Never block the developer's flow for non-critical issues

### 5. Knowledge Compounds
- Session state persists across conversations
- Learned skills accumulate in `~/.claude/learned-skills/`
- Evaluate-session hook extracts patterns automatically
- Rules evolve based on recurring feedback

## Layered Architecture

```
Rules (always loaded, enforce constraints)
  ↓
Skills (reusable knowledge, loaded by context)
  ↓
Agents (specialized workers, auto-selected)
  ↓
Commands (user-invoked workflows)
  ↓
Hooks (event-driven automation)
  ↓
Scripts (cross-platform implementations)
```

Each layer builds on the one below. Rules constrain everything. Skills inform agents and commands. Agents do the specialized work. Commands orchestrate workflows. Hooks automate triggers. Scripts implement the logic.

## Decision Framework

### When to Add a Hook
- The action should happen every time, without exception
- The action is fast (<30s) or can run async
- Failure should warn, not block (except for safety-critical hooks)

### When to Add a Command
- The workflow requires user intent to start
- The workflow has multiple steps that benefit from orchestration
- The workflow produces output the user needs to see

### When to Add an Agent
- The task requires specialized domain knowledge
- Multiple perspectives improve the outcome
- The task can run independently (parallelizable)

### When to Add a Rule
- The constraint applies to all projects
- The constraint is objective and testable
- Violating the constraint has caused bugs before

### When to Add a Skill
- The knowledge applies to a specific technology or pattern
- The knowledge is reusable across projects
- The knowledge would otherwise be lost between sessions

## Quality Standards

| Standard | Enforcement |
|---|---|
| Conventional commits | commit-guard.js hook (PreToolUse) |
| No console.log | check-console-log.js hook (Stop) |
| No leaked secrets | secret-scanner.js hook (PostToolUse) |
| Auto-formatting | lint-fix.js hook (PostToolUse, async) |
| Type safety | type-check.js hook (PostToolUse, async) |
| Test coverage 80%+ | tdd-guide agent + auto-test hook |
| Code review | code-reviewer agent (auto after edits) |
| Security review | security-reviewer agent (auto for auth/payment) |
