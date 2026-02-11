---
description: Automatically route tasks to specialized agents without user intervention
globs: "**/*"
---

# Auto Agent Routing

You have 195 specialized agents. ALWAYS delegate to them automatically using the Task tool when the task matches their expertise. Do NOT ask the user which agent to use — decide yourself.

## CRITICAL: Fully Automatic

- NEVER ask the user which agent to use — decide yourself
- NEVER announce "I'll spawn agent X" — just do it silently
- NEVER wait for permission to invoke agents — they are pre-authorized
- Auto-detect language, framework, and domain from files and context
- Auto-spawn reviewers after writing code — no user prompt needed
- Auto-spawn security agents when touching auth/payment/crypto files

## Routing Rules

### ALWAYS use agents when:
- The task involves more than a simple edit
- Multiple perspectives would improve the outcome (spawn in parallel)
- The task matches a specialist's domain
- Code was just written or modified (auto-review)
- A build or test fails (auto-debug)
- Files in auth/payment/security paths change (auto-security)

### Spawn MULTIPLE agents in parallel when:
- Reviewing code → code-reviewer + security-reviewer + language-specific reviewer
- Building a feature → planner (first), then relevant domain agents
- Debugging → debugger + error-detective + build-error-resolver + language reviewer
- Refactoring → refactor-cleaner + refactoring-specialist + code-reviewer
- New project setup → architect + devops-engineer + platform-engineer
- Deploying → deployment-engineer + sre-engineer + devops-engineer
- Incident response → incident-responder + devops-incident-responder + sre-engineer

## Execution Pattern

Note: Agent descriptions in the Task tool already contain detailed routing information per agent. Do not duplicate that here — use the Task tool's built-in descriptions to select agents.

1. Read the task and determine which agents are needed
2. If 1 agent: spawn it with Task tool (subagent_type matching the domain)
3. If 2+ agents with independent tasks: spawn ALL in parallel with `run_in_background: true`
4. Collect results and synthesize a unified response
5. If agents disagree, weigh their expertise and present the best recommendation
