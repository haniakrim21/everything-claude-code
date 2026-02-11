---
description: Automatically trigger slash commands based on context — no manual invocation needed
globs: "**/*"
---

# Auto Slash Commands

ALWAYS trigger the appropriate slash command workflow automatically based on context. Do NOT wait for the user to type a slash command — detect the intent and execute it.

## Auto-Trigger Rules

### Daily Workflow
- New session on unfamiliar project → `/prime`
- "Onboard me" / new contributor → `/onboard`
- When user says "commit" or finishes a task → `/commit`
- When user says "create PR" or "push" → `/pr-create`
- When user says "review PR" + number → `/pr-review`
- GitHub issue URL → `/fix-issue` or `/analyze-issue`

### Planning & Architecture
- Any new feature/endpoint/service → `/plan-feature` before writing code
- "Add feature X" / "implement X" / "build X" → `/plan-feature` → `/tdd` → `/orchestrate feature`
- Architecture discussion / system design → `/adr` for decisions, `/diagram` for visuals
- "Design review" / UI/UX discussion → `/design-review`
- "Add endpoint" / "create API" → `/plan-feature` → `/orchestrate api`
- Multi-agent or complex orchestration tasks → `/multi-agent`

### Code Quality & Refactoring
- After implementing any feature or fix → `/code-review`
- Building new functionality → `/tdd` workflow
- After significant changes → `/check` (lint + types + tests + build)
- "Refactor" / "clean up" → `/refactor`
- "Simplify" / "too complex" → `/simplify`
- "Extract component" / "extract module" / file too large → `/extract`
- "Rename" across codebase → `/rename`
- "Remove dead code" / "unused code" → `/dead-code`
- General cleanup / maintenance → `/cleanup`

### Testing
- Build fails → `/build-fix`
- Tests fail → `/test-fix`
- User reports a bug → `/orchestrate bugfix`
- "Add tests" / "increase coverage" → `/tdd`
- After UI component changes → `/snapshot-test`
- After API/service changes → `/integration-test`

### Security
- Editing auth/payment/crypto files → `/audit` in background
- "Check security" / "is this safe" → `/audit`
- Before any commit touching sensitive files → `/secrets-scan`
- "Harden" / security posture review → `/hardening`
- Web app security headers → `/csp`
- Dependency updates or additions → `/dependency-audit`

### Documentation
- After implementing a feature → `/update-docs` if docs exist
- "Document this" / "add docs" → `/doc-gen`
- API changes → `/api-docs`
- After significant structural changes → `/update-codemap`
- Project missing `Docs/` folder → `/create-docs`
- "Save context" / "remember this" → `/memory-bank`

### Deployment & Release
- "Deploy" / "release" → `/deploy` or `/release`
- "Changelog" / before release → `/changelog`
- CI/CD changes → `/ci-pipeline`
- Dockerfile changes → `/dockerfile`
- K8s manifest changes → `/k8s-manifest`
- "Monitor" / post-deploy → `/monitor`

### Investigation
- "Why does X happen" / "explain" → `/analyze-issue`
- "What changed" / "what broke" → check git history
- Parallel branch work needed → `/worktree`

### Session Management
- Session ending / wrapping up → `/wrap-up`

## Execution Rules

1. **Don't announce** — just execute the command workflow naturally
2. **Chain commands** when appropriate (e.g., `/plan-feature` → `/tdd` → `/code-review` → `/commit`)
3. **Run background checks** silently (security scan, lint) without interrupting flow
4. **Skip redundant commands** — don't re-run if already done this session
5. **Prioritize user's explicit request** over auto-triggers
