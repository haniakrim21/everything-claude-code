# Archive

## Purpose

This directory holds deprecated, superseded, or historical content that is no longer active but preserved for reference.

## When to Archive

Move content here when:
- A component is replaced by a newer version
- A design decision is reversed (keep the ADR for context)
- An experiment concludes (successful or not)
- A workflow is consolidated into another

## Naming Convention

```
99-Archive/
├── YYYY-MM-DD_component-name_reason.md
├── 2025-01-15_old-hook-format_replaced-by-hooks-json.md
├── 2025-02-01_manual-agent-routing_replaced-by-auto-routing.md
└── ...
```

## Current Archive

No archived items yet. This directory was created as part of the documentation structure.

## Guidelines

1. **Never delete without archiving** — if it existed, it had a reason
2. **Include context** — why was it archived? What replaced it?
3. **Date everything** — use ISO 8601 format (YYYY-MM-DD)
4. **Link forward** — point to the replacement component
5. **Don't archive tests** — old tests should be deleted, not archived
