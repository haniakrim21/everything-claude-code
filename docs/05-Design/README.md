# Design Decisions

## Hook Design

### Blocking vs Warning vs Silent

| Behavior | When to Use | Examples |
|---|---|---|
| **Block** (exit 1) | Destructive, irreversible actions | Force push to main, leaked secrets |
| **Warn** (stderr) | Risky but sometimes intentional | console.log in code, no remote specified |
| **Silent** (async) | Routine quality checks | Auto-format, type check, test run |

### Hook Categorization

```
Safety-critical (blocking, synchronous):
├── block-dev-server     → prevents frozen terminals
├── pre-push-check       → prevents destroyed git history
├── commit-guard         → prevents messy commit history
└── block-md-creation    → prevents documentation sprawl

Quality-improving (async, non-blocking):
├── lint-fix             → auto-fixes formatting
├── type-check           → reports type errors
├── auto-test            → runs related tests
├── bundle-check         → monitors bundle size
└── secret-scanner       → catches leaked credentials

Informational (logging, passive):
├── pr-url-logger        → shows PR URL after creation
├── suggest-compact      → reminds about context management
├── console-log-warning  → flags debug statements
└── build-analysis       → post-build notifications

Lifecycle (session management):
├── session-start        → loads previous context
├── context-loader       → loads project context
├── pre-compact          → saves before compaction
├── session-end          → persists state
├── evaluate-session     → extracts patterns
└── learning-log         → records activity
```

## Command Design

### Naming Convention
- Verb-noun: `/create-pr`, `/fix-issue`, `/run-ci`
- Noun-only for utilities: `/changelog`, `/diagram`, `/mermaid`
- Compound for specificity: `/tdd-implement`, `/commit-fast`

### Workflow Complexity Tiers

**Tier 1 — Single action** (no arguments needed):
`/commit`, `/check`, `/prime`, `/status`

**Tier 2 — Targeted action** (takes an argument):
`/fix-issue 42`, `/do-issue 123`, `/tdd-implement auth`

**Tier 3 — Multi-phase workflow** (interactive, multiple steps):
`/riper`, `/ab-master`, `/conductor-setup`

## Agent Design

### Auto-Selection Rules
1. **File type** → language-specific agent (go-reviewer, python-reviewer)
2. **Task type** → domain agent (security-reviewer for auth files)
3. **Error type** → diagnostic agent (build-error-resolver for build failures)
4. **Workflow phase** → process agent (tdd-guide for new features)

### Parallel Execution Patterns
```
Code written → [code-reviewer, security-reviewer, language-reviewer] in parallel
Build fails  → [build-error-resolver, error-detective, language-reviewer] in parallel
New feature  → planner first → then [tdd-guide + domain agents] in parallel
```

## Rule Design

### Priority Order
1. **Security rules** — always enforced, never skipped
2. **Testing rules** — enforced for all code changes
3. **Style rules** — enforced via auto-fix (not manual)
4. **Documentation rules** — suggested, not blocked

### Rule File Structure
```markdown
# Rule Name

## What (constraint)
## Why (rationale)
## How (enforcement mechanism)
## Exceptions (when to skip)
```

## Error Handling Philosophy

1. **Hooks never crash** — all scripts catch errors and exit 0 (except intentional blocks)
2. **Missing scripts don't block** — hook-runner.js validates existence, exits 0 if missing
3. **Invalid JSON passes through** — parse errors result in empty object, not crash
4. **Async timeouts are soft** — hook times out, work continues
5. **Stderr for logs, stdout for decisions** — clean separation of concerns
