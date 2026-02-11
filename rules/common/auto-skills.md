---
description: Automatically load and apply relevant skills based on context — no manual invocation needed
globs: "**/*"
---

# Auto Skills Loading

ALWAYS load and apply the relevant skill knowledge automatically when the context matches. Do NOT wait for the user to reference a skill — detect what's needed and use it.

## Auto-Load by File Type

| Files being edited | Auto-load skills |
|---|---|
| `.ts/.tsx` | typescript-advanced, frontend-patterns |
| `.py` | python-patterns, python-best-practices, python-testing |
| `.go` | golang-patterns, golang-idioms, golang-testing |
| `.rs` | rust-systems |
| `.java` | springboot-patterns, jpa-patterns, springboot-tdd |
| `.sql` | postgres-patterns, postgres-optimization, database-optimization |
| `.graphql` | graphql-design |
| `.tf` | kubernetes-operations |
| `.vue/.tsx/.jsx` (React) | react-patterns, frontend-excellence, web-component-design |
| `.css/.scss` | responsive-design, design-system-patterns |
| `Dockerfile` | docker-best-practices |
| `.github/workflows/` | ci-cd-pipelines, devops-automation |
| `k8s/`, `helm/` | kubernetes-operations |

## Auto-Load by Task Context

| What you're doing | Auto-load skills |
|---|---|
| Building API | api-design-patterns, openapi-spec-generation, backend-patterns |
| Authentication/auth | authentication-patterns, security-hardening, security-review |
| Payment/billing | stripe-integration, paypal-integration, pci-compliance, billing-automation |
| Database work | database-optimization, postgres-optimization |
| Testing | tdd-mastery, tdd-workflow, testing-strategies |
| Frontend UI | frontend-excellence, responsive-design, web-component-design, accessibility-wcag |
| Mobile (React Native) | mobile-development, react-native-design |
| Mobile (iOS) | mobile-ios-design |
| Mobile (Android) | mobile-android-design |
| Accessibility | accessibility-wcag, wcag-audit-patterns, screen-reader-testing, accessibility-compliance |
| Performance | performance-optimization |
| Security | security-hardening, security-review |
| Redis/caching | redis-patterns |
| WebSocket/realtime | websocket-realtime |
| GraphQL | graphql-design |
| Microservices | microservices-design |
| Monitoring | monitoring-observability |
| CI/CD | ci-cd-pipelines, devops-automation |
| Docker | docker-best-practices |
| Git advanced | git-advanced |
| Prompt engineering | prompt-engineering, prompt-engineering-patterns |
| LLM/AI integration | llm-integration, llm-evaluation, rag-implementation, langchain-architecture |
| Embeddings/vectors | embedding-strategies, vector-index-tuning, similarity-search-patterns, hybrid-search-implementation |
| Data engineering | data-engineering |
| AWS | aws-cloud-patterns |
| Design systems | design-system-patterns, visual-design-foundations |
| Interaction/animation | interaction-design |
| Changelog | changelog-automation |
| Multi-agent coordination | multi-reviewer-patterns, team-composition-patterns, task-coordination-strategies, team-communication-protocols |
| Django | django-patterns, django-security, django-tdd |
| Spring Boot | springboot-patterns, springboot-security, springboot-tdd |
| Next.js | nextjs-mastery |
| MCP development | mcp-development |
| Code standards | coding-standards |
| ClickHouse | clickhouse-io |

## Auto-Load by Project Detection

On session start, detect project type and preload:
- `package.json` with `next` → nextjs-mastery + react-patterns
- `package.json` with `react` → react-patterns + frontend-patterns
- `requirements.txt` / `pyproject.toml` → python-patterns + python-testing
- `go.mod` → golang-patterns + golang-testing
- `Cargo.toml` → rust-systems
- `pom.xml` / `build.gradle` → springboot-patterns + jpa-patterns
- `Gemfile` with `rails` → backend-patterns
- `docker-compose.yml` → docker-best-practices
- `.github/workflows/` → ci-cd-pipelines

## Rules

1. **Load silently** — don't announce which skills you're using
2. **Apply knowledge inline** — weave skill patterns into your work naturally
3. **Stack skills** — multiple skills can apply simultaneously (e.g., api-design-patterns + authentication-patterns + security-hardening for an auth API)
4. **Prioritize project-specific** over generic skills
5. **Skills inform, rules enforce** — skills provide patterns, rules provide constraints
