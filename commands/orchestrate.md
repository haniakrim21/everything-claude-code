# Orchestrate Command

Sequential and parallel agent workflow for complex tasks.

## Usage

`/orchestrate [workflow-type] [task-description]`

## Workflow Types

### feature
Full feature implementation workflow:
```
planner → architect → tdd-guide → [domain developer] → code-reviewer + security-reviewer [parallel] → e2e-runner
```

### bugfix
Bug investigation and fix workflow:
```
debugger + error-detective [parallel] → build-error-resolver → tdd-guide → code-reviewer
```

### refactor
Safe refactoring workflow:
```
architect → refactor-cleaner + refactoring-specialist [parallel] → code-reviewer → tdd-guide
```

### security
Security-focused review:
```
security-reviewer + security-engineer + penetration-tester [parallel] → devsecops-engineer → code-reviewer
```

### deploy
Deployment workflow:
```
devops-engineer → kubernetes-specialist + terraform-engineer [parallel] → sre-engineer → observability-engineer
```

### api
API development workflow:
```
api-designer → backend-developer → api-documenter → security-reviewer + code-reviewer [parallel] → tdd-guide
```

### data
Data pipeline workflow:
```
data-engineer → database-architect → database-optimizer → data-scientist → code-reviewer
```

### mobile
Mobile development workflow:
```
planner → mobile-developer + [flutter/swift/kotlin] [parallel] → accessibility-tester → e2e-runner → code-reviewer
```

### fullstack
Full-stack feature:
```
planner → architect → frontend-developer + backend-developer [parallel] → fullstack-developer (integration) → code-reviewer + security-reviewer [parallel]
```

### incident
Incident response:
```
incident-responder → devops-incident-responder + sre-engineer [parallel] → devops-troubleshooter → observability-engineer
```

## Execution Pattern

For each agent in the workflow:

1. **Invoke agent** with context from previous agent
2. **Collect output** as structured handoff document
3. **Pass to next agent** in chain
4. **Aggregate results** into final report

Agents separated by `+` run in **parallel**. Agents separated by `→` run **sequentially**.

## Handoff Document Format

Between agents, create handoff document:

```markdown
## HANDOFF: [previous-agent] -> [next-agent]

### Context
[Summary of what was done]

### Findings
[Key discoveries or decisions]

### Files Modified
[List of files touched]

### Open Questions
[Unresolved items for next agent]

### Recommendations
[Suggested next steps]
```

## Final Report Format

```
ORCHESTRATION REPORT
====================
Workflow: [type]
Task: [description]
Agents: [agent chain]

SUMMARY
-------
[One paragraph summary]

AGENT OUTPUTS
-------------
[Each agent's key output]

FILES CHANGED
-------------
[List all files modified]

TEST RESULTS
------------
[Test pass/fail summary]

SECURITY STATUS
---------------
[Security findings if applicable]

RECOMMENDATION
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

## Arguments

$ARGUMENTS:
- `feature <description>` - Full feature workflow
- `bugfix <description>` - Bug fix workflow
- `refactor <description>` - Refactoring workflow
- `security <description>` - Security review workflow
- `deploy <description>` - Deployment workflow
- `api <description>` - API development workflow
- `data <description>` - Data pipeline workflow
- `mobile <description>` - Mobile development workflow
- `fullstack <description>` - Full-stack workflow
- `incident <description>` - Incident response workflow
- `custom <agents> <description>` - Custom agent sequence

## Custom Workflow Example

```
/orchestrate custom "architect,database-architect,backend-developer,code-reviewer" "Redesign caching layer"
```

## Tips

1. **Start with planner** for complex features
2. **Always include code-reviewer** before merge
3. **Use security-reviewer** for auth/payment/PII
4. **Keep handoffs concise** - focus on what next agent needs
5. **Use parallel phases** for independent reviews to save time
6. **Include language-specific agents** for the dominant file type
