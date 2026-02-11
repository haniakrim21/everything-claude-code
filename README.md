<div align="center">

<br>

```
  ______                          _   _     _
 |  ____|                        | | | |   (_)
 | |____   _____ _ __ _   _| |_| |__  _ _ __   __ _
 |  __\ \ / / _ \ '__| | | | __| '_ \| | '_ \ / _` |
 | |___\ V /  __/ |  | |_| | |_| | | | | | | | (_| |
 |______\_/ \___|_|   \__, |\__|_| |_|_|_| |_|\__, |
                        __/ |                    __/ |
    Claude Code        |___/                    |___/
```

### The most comprehensive Claude Code plugin ever built.

**195 agents** &middot; **94 skills** &middot; **70 commands** &middot; **29 rules** &middot; **22 hooks**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20macOS%20%7C%20Linux-lightgrey)
![Dependencies](https://img.shields.io/badge/Runtime%20Deps-0-brightgreen)

<br>

[Quick Start](#-quick-start) &middot; [What's Inside](#-whats-inside) &middot; [Architecture](#-architecture) &middot; [Install](#-installation) &middot; [Contributing](#-contributing)

<br>

</div>

---

## Why This Exists

Claude Code is powerful out of the box. But after 10+ months of building production apps with it daily, patterns emerge. The same review cycles. The same security checks. The same TDD flow. The same agent orchestration.

This plugin encodes all of that into a single install. **Zero configuration. Zero runtime dependencies. Every project. Every language.**

```
Before:  You tell Claude what to do, step by step.
After:   Claude knows what to do. It plans, tests, reviews, and ships.
```

---

## The Numbers

| Component | Count | What it does |
|:--|--:|:--|
| **Agents** | 195 | Specialized subagents — from `planner` to `penetration-tester` |
| **Skills** | 94 | Reusable workflow knowledge — TDD, security, patterns, frameworks |
| **Commands** | 70 | Slash commands — `/commit`, `/tdd`, `/fix-issue`, `/orchestrate` |
| **Rules** | 29 | Always-on guidelines — coding style, security, git, testing |
| **Hooks** | 22 | Event-driven automations — lint on save, scan before commit |
| **Tests** | 69 | Custom runner, zero deps, CI across 36 OS/Node/PM combinations |
| **Scripts** | 21 | Cross-platform Node.js utilities powering hooks |

**Runtime dependencies: 0.** Everything is vanilla Node.js (ES2022, CommonJS).

---

## Quick Start

### Option A: Plugin Install (Recommended)

```bash
# Add marketplace
/plugin marketplace add affaan-m/everything-claude-code

# Install
/plugin install everything-claude-code@everything-claude-code
```

Then install rules (plugins can't distribute rules automatically):

```bash
git clone https://github.com/affaan-m/everything-claude-code.git
cp -r everything-claude-code/rules/common/* ~/.claude/rules/

# Pick your stack
cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/
cp -r everything-claude-code/rules/python/* ~/.claude/rules/
cp -r everything-claude-code/rules/golang/* ~/.claude/rules/
```

### Option B: Manual Install

```bash
git clone https://github.com/affaan-m/everything-claude-code.git

cp everything-claude-code/agents/*.md ~/.claude/agents/
cp everything-claude-code/commands/*.md ~/.claude/commands/
cp -r everything-claude-code/skills/* ~/.claude/skills/
cp -r everything-claude-code/rules/common/* ~/.claude/rules/
```

Copy hooks from `hooks/hooks.json` into your `~/.claude/settings.json`.

---

## What's Inside

### Agents (195)

Every agent is a single `.md` file with YAML frontmatter. Claude auto-routes to the right agent based on context.

<details>
<summary><b>Core Team</b> — Always available, handles 80% of tasks</summary>

| Agent | What it does |
|:--|:--|
| `planner` | Breaks features into implementation steps |
| `architect` | System design and architectural decisions |
| `tdd-guide` | Enforces write-tests-first methodology |
| `code-reviewer` | Quality, security, and maintainability review |
| `security-reviewer` | Vulnerability analysis and OWASP checks |
| `build-error-resolver` | Fixes build failures automatically |
| `e2e-runner` | Playwright E2E testing specialist |
| `refactor-cleaner` | Dead code removal and cleanup |
| `doc-updater` | Keeps documentation in sync with code |

</details>

<details>
<summary><b>Language Specialists</b> — 30+ language-specific experts</summary>

| Domain | Agents |
|:--|:--|
| TypeScript/JS | `typescript-pro`, `javascript-pro`, `nodejs-expert`, `react-specialist`, `vue-expert`, `angular-expert`, `nextjs-developer`, `fastify-expert` |
| Python | `python-pro`, `django-developer`, `fastapi-expert`, `python-hyx-resilience` |
| Go | `golang-pro`, `go-reviewer`, `go-build-resolver`, `go-resilience-engineer`, `go-zap-logging`, `gin-expert`, `fiber-expert` |
| Rust | `rust-engineer` |
| C/C++ | `cpp-pro` |
| C#/.NET | `csharp-developer`, `dotnet-core-expert`, `dotnet-framework-4.8-expert` |
| Java | `java-architect`, `spring-boot-engineer` |
| Kotlin | `kotlin-specialist` |
| Swift | `swift-expert` |
| Ruby | `rails-expert` |
| PHP | `php-pro`, `laravel-expert`, `laravel-specialist`, `wordpress-master` |
| Elixir | `elixir-expert` |
| Flutter | `flutter-expert` |

</details>

<details>
<summary><b>Infrastructure & DevOps</b> — 25+ ops specialists</summary>

| Domain | Agents |
|:--|:--|
| Cloud | `cloud-architect`, `azure-infra-engineer`, `serverless-architect` |
| Containers | `kubernetes-specialist`, `platform-engineer` |
| IaC | `terraform-engineer`, `terragrunt-expert`, `pulumi-typescript-specialist` |
| CI/CD | `cicd-pipeline-engineer`, `deployment-engineer`, `deployment-specialist` |
| DevOps | `devops-engineer`, `devops-troubleshooter`, `devops-incident-responder` |
| SRE | `sre-engineer`, `incident-responder`, `chaos-engineer` |
| Monitoring | `observability-engineer`, `performance-monitor`, `performance-engineer` |
| Network | `network-engineer`, `websocket-engineer` |

</details>

<details>
<summary><b>Security</b> — Full security audit team</summary>

`security-auditor` &middot; `security-engineer` &middot; `devsecops-engineer` &middot; `penetration-tester` &middot; `compliance-auditor` &middot; `ad-security-reviewer` &middot; `powershell-security-hardening` &middot; `privacy-engineer` &middot; `healthcare-compliance-agent`

</details>

<details>
<summary><b>Data & AI</b> — ML/AI pipeline coverage</summary>

`ai-engineer` &middot; `ml-engineer` &middot; `mlops-engineer` &middot; `data-engineer` &middot; `data-scientist` &middot; `data-analyst` &middot; `data-researcher` &middot; `llm-architect` &middot; `nlp-engineer` &middot; `nlp-llm-integration-expert` &middot; `computer-vision-specialist` &middot; `machine-learning-engineer`

</details>

<details>
<summary><b>Database</b> — Every layer of the data stack</summary>

`database-architect` &middot; `database-administrator` &middot; `database-optimizer` &middot; `database-admin` &middot; `database-reviewer` &middot; `postgres-pro` &middot; `sql-pro` &middot; `prisma-expert` &middot; `search-specialist`

</details>

<details>
<summary><b>Architecture & Design</b></summary>

`architect-reviewer` &middot; `microservices-architect` &middot; `graphql-architect` &middot; `micro-frontend-architect` &middot; `design-system-architect` &middot; `api-designer` &middot; `api-documenter` &middot; `workflow-orchestrator` &middot; `legacy-modernizer` &middot; `refactoring-specialist`

</details>

<details>
<summary><b>Business & Product</b></summary>

`product-manager` &middot; `project-manager` &middot; `project-analyst` &middot; `business-analyst` &middot; `business-intelligence-developer` &middot; `scrum-master` &middot; `competitive-analyst` &middot; `market-researcher` &middot; `trend-analyst` &middot; `customer-success-manager` &middot; `sales-engineer` &middot; `content-marketer` &middot; `seo-specialist`

</details>

<details>
<summary><b>Full list (195)</b></summary>

`accessibility-tester` `ad-security-reviewer` `agent-installer` `agent-organizer` `ai-engineer` `analytics-implementation-specialist` `angular-architect` `angular-expert` `api-designer` `api-documenter` `architect` `architect-reviewer` `azure-infra-engineer` `backend-developer` `blockchain-developer` `build-engineer` `build-error-resolver` `business-analyst` `business-intelligence-developer` `chaos-engineer` `cicd-pipeline-engineer` `cli-developer` `cloud-architect` `code-archaeologist-time-traveler` `code-reviewer` `competitive-analyst` `compliance-auditor` `computer-vision-specialist` `content-marketer` `context-manager` `cpp-pro` `csharp-developer` `customer-success-manager` `data-analyst` `data-engineer` `data-researcher` `data-scientist` `database-admin` `database-administrator` `database-architect` `database-optimizer` `database-reviewer` `debugger` `dependency-manager` `deployment-engineer` `deployment-specialist` `design-system-architect` `developer-experience-optimizer` `devops-engineer` `devops-incident-responder` `devops-troubleshooter` `devsecops-engineer` `django-developer` `django-expert` `doc-updater` `documentation-engineer` `dotnet-core-expert` `dotnet-framework-4.8-expert` `dx-optimizer` `e2e-runner` `electron-pro` `elixir-expert` `embedded-systems` `error-coordinator` `error-detective` `fastapi-expert` `fastify-expert` `fiber-expert` `financial-modeling-agent` `fintech-engineer` `flutter-expert` `frontend-developer` `fullstack-developer` `game-developer` `gin-expert` `git-expert` `git-workflow-manager` `go-build-resolver` `go-resilience-engineer` `go-reviewer` `go-zap-logging` `golang-pro` `graphql-architect` `healthcare-compliance-agent` `incident-responder` `iot-engineer` `it-ops-orchestrator` `java-architect` `javascript-pro` `knowledge-synthesizer` `kotlin-specialist` `kubernetes-specialist` `laravel-expert` `laravel-specialist` `legacy-modernizer` `legal-advisor` `llm-architect` `logging-concepts-engineer` `m365-admin` `machine-learning-engineer` `market-researcher` `mcp-developer` `micro-frontend-architect` `microservices-architect` `ml-engineer` `mlops-engineer` `mobile-app-developer` `mobile-developer` `multi-agent-coordinator` `network-engineer` `nextjs-developer` `nlp-engineer` `nlp-llm-integration-expert` `nodejs-expert` `observability-engineer` `payment-integration` `payment-integration-agent` `penetration-tester` `performance-engineer` `performance-monitor` `php-pro` `planner` `platform-engineer` `postgres-pro` `powershell-5.1-expert` `powershell-7-expert` `powershell-module-architect` `powershell-security-hardening` `powershell-ui-architect` `pr-description-composer` `pr-reviewer-specialist` `prisma-expert` `privacy-engineer` `product-manager` `project-analyst` `project-manager` `prompt-engineer` `pulumi-typescript-specialist` `pwa-specialist` `python-hyx-resilience` `python-pro` `python-reviewer` `qa-automation-engineer` `qa-expert` `quality-system-engineer` `quant-analyst` `rails-expert` `rapid-prototyper` `react-specialist` `refactor-cleaner` `refactoring-specialist` `release-manager` `research-analyst` `resilience-engineer` `risk-manager` `rubber-duck-debugger` `rust-engineer` `sales-engineer` `scrum-master` `search-specialist` `security-auditor` `security-engineer` `security-reviewer` `seo-specialist` `serverless-architect` `slack-expert` `software-engineering-expert` `spring-boot-engineer` `sql-pro` `sre-engineer` `swift-expert` `task-distributor` `tdd-guide` `team-configurator` `tech-lead-orchestrator` `technical-debt-collector` `technical-writer` `terraform-engineer` `terragrunt-expert` `test-automation-expert` `test-automator` `tooling-engineer` `trend-analyst` `typescript-cockatiel-resilience` `typescript-pino-logging` `typescript-pro` `ui-designer` `ux-designer` `ux-researcher` `vue-expert` `webassembly-specialist` `websocket-engineer` `windows-infra-admin` `wordpress-master` `workflow-orchestrator`

</details>

---

### Commands (70)

Slash commands orchestrate agents and skills into workflows.

| Command | What it does |
|:--|:--|
| `/commit` | Stage, lint, test, then commit with conventional message |
| `/tdd` | Full TDD cycle: RED > GREEN > REFACTOR |
| `/plan-feature` | Generate feature spec before writing code |
| `/fix-issue 42` | Analyze GitHub issue, plan fix, implement, test |
| `/orchestrate` | Multi-agent workflow coordination |
| `/code-review` | Parallel review: code + security + performance |
| `/audit` | Full security audit of codebase |
| `/pr-create` | Create PR with comprehensive description |
| `/pr-review` | 6-perspective PR review |
| `/refactor` | Safe refactoring with test verification |
| `/dead-code` | Find and remove unused code |
| `/diagram` | Generate architecture diagrams |
| `/adr` | Create architectural decision records |
| `/secrets-scan` | Scan for leaked credentials |
| `/multi-agent` | Coordinate multiple agents on a task |

<details>
<summary>View all 70 commands</summary>

`/adr` `/analyze-issue` `/api-docs` `/audit` `/build-fix` `/changelog` `/ci-pipeline` `/cleanup` `/code-review` `/commit` `/create-docs` `/csp` `/dead-code` `/dependency-audit` `/deploy` `/design-review` `/diagram` `/doc-gen` `/dockerfile` `/evolve` `/extract` `/fix-issue` `/go-build` `/go-review` `/go-test` `/hardening` `/instinct-export` `/instinct-import` `/instinct-status` `/integration-test` `/k8s-manifest` `/learn` `/memory-bank` `/migrate` `/monitor` `/multi-agent` `/multi-backend` `/multi-execute` `/multi-frontend` `/multi-plan` `/multi-workflow` `/onboard` `/orchestrate` `/plan-feature` `/pm2` `/pr-create` `/pr-review` `/prime` `/refactor` `/release` `/rename` `/riper` `/secrets-scan` `/sessions` `/setup-pm` `/simplify` `/skill-create` `/snapshot-test` `/tdd` `/test-fix` `/update-codemap` `/update-docs` `/verify` `/worktree` `/wrap-up` and more...

</details>

---

### Skills (94)

Domain knowledge that agents and commands draw from.

| Category | Skills |
|:--|:--|
| **Languages** | TypeScript, Python, Go, Rust, Java/Spring Boot, Django |
| **Frontend** | React patterns, Next.js, responsive design, design systems, accessibility |
| **Backend** | API design, database optimization, Redis, GraphQL, microservices |
| **Testing** | TDD workflow, testing strategies, E2E, property-based testing |
| **Security** | Security review, hardening, PCI compliance, authentication patterns |
| **DevOps** | CI/CD pipelines, Docker, Kubernetes, monitoring, deployment |
| **AI/ML** | LLM integration, RAG, embeddings, prompt engineering, evaluation |
| **Workflow** | Continuous learning, verification loops, strategic compaction |

---

### Rules (29)

Always-on guidelines loaded into every session. Organized as `common/` (universal) + language-specific:

```
rules/
  common/           # 20 rules — coding style, security, testing, git, agents
  typescript/        # 5 rules — TS/JS patterns, hooks, security
  python/            # 5 rules — PEP 8, pytest, type hints
  golang/            # 5 rules — gofmt, table-driven tests, error wrapping
```

Key rules:
- **Plan before code** — Never start a feature without a spec
- **TDD mandatory** — Write tests first, 80% coverage minimum
- **Auto-verify** — Lint, typecheck, and test after every change
- **Auto-agent routing** — Delegate to specialists automatically
- **Security checks** — Scan before every commit

---

### Hooks (22)

Event-driven automations that fire on tool use and session lifecycle:

| Phase | Count | Examples |
|:--|--:|:--|
| **PreToolUse** | 6 | Block dev servers, warn on long commands, validate edits |
| **PostToolUse** | 8 | Auto-lint, typecheck, run tests, bundle size check |
| **SessionStart** | 2 | Load context, create docs structure |
| **SessionEnd** | 3 | Save state, capture learnings |
| **PreCompact** | 1 | Preserve critical context before compaction |
| **Stop** | 2 | Final verification, audit staged files |

All hooks are implemented as cross-platform Node.js scripts — no bash dependencies.

---

## Architecture

```
Layer 1: Rules              Always loaded. Set constraints.
            |
Layer 2: Skills             Reusable knowledge. Referenced by agents and commands.
            |
Layer 3: Agents             195 specialists. Auto-routed by context.
            |
Layer 4: Commands           70 slash commands. Orchestrate agents + skills.
            |
Layer 5: Hooks              22 automations. Event-driven quality gates.
            |
Layer 6: Scripts             21 Node.js utilities. Power the hooks.
```

Each layer builds on the one below. Rules constrain everything. Skills inform agents. Agents execute for commands. Hooks automate the gaps.

**Plugin manifest:** `.claude-plugin/plugin.json` registers agents and skill/command paths. Hooks auto-load from `hooks/hooks.json` by convention (Claude Code v2.1+).

---

## Cross-Platform Support

Fully tested on **Windows, macOS, and Linux** with automatic package manager detection:

```
Detection priority:
1. CLAUDE_PACKAGE_MANAGER env var
2. .claude/package-manager.json (project)
3. package.json packageManager field
4. Lock file detection (npm, pnpm, yarn, bun)
5. ~/.claude/package-manager.json (global)
6. Fallback: first available
```

**CI matrix:** 3 OS (Ubuntu, Windows, macOS) &times; 3 Node (18, 20, 22) &times; 4 PM (npm, pnpm, yarn, bun) = **36 combinations**.

---

## Testing

```bash
node tests/run-all.js                        # All 69 tests
node tests/lib/utils.test.js                 # 27 utility tests
node tests/lib/package-manager.test.js       # 23 PM detection tests
node tests/hooks/hooks.test.js               # 19 hook validation tests
```

Custom test runner. Zero framework dependencies. Runs in under 2 seconds.

CI validators also check all 195 agents, 70 commands, 94 skills, and 29 rules for valid frontmatter and structure.

---

## Requirements

- **Claude Code CLI** v2.1.0 or later
- **Node.js** 18+

Check your version:

```bash
claude --version
```

> **Note for contributors:** Do NOT add a `"hooks"` field to `.claude-plugin/plugin.json`. Claude Code v2.1+ auto-loads hooks by convention. Adding it causes duplicate detection errors. This is enforced by a regression test.

---

## Installation

### As a Plugin (Recommended)

```bash
/plugin marketplace add affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code
```

Or add to `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "everything-claude-code": {
      "source": { "source": "github", "repo": "affaan-m/everything-claude-code" }
    }
  },
  "enabledPlugins": {
    "everything-claude-code@everything-claude-code": true
  }
}
```

> **Rules must be installed manually** (plugin system limitation):
> ```bash
> git clone https://github.com/affaan-m/everything-claude-code.git
> cp -r everything-claude-code/rules/common/* ~/.claude/rules/
> cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # your stack
> ```

### Manual Install

```bash
git clone https://github.com/affaan-m/everything-claude-code.git

# Copy what you need
cp everything-claude-code/agents/*.md ~/.claude/agents/
cp everything-claude-code/commands/*.md ~/.claude/commands/
cp -r everything-claude-code/skills/* ~/.claude/skills/
cp -r everything-claude-code/rules/common/* ~/.claude/rules/
```

---

## How It Works

### Auto-Agent Routing

You don't pick agents. Claude does. The routing rules detect language, framework, and domain from your files and context, then delegate to the right specialist.

```
You: "Add authentication to the API"
Claude: planner → api-designer → security-reviewer → tdd-guide → code-reviewer
        (all automatic, no manual orchestration needed)
```

### Auto-Verification

After every code change, hooks automatically:
1. Lint modified files
2. Run type checker
3. Execute related tests
4. Check bundle size
5. Scan for secrets

### Continuous Learning

The plugin learns from your coding patterns:

```bash
/learn                    # Extract patterns from current session
/instinct-status          # View learned patterns with confidence scores
/evolve                   # Cluster patterns into reusable skills
```

---

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Areas where help is needed:**
- Language-specific skills (Rust, C#, Swift, Kotlin)
- Framework configs (Rails, Laravel, FastAPI, NestJS)
- DevOps agents (more cloud providers, advanced K8s)
- Testing strategies (visual regression, contract testing)
- Domain knowledge (ML pipelines, data engineering, mobile)

---

## Background

Originally created by [@affaanmustafa](https://x.com/affaanmustafa), winner of the Anthropic x Forum Ventures hackathon (Sep 2025). These configs evolved over 10+ months of intensive daily use building production applications.

**Guides:**
- [Shorthand Guide](https://x.com/affaanmustafa/status/2012378465664745795) — Setup, foundations, philosophy. Start here.
- [Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) — Token optimization, memory, evals, parallelization.

---

## License

MIT — Use freely, modify as needed, contribute back if you can.

---

<div align="center">

**Built for developers who ship.**

</div>
