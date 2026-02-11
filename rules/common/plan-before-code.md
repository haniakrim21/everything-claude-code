# Plan Before Code

## Mandatory Pre-Implementation Planning

NEVER start writing code for a new feature, endpoint, or service without a completed feature spec. This rule is non-negotiable.

## When Planning is Required

Planning is REQUIRED when:
- Building a new feature, endpoint, or service
- Adding a new API route that accepts user input
- Creating a new module or package from scratch
- Implementing authentication, payment, or data processing flows
- The task description contains: "add", "create", "build", "implement", "new"

Planning is NOT required when:
- Fixing a typo or formatting issue
- Updating a dependency version
- Adding a comment or docstring
- Renaming a variable
- A spec was already provided by the user

## Enforcement

Before writing any implementation code for a qualifying task:

1. **Auto-trigger** `/plan-feature` with the task description
2. **Generate** the full feature spec (inputs, outputs, edge cases, security, acceptance criteria)
3. **Validate** every section passes the completion checklist
4. **Present** the spec to the user for review
5. **Only after approval**, proceed to `/tdd` and implementation

## Spec Quality Gates

A spec MUST pass all of these before implementation begins:

| Gate | Requirement |
|------|------------|
| Purpose | Single sentence, not a paragraph |
| Inputs | Every field has type + validation + boundary |
| Outputs | Concrete response shape for success and every error |
| Edge cases | Minimum 5, covering empty/null/boundary/duplicate/concurrent |
| Security | Addresses auth, injection, rate limiting, data leakage |
| Acceptance criteria | Every criterion is independently testable |

## Integration with Existing Workflows

This rule enhances (not replaces) existing workflows:

```
Task arrives
  ↓
/plan-feature (this rule) → Feature Spec
  ↓
User reviews and approves spec
  ↓
/tdd → Tests from acceptance criteria
  ↓
Implementation → /code-review → /commit
```

## Exceptions

Skip planning and go directly to implementation when:
- The user explicitly says "just do it" or "skip planning"
- The change is a one-line fix with obvious intent
- A detailed spec or PRD was already provided in the conversation
- The task is purely investigative (research, debugging, profiling)
