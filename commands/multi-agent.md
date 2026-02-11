---
description: Auto-dispatch multiple agents in parallel — no configuration needed
---

# Auto Multi-Agent

Automatically analyze and dispatch the right agents for: $ARGUMENTS

## Step 1: Auto-Detect Required Agents

Read the task. Based on file types, keywords, and intent, select agents from this map:

| Signal | Agents to spawn |
|--------|----------------|
| "review" / "check" / "audit" | code-reviewer + security-reviewer + pr-reviewer-specialist |
| "security" / "vulnerability" / "auth" | security-reviewer + security-engineer + penetration-tester |
| "bug" / "fix" / "error" / "broken" | debugger + error-detective + build-error-resolver + language reviewer |
| "feature" / "build" / "implement" | planner → then domain agents |
| "refactor" / "clean" / "improve" | refactor-cleaner + refactoring-specialist + code-reviewer |
| "test" / "coverage" / "tdd" | tdd-guide + qa-expert + test-automation-expert |
| "e2e" / "playwright" / "cypress" | e2e-runner + qa-automation-engineer |
| "deploy" / "ci" / "pipeline" | devops-engineer + cicd-pipeline-engineer + sre-engineer |
| "database" / "schema" / "migration" | database-reviewer + database-architect + database-optimizer |
| "api" / "endpoint" / "route" | api-designer + api-documenter + security-reviewer |
| "infra" / "cloud" / "k8s" | cloud-architect + kubernetes-specialist + terraform-engineer |
| "azure" | azure-infra-engineer + cloud-architect |
| "docs" / "documentation" | documentation-engineer + technical-writer + doc-updater |
| "performance" / "slow" / "optimize" | performance-engineer + performance-monitor + database-optimizer |
| "architecture" / "design" / "structure" | architect + architect-reviewer + cloud-architect |
| "payment" / "stripe" / "billing" | fintech-engineer + payment-integration + security-reviewer |
| "ml" / "ai" / "model" / "llm" | llm-architect + ai-engineer + mlops-engineer |
| "data" / "etl" / "pipeline" (data) | data-engineer + data-analyst + data-scientist |
| "mobile" / "ios" / "android" / "flutter" | mobile-developer + flutter-expert or swift-expert or kotlin-specialist |
| "devops" / "monitoring" / "observability" | devops-engineer + observability-engineer + sre-engineer |
| "compliance" / "hipaa" / "gdpr" | compliance-auditor + privacy-engineer + healthcare-compliance-agent |
| "incident" / "outage" / "alert" | incident-responder + devops-incident-responder + sre-engineer |
| "accessibility" / "wcag" / "a11y" | accessibility-tester |
| "seo" | seo-specialist + frontend-developer |
| "game" / "unity" / "unreal" | game-developer |
| "blockchain" / "web3" / "solidity" | blockchain-developer |
| "websocket" / "realtime" / "sse" | websocket-engineer + backend-developer |
| "logging" / "tracing" | logging-concepts-engineer + observability-engineer |
| "resilience" / "circuit-breaker" / "retry" | resilience-engineer + language-specific resilience agent |

**By file type detected:**

| File Pattern | Primary Agent | Also spawn |
|---|---|---|
| `.ts/.tsx` | typescript-pro | typescript-cockatiel-resilience (if resilience) |
| `.js/.jsx` | javascript-pro | nodejs-expert (if backend) |
| `.py` | python-pro | python-reviewer |
| `.go` | golang-pro | go-reviewer |
| `.rs` | rust-engineer | — |
| `.java` | java-architect | spring-boot-engineer (if Spring) |
| `.kt` | kotlin-specialist | — |
| `.cs` | csharp-developer | dotnet-core-expert |
| `.swift` | swift-expert | — |
| `.dart` | flutter-expert | — |
| `.rb` | rails-expert | — |
| `.php` | php-pro | laravel-expert (if Laravel) |
| `.ex/.exs` | elixir-expert | — |
| `.cpp/.c/.h` | cpp-pro | embedded-systems (if embedded) |
| `.sql` | sql-pro | postgres-pro, database-optimizer |
| `.ps1` | powershell-7-expert | powershell-security-hardening |
| `.sol` | blockchain-developer | — |
| `.graphql` | graphql-architect | — |
| `.tf` | terraform-engineer | terragrunt-expert |
| `.vue` | vue-expert | frontend-developer |
| `*.component.ts` | angular-expert | angular-architect |
| `Dockerfile` | devops-engineer | kubernetes-specialist |
| `.prisma` | prisma-expert | database-reviewer |

**By framework detected:**

| Framework | Agents |
|---|---|
| Django | django-developer + django-expert |
| FastAPI | fastapi-expert + python-pro |
| Spring Boot | spring-boot-engineer + java-architect |
| Express/Fastify | fastify-expert + nodejs-expert |
| Next.js | nextjs-developer + react-specialist |
| Laravel | laravel-expert + php-pro |
| Rails | rails-expert |
| .NET | dotnet-core-expert + csharp-developer |
| Flutter | flutter-expert + mobile-developer |
| Electron | electron-pro |

## Step 2: Dispatch in Parallel

- Spawn ALL selected agents simultaneously using Task tool with `run_in_background: true`
- Each agent gets: the task description + relevant file context
- Do NOT wait for one to finish before starting the next

## Step 3: Synthesize

Once all agents complete:
1. Collect all findings
2. Deduplicate overlapping observations
3. Rank by severity/importance
4. Present a single unified report:
   - **Critical** findings first
   - **Improvements** second
   - **Suggestions** last
   - Each item includes: file path, line number, what to change, why

## Rules
- NEVER ask the user which agents to use — decide automatically
- Minimum 2 agents per task, maximum 6
- If task is ambiguous, default to: code-reviewer + security-reviewer + language reviewer
- Always include the language-specific agent for the dominant file type
- Use meta-agents (multi-agent-coordinator, tech-lead-orchestrator) for tasks needing 5+ agents
