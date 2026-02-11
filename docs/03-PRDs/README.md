# Product Requirements

## Product: Everything Claude Code

### Vision
A single Claude Code plugin that transforms every project into a fully automated development environment — with production-quality workflows, guard rails, and accumulated knowledge — requiring zero configuration.

### Goals

1. **Immediate productivity** — `/prime` then start working
2. **Consistent quality** — same standards across all projects
3. **Safety by default** — prevent mistakes before they happen
4. **Scalable workflows** — from one-line fixes to multi-session features

### Non-Goals

- Runtime dependencies (no node_modules required in target projects)
- Framework-specific code generation
- Replacing CI/CD pipelines (complementing them)
- Managing deployment infrastructure

## Feature Requirements

### FR-1: Slash Commands (359 total)

**Daily workflow:** `/prime`, `/commit`, `/check`, `/run-ci`
**Issue flow:** `/do-issue`, `/fix-issue`, `/analyze-issue`, `/fix-pr`, `/create-pr`
**Planning:** `/riper`, `/ralph`, `/ab-master`, `/create-plan`, `/create-prp`
**Code quality:** `/tdd-implement`, `/optimize`, `/code-review`, `/refactor-clean`
**Documentation:** `/create-docs`, `/doc-gen`, `/api-docs`, `/update-docs`
**Deployment:** `/release`, `/deploy`, `/ci-pipeline`, `/dockerfile`, `/k8s-manifest`

**Acceptance criteria:**
- All commands work from any project directory
- Commands auto-chain when appropriate
- Commands detect project type and adapt

### FR-2: Agents (490 total)

**Core 13 (project-bundled):** architect, build-error-resolver, code-reviewer, database-reviewer, doc-updater, e2e-runner, go-build-resolver, go-reviewer, planner, python-reviewer, refactor-cleaner, security-reviewer, tdd-guide

**Extended (globally installed):** 477 additional specialist agents covering every language, framework, and domain.

**Acceptance criteria:**
- Agents are auto-selected based on context (no manual invocation)
- Multiple agents can run in parallel
- Agents communicate through structured handoffs

### FR-3: Hooks (22 total)

**PreToolUse (6):** block-dev-server, tmux-reminder, pre-push-check, commit-guard, block-md-creation, suggest-compact
**PostToolUse (8):** pr-url-logger, build-analysis, lint-fix, type-check, console-log-warning, auto-test, bundle-check, secret-scanner
**SessionStart (2):** session-start, context-loader
**SessionEnd (3):** session-end, evaluate-session, learning-log
**PreCompact (1):** pre-compact
**Stop (2):** check-console-log, stop-check

**Acceptance criteria:**
- All 22 hooks pass validation (`node scripts/ci/validate-hooks.js`)
- Blocking hooks exit non-zero with clear reason
- Async hooks have timeouts (15-60s)
- No hook blocks on its own failure

### FR-4: Rules (38 total)

**Common (language-agnostic):** coding-style, testing, security, patterns, hooks, performance, git-workflow, bug-fix-workflow, agents, pr-review, plan-before-code, comment-policy, auto-agent-routing, auto-commands, auto-skills, auto-verify, collaborative-workflows, continuous-improvement, code-analysis, ai-security

**Language-specific:** TypeScript (5), Python (5), Go (5)

**Acceptance criteria:**
- Rules load automatically based on file type
- Rules don't conflict with each other
- Rules are enforceable (not aspirational)

### FR-5: Skills (854 total)

Reusable workflow knowledge covering: API design, authentication, AWS, billing, CI/CD, databases, Docker, embeddings, frontend, Git, GraphQL, Kubernetes, LLM integration, microservices, mobile, monitoring, performance, prompt engineering, RAG, React, Redis, security, Stripe, testing, TypeScript, and more.

**Acceptance criteria:**
- Skills auto-load based on file type and task context
- Skills stack (multiple can apply simultaneously)
- Skills inform, rules enforce

## Technical Constraints

- All scripts: Node.js ES2022 CommonJS (cross-platform)
- No compiled output, no runtime dependencies
- Plugin manifest must NOT include `"hooks"` field
- Test suite: 69 tests, custom runner (no external framework)
- CI matrix: 3 OS x 3 Node versions x 4 package managers
