---
name: ai-development-workflow-map
description: "This library is strictly divided into two types of governance:"
---
# Workflow: AI Development Workflow Map

## The Architecture: Core vs. Rules
This library is strictly divided into two types of governance:
- **`core/` (Always-Active):** Foundational governance (anti-hallucination, mistake logging, research gating) that applies to *every* session. These are mechanically folded into your project's AI context by the generator prompts.
- **`rules/` (Goal-Conditional):** Specific standards (like UI design or security) that are only attached when your current task demands them, preventing context bloat.

## When to run this
Read this first when unsure which prompt/rule/skill in the library to reach for on a project — it's the index and ordering for the whole AI-development toolkit below.

## The files

| File (dev-library path) | Type | Purpose |
|---|---|---|
| `core/instruction-hierarchy.md` | Core | Defines precedence (Core > Context > Rules) |
| `core/decision-framework.md` | Core | Explicit vs implicit decision making |
| `core/research-plan-code-gate.md` | Core | Hard gate: Research -> Plan -> Code |
| `core/output-policy.md` | Core | Anti-hallucination & claim verification |
| `core/safety.md` | Core | Guardrails for destructive actions |
| `core/mistake-log-protocol.md` | Core | Compounding engineering via MISTAKES.md |
| `core/anti-patterns.md` | Core | Slopsquatting & structural anti-patterns |
| `core/prompting-anti-patterns.md` | Core | 56 credit-killing prompt patterns with severity, bad/fixed examples |
| `core/skill-standard.md` | Core | 9-requirement enterprise skill standard with maturity tiers |
| `context-templates/PRD.md` | Template | Fill-in Product Requirements Document (goals, scope, MVP, KPIs) |
| `context-templates/ARCHITECTURE.md` | Template | Fill-in system architecture (layers, data flows, Mermaid diagrams) |
| `context-templates/DESIGN.md` | Template | Fill-in design system (colors, typography, spacing, accessibility) |
| `context-templates/SCHEMA.md` | Template | Fill-in database schema (tables, ER diagrams, RLS policies, API routes) |
| `context-templates/RULES.md` | Template | Fill-in project coding standards (naming, SOLID, state management) |
| `context-templates/TASKS.md` | Template | Fill-in task tracking and phase roadmap |
| `prompts/start-new-project-prompt.md` | Generator | Produces a starter prompt for a brand new project |
| `prompts/project-continuation-prompt.md` | Generator | Produces a prompt to continue, audit, or security-pass an existing project |
| `prompts/generate-skills-agents-rules-agentic.md` | Generator | Produces skills/agents/rules files by exploring codebase (folds in `core/`) |
| `prompts/generate-skills-agents-rules-loop.md` | Generator | Same, but via a draft→critique→revise loop for higher confidence |
| `prompts/generate-api-routes.md` | Generator | Scaffolds standardized endpoints (typed contract, error envelope, auth) |
| `prompts/security-review.md` | Generator | Runs the security checklist against a codebase in small reviewable batches |
| `rules/security-checklist.md` | Reference | Tiered pre-launch security checklist (attach when relevant) |
| `rules/api-contract.md` | Reference | Stable API design guidelines (attach when relevant) |
| `rules/ui-anti-slop.md` | Reference | Overused AI-generated design patterns to avoid (attach when doing UI) |
| `rules/writing-style.md` | Reference | Prose style, banned words, and truth protocol (attach when generating text) |
| `rules/error-handling.md` | Reference | Exception design and failure signaling (attach when refactoring logic) |
| `rules/testing-principles.md` | Reference | Isolation, mocking, and pyramid strategy (attach when writing tests) |
| `rules/clean-architecture.md` | Reference | Boundary isolation and YAGNI guardrails (attach when scaffolding) |
| `rules/module-organization.md` | Reference | Bans barrel files (index.ts) and circular dependencies (attach when structuring modules) |
| `rules/api-design-principles.md` | Reference | REST, versioning, and OpenAPI specs (attach when building endpoints) |
| `rules/design-principles.md` | Reference | SOLID, composition over inheritance, DRY/KISS/YAGNI/AHA (attach when designing) |
| `rules/function-design.md` | Reference | Function size, purity, CQS, guard clauses, documentation (attach when writing logic) |
| `rules/naming-conventions.md` | Reference | Universal multi-language naming casing and clarity rules (attach when coding) |
| `rules/nextjs-app-router-strict.md` | Reference | Enforces React Server Components, Server Actions, and Next.js 14+ routing |
| `rules/expo-react-native-strict.md` | Reference | Enforces Expo Router, Reanimated, FlashList, and mobile performance constraints |
| `rules/prisma-strict.md` | Reference | Enforces Prisma schema design, N+1 prevention, and connection pooling |
| `rules/deployment-checklist.md` | Reference | Pre-launch gates (CI, staged rollout, etc.) |
| `rules/mobile-performance-budget.md` | Reference | Measurable performance budgets for Expo/React Native apps |
| `skills/web-performance-audit/SKILL.md` | Skill | Read-only Lighthouse/browser audit of performance, SEO, accessibility |
| `skills/supabase-migrations/SKILL.md` | Skill | Create/review Supabase migrations |
| `skills/systematic-debugging/SKILL.md` | Skill | 4-phase root cause analysis and bug fixing protocol |
| `skills/test-driven-development/SKILL.md` | Skill | Red-Green-Refactor cycle for verified feature implementation |
| `skills/ui-ux-design-audit/SKILL.md` | Skill | Non-destructive visual refactoring, accessibility, and anti-slop tuning |

## Steps

**1. New project?**
Run `prompts/start-new-project-prompt.md` (attach both reference docs) → paste the generated starter prompt into your coding session → it scaffolds the project and produces an initial `PROJECT_STATE.md`.

**2. Set up the AI's persistent tooling for this project**
Run either skills/agents/rules prompt against the new (or existing) codebase → it produces the actual convention files for whichever tool you're using (Claude Code, Cursor, Copilot, or a plain `AGENTS.md` for tools like opencode). These persist and get followed automatically in future sessions on this project.
- Use **generate-skills-agents-rules-agentic.md** when you trust one well-reasoned exploration pass.
- Use **generate-skills-agents-rules-loop.md** when getting it wrong would be costly and you want to see the AI check its own work.

**3. Every working session after that**
Run `prompts/project-continuation-prompt.md` → set "Goal for this session" to whatever you're doing (finish a feature, run a security pass, audit the codebase) → attach `rules/security-checklist.md` if the goal touches security, or `rules/ui-anti-slop.md` if the goal touches UI/UX → paste the generated prompt into your coding session → it updates `PROJECT_STATE.md` when done.

Use a performance/SEO/accessibility audit goal (same generator) before a launch-readiness check, same as the security pass — `skills/web-performance-audit/SKILL.md` diffs against any prior audit already recorded in `PROJECT_STATE.md`. Attach `rules/deployment-checklist.md` for the final launch check, `rules/mobile-performance-budget.md` for any mobile/Expo feature work, `rules/api-contract.md` (with `prompts/generate-api-routes.md` or `prompts/security-review.md`) when new endpoints are involved, and `skills/supabase-migrations/SKILL.md` whenever the session touches the database schema.

**4. Repeat step 3** for every session until the project is ready to ship. Use a scoped closeout continuation prompt (same generator, goal = "final launch check") to confirm everything's actually verified before calling it done.

**5. Periodic maintenance.** `PROJECT_STATE.md` accumulates entries session after session. Periodically (e.g. every 10–15 sessions, or whenever it gets unwieldy) archive completed/historical items into a separate `CHANGELOG.md` and trim `PROJECT_STATE.md` back down to current-state-only, so continuation sessions aren't re-reading the project's entire history each time. Also re-run the skills/agents/rules generator (step 2) if a continuation session notices the existing convention files have drifted from the actual code.

## Checklist
- [ ] Every project tracked by this library has a linked `PROJECT_STATE.md` committed in its own repo
- [ ] Convention files (`CLAUDE.md`/`AGENTS.md`/`.cursor/rules`) are re-generated whenever they drift from real code
- [ ] `PROJECT_STATE.md` gets trimmed/archived periodically instead of growing forever

## What this system covers vs. doesn't

**Covers:** keeping every AI session grounded in real, current project state instead of re-explaining from scratch each time; enforcing security and design standards structurally rather than from memory; producing a consistent, reviewable trail (`PROJECT_STATE.md`) of what's been done and verified.

**Doesn't cover:** the actual coding judgment, code review quality, or whether a proposed fix is correct — you still review every diff. Also doesn't cover task/ticket tracking across multiple projects or deployment pipelines; that would be a separate system if you want one later.

## Related
- Prompts: [[start-new-project-prompt]], [[project-continuation-prompt]], [[generate-skills-agents-rules-agentic]], [[generate-skills-agents-rules-loop]], [[generate-api-routes]], [[security-review]]
- Rules: [[security-checklist]], [[api-contract]], [[ui-anti-slop]], [[deployment-checklist]], [[mobile-performance-budget]]
- Skills: [[web-performance-audit]], [[supabase-migrations]]

---
Last updated: 2026-09-07
