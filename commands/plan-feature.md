---
description: Generate a structured feature spec before writing any code
---

Generate a complete feature specification using the feature-planning skill template. Produce a validated spec that covers inputs, outputs, edge cases, security, and acceptance criteria before any implementation begins.

## Steps

### 1. Gather Context

- Read the feature description from user input or $ARGUMENTS.
- Identify the target project by scanning `package.json`, `go.mod`, `pyproject.toml`, `Cargo.toml`, or equivalent.
- Detect the framework and language from project files.
- Scan the codebase for related existing code (models, routes, services, tests).

### 2. Generate Feature Spec

Fill out the complete feature-planning template:

```markdown
Feature: [Derived from input]
Purpose: [One sentence]

Inputs:
  - [field]: [type], [required/optional], [validation], [limits]

Outputs:
  Success ([code]):
    { [concrete response shape with types] }
  Errors:
    [code] - [condition]

Edge cases:
  - [minimum 5, using systematic enumeration]

Security considerations:
  - [STRIDE-based threat analysis]

Dependencies:
  - [every external system, table, or library touched]

Acceptance criteria:
  - [ ] [specific, testable criterion]
```

### 3. Validate the Spec

Run through the completion checklist:
- Purpose is a single clear sentence
- Every input has type + validation + boundary
- Success response has concrete shape
- At least 5 edge cases enumerated
- Security section covers auth, injection, rate limiting
- All acceptance criteria are independently testable

If any item fails, fix the spec before presenting it.

### 4. Identify Implementation Approach

Based on the spec, suggest:
- Which files to create or modify
- Which existing patterns in the codebase to follow
- Which tests to write first (TDD order)
- Which agents to invoke for implementation

### 5. Present for Review

Output the completed spec in a fenced markdown block the user can copy, edit, and share.

## Format

```
FEATURE SPEC
============
Feature: [name]
Purpose: [one sentence]

INPUTS
------
[table of inputs with type, required, validation, limits]

OUTPUTS
-------
Success: [code] [shape]
Errors:  [code] [condition] (for each error path)

EDGE CASES
----------
1. [case]
2. [case]
...

SECURITY
--------
- [consideration]

DEPENDENCIES
------------
- [dependency]

ACCEPTANCE CRITERIA
-------------------
- [ ] [criterion]

IMPLEMENTATION PLAN
-------------------
Files: [list]
Tests first: [list]
Agents: [recommended agent chain]
```

## Rules

- Never skip the security section, even for internal-only features.
- Every input MUST have a validation rule. "String" alone is insufficient.
- Edge cases must cover empty, null, duplicate, boundary, concurrent, and encoding categories.
- Acceptance criteria must be testable by an automated test, not by human judgment.
- If the feature touches user input, authentication, or payment, flag it for security-reviewer.
- Output the spec BEFORE any code. Do not generate code in this command.

## Arguments

$ARGUMENTS: Feature description (free text). Examples:
- `user registration endpoint for Express API`
- `file upload service with S3 storage`
- `WebSocket chat room with message persistence`
- `Stripe subscription billing with proration`

## Workflow Integration

After the spec is approved, chain to implementation:
```
/plan-feature → (user reviews) → /tdd → /orchestrate feature
```
