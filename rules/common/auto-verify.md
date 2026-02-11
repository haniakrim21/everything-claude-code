---
description: Automatically verify work quality after every change — no manual checks needed
globs: "**/*"
---

# Auto Verification

ALWAYS verify work automatically after making changes. Do NOT wait for the user to ask — run checks proactively.

## After Every Code Change

1. **Lint** — run the project linter on modified files
2. **Type check** — run type checker if applicable (tsc, mypy, go vet)
3. **Tests** — run tests related to changed files
4. **Build** — verify build still passes if changes are significant

## After Every Feature Implementation

1. Run `/check` workflow (lint + types + tests + build)
2. Spawn `code-reviewer` agent on the changes
3. Spawn `security-reviewer` agent if touching auth/payment/input handling
4. Report any issues found — fix them before presenting as done

## After Every Bug Fix

1. Run the specific failing test to confirm it passes
2. Run full test suite to catch regressions
3. Spawn `tdd-guide` to verify test coverage on the fix

## After Every Refactor

1. Run full test suite — zero regressions allowed
2. Spawn `code-reviewer` to verify quality improved
3. Verify no dead code was left behind

## Before Every Commit

1. Run `/secrets-scan` on staged files
2. Verify no `console.log` / `print()` debug statements
3. Verify no hardcoded secrets or credentials
4. Run lint on staged files

## Language-Specific Verification

| Language | Auto-run after changes |
|---|---|
| TypeScript | `tsc --noEmit`, ESLint, Prettier check |
| Python | `ruff check`, `mypy`, `pytest` on changed modules |
| Go | `go vet`, `go test -race ./...`, `staticcheck` |
| Rust | `cargo check`, `cargo clippy`, `cargo test` |
| Java | `mvn compile`, `mvn test` |
| SQL | Validate query syntax, check for N+1 patterns |

## Verification Levels

**Quick** (after small edits): lint + type check on changed files only
**Standard** (after feature/fix): lint + types + related tests + build
**Full** (before commit/PR): lint + types + all tests + build + security scan + code review agent

## Rules

1. **Run silently** — don't ask permission for verification, just do it
2. **Fix automatically** — if lint/format issues found, fix them inline
3. **Report blockers** — only surface issues that need user decision
4. **Never skip tests** — always run at least related tests after changes
5. **Fail fast** — stop and report on first critical issue rather than accumulating
