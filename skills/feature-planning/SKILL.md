---
name: feature-planning
description: Structured pre-implementation planning that produces a validated spec before any code is written
---

# Feature Planning

## Why Plan First

Clear specs produce better AI output, prevent "works but unmaintainable" code, create a checklist for validation, and save hours of debugging. Never start implementation without a completed feature spec.

## Feature Spec Template

Every feature must be specced using this template before writing code:

```markdown
Feature: [Name]
Purpose: [One sentence explaining why this exists]

Inputs:
  - [name]: [type], [required/optional], [validation rules], [max length/range]

Outputs:
  Success ([status code]):
    { [response shape] }
  Errors:
    [status] - [condition]

Edge cases:
  - [What could go wrong?]
  - [Boundary conditions?]
  - [Concurrent access?]
  - [Empty/null/missing inputs?]

Security considerations:
  - [What must be protected?]
  - [Authentication/authorization requirements?]
  - [Data sensitivity?]
  - [Rate limiting?]

Dependencies:
  - [External services?]
  - [Database tables?]
  - [Shared libraries?]

Acceptance criteria:
  - [ ] [Testable criterion 1]
  - [ ] [Testable criterion 2]
```

## Spec Completion Checklist

Before moving to implementation, verify:

- [ ] **Purpose** is a single, clear sentence (not a paragraph)
- [ ] **Every input** has a type, validation rule, and boundary
- [ ] **Success response** has a concrete shape with field types
- [ ] **Every error case** has a status code and condition
- [ ] **At least 5 edge cases** identified (empty, null, duplicate, overflow, concurrent)
- [ ] **Security section** addresses auth, secrets, injection, and rate limits
- [ ] **Dependencies** lists every external system touched
- [ ] **Acceptance criteria** are testable (not vague like "should work well")

## How to Fill the Template

### Step 1: Define Purpose

Write one sentence. If you need two, the feature is too broad — split it.

Bad: "Handle user authentication and profile management"
Good: "Register a new user account with email/password credentials"

### Step 2: Map Inputs Exhaustively

For every input field:

| Question | Example |
|----------|---------|
| What is the type? | `string`, `number`, `enum`, `object` |
| Is it required? | required / optional (with default) |
| What validates it? | regex, min/max, enum values, format |
| What is the maximum? | 255 chars, 10MB, 1000 items |
| What happens at the boundary? | exactly at max, one over, zero |

### Step 3: Map Every Output Path

List every possible response the endpoint/function can return:

```
Success paths:
  201 - Resource created successfully
  200 - Resource already existed (idempotent)

Error paths:
  400 - Missing required field
  400 - Field fails validation
  401 - No auth token provided
  403 - Valid token but insufficient permissions
  409 - Duplicate resource (unique constraint violation)
  422 - Valid format but semantically wrong (e.g., end date before start date)
  429 - Rate limit exceeded
  500 - Unhandled server error
```

### Step 4: Enumerate Edge Cases

Use these categories to find edge cases systematically:

| Category | Examples |
|----------|---------|
| **Empty/null** | Empty string, null, undefined, missing key |
| **Boundary** | Min-1, min, max, max+1, zero, negative |
| **Format** | Unicode, emoji, HTML, SQL, script tags |
| **Duplicate** | Same input twice, concurrent identical requests |
| **Timing** | Slow network, timeout, retry, stale data |
| **Scale** | 1 item, 1000 items, 1M items |
| **State** | Already exists, already deleted, in-progress |
| **Encoding** | Case sensitivity, whitespace, trailing slashes |

### Step 5: Security Threat Model

Apply STRIDE to every feature:

| Threat | Question |
|--------|----------|
| **Spoofing** | Can an attacker impersonate a legitimate user? |
| **Tampering** | Can input data be manipulated maliciously? |
| **Repudiation** | Can actions be denied without audit trail? |
| **Info Disclosure** | Can error messages or responses leak sensitive data? |
| **Denial of Service** | Can the endpoint be abused to exhaust resources? |
| **Elevation of Privilege** | Can a user access resources beyond their role? |

### Step 6: Write Acceptance Criteria

Every criterion must be:
- **Specific**: "Returns 201 with user ID" not "creates user"
- **Testable**: Can be verified with an automated test
- **Independent**: Does not depend on other criteria
- **Complete**: Covers happy path, errors, and edge cases

## Integration with Development Workflow

```
/plan-feature → Feature Spec (this skill)
     ↓
  Review spec with stakeholders
     ↓
/tdd → Write tests from acceptance criteria
     ↓
  Implement → Code-review → Ship
```

## Anti-Patterns

- Starting to code before the spec is complete
- Spec that only describes the happy path
- Inputs without validation rules
- "Should handle errors gracefully" (not testable)
- Missing security section for endpoints that accept user input
- Acceptance criteria that duplicate each other
- Spec that describes implementation ("use Redis") instead of behavior ("respond within 200ms")
