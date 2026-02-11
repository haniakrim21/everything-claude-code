---
description: Multi-agent collaborative workflow patterns for complex tasks
globs: "**/*"
---

# Collaborative Workflow Patterns

## Core Principle

For any non-trivial task, multiple agents working together produce better results than a single agent. Use these patterns to coordinate agents effectively.

## Pattern 1: Parallel Review (Fan-Out / Fan-In)

Spawn independent reviewers simultaneously, then merge results.

```
Task arrives
  ├── code-reviewer [background]
  ├── security-reviewer [background]
  ├── performance-engineer [background]
  └── language-specific reviewer [background]
       ↓ all complete
  Synthesize unified report
```

**Use when:** Code review, PR review, audit, quality check

## Pattern 2: Sequential Pipeline (Chain)

Each agent passes context to the next in a defined order.

```
planner → tdd-guide → developer → code-reviewer → security-reviewer
```

**Use when:** Feature implementation, bug fix, refactoring

**Handoff format between agents:**
- Summary of what was done
- Key findings/decisions
- Files modified
- Open questions for next agent

## Pattern 3: Specialist + Generalist

Pair a domain expert with a broad reviewer for balanced output.

```
domain-expert (e.g., fintech-engineer) [background]
  +
generalist (e.g., code-reviewer) [background]
  ↓
Merge: domain correctness + code quality
```

**Use when:** Domain-specific work (payments, ML, blockchain, healthcare)

## Pattern 4: Competing Hypotheses (Debug)

Multiple agents investigate the same problem from different angles.

```
Bug report
  ├── debugger → root cause hypothesis A
  ├── error-detective → root cause hypothesis B
  └── language-reviewer → root cause hypothesis C
       ↓
Compare hypotheses → pick strongest → implement fix
```

**Use when:** Complex bugs, performance issues, intermittent failures

## Pattern 5: Plan-Build-Verify (Full Lifecycle)

Complete feature lifecycle with quality gates.

```
Phase 1 (Plan):     planner + architect [parallel]
Phase 2 (Build):    domain developer + tdd-guide [sequential]
Phase 3 (Review):   code-reviewer + security-reviewer + performance-engineer [parallel]
Phase 4 (Ship):     devops-engineer + sre-engineer [parallel]
```

**Use when:** New features, major changes, greenfield projects

## Pattern 6: Escalation Chain

Start with a lightweight agent; escalate to heavier ones if needed.

```
build-error-resolver (quick fix attempt)
  ↓ if unresolved
debugger + error-detective (deeper investigation)
  ↓ if still unresolved
architect + language-pro (structural analysis)
```

**Use when:** Build errors, test failures, unclear issues

## Agent Team Presets

### Full-Stack Feature Team
planner + architect + fullstack-developer + tdd-guide + code-reviewer + security-reviewer

### API Development Team
api-designer + api-documenter + backend-developer + database-reviewer + security-reviewer + tdd-guide

### Frontend Feature Team
frontend-developer + react-specialist (or vue/angular) + accessibility-tester + e2e-runner + ui-designer

### DevOps Deployment Team
devops-engineer + kubernetes-specialist + terraform-engineer + sre-engineer + observability-engineer

### Security Audit Team
security-reviewer + security-engineer + penetration-tester + devsecops-engineer + compliance-auditor

### Data Pipeline Team
data-engineer + data-scientist + database-architect + database-optimizer + mlops-engineer

### Mobile Development Team
mobile-developer + flutter-expert (or swift/kotlin) + accessibility-tester + e2e-runner + ui-designer

### Legacy Modernization Team
legacy-modernizer + architect + refactor-cleaner + code-reviewer + tdd-guide + documentation-engineer

### Incident Response Team
incident-responder + devops-incident-responder + sre-engineer + devops-troubleshooter + observability-engineer

## Coordination Rules

1. **Independence first**: If agents can work independently, spawn them in parallel
2. **Minimize handoffs**: Prefer parallel fan-out over long sequential chains
3. **Always include a reviewer**: Every write operation should have at least one review agent
4. **Language-aware**: Always include the language-specific agent for the dominant file type
5. **Cap at 6 parallel agents**: Beyond 6, use a meta-agent (multi-agent-coordinator) to orchestrate
6. **Conflict resolution**: When agents disagree, weigh by domain expertise relevance to the task
