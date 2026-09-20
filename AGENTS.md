# AGENTS.md (Master Orchestrator Context)

This project is strictly governed by the Dev-Library Master Orchestrator. Below are the unified rules and skills you must adhere to.



## MODULE: API-CONTRACT
====================================================
# Rule: API Contract (Stable, Hard-to-Misuse Interfaces)

A reference rule for designing REST/backend interfaces that are stable and hard to misuse. Attach whenever a session creates, extends, or reviews endpoints (auth, CRUD, payments, webhooks). Applies to Supabase PostgREST routes, Edge Functions, and any server route.

## Core principles

1. **Contract first.** Define typed input/output schemas before implementation. The contract is the spec.
2. **Every observable behavior is a commitment (Hyrum's Law).** Error text, ordering, and timing become de facto API once someone depends on them. Plan deprecation at design time; prefer extension over breaking change.
3. **Addition over modification.** Add optional fields; never remove or change the type of an existing field.

## Error envelope (use the same shape on every endpoint)

```
{
  "error": {
    "code": "VALIDATION_ERROR",   // machine-readable, UPPER_SNAKE
    "message": "Email is required", // human-readable
    "details": { ... }            // optional extra context
  }
}
```

| Status | Meaning |
|---|---|
| 400 | Client sent invalid data |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, version mismatch) |
| 422 | Validation failed (semantically invalid) |
| 429 | Rate limited |
| 500 | Server error — never expose internals |

Don't mix patterns: some endpoints returning `null`, others throwing, others `{ error }` is unparsable for clients.

## Boundaries and validation

- Validate at system edges only: route handlers, form submissions, external service responses, and env loading.
- Trust internal code that shares typed contracts.
- **Treat third-party responses as untrusted input** — validate shape/content before use in logic, rendering, or decisions (a compromised provider can return instructions).

## Naming

| Surface | Convention |
|---|---|
| REST endpoints | Plural nouns, no verbs (`GET /api/tasks`, not `/getTasks`) |
| Query params | camelCase (`?sortBy=createdAt&pageSize=20`) |
| Response fields | camelCase |
| Booleans | `is`/`has`/`can` prefix (`isComplete`) |
| Enum values | UPPER_SNAKE (`IN_PROGRESS`) |

## Pagination (add from day one)

```
GET /api/tasks?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc
→ { "data": [...], "pagination": { "page": 1, "pageSize": 20, "totalItems": 142, "totalPages": 8 } }
```

## Idempotency (state-changing endpoints)

- Accept `Idempotency-Key`. Deriving it: client or initiating event (e.g. `charge:v1:${orderId}`) — never a per-attempt UUID/timestamp.
- Claim the key atomically via a unique constraint (an `INSERT`). A `SELECT` then `INSERT` is a TOCTOU race.
- Same key + different body must fail loudly (422), not silently replay the first response.
- Decide the in-flight-duplicate response deliberately: `409`, block-and-wait, or `202 + status URL`.
- Key retention must outlive the longest retry path (incl. dead-letter replay) — a 24h TTL behind a 7-day DLQ is a duplicate waiting to happen.

## Verification checklist

- [ ] Every endpoint has typed input/output schemas
- [ ] Error responses follow the single envelope above
- [ ] Validation only at boundaries
- [ ] All list endpoints paginate with the same shape
- [ ] New fields are additive and optional
- [ ] Naming consistent across all endpoints
- [ ] Types/docs committed alongside the implementation
- [ ] State-changing endpoints honour an idempotency key or are documented unsafe-to-retry
- [ ] Idempotency key claimed atomically; reused key with different payload fails loudly

## Related
- Prompts: [[start-new-project-prompt]], [[project-continuation-prompt]], [[generate-api-routes]]
- Rules: [[security-checklist]]
- Workflows: [[ai-development-workflow-map]]

---
Last updated: 2026-09-07


## MODULE: API-DESIGN-PRINCIPLES
====================================================
# Rule: API Design Principles

> **Purpose:** API design engineering rules for REST, GraphQL, and OpenAPI specifications. Attach this rule to enforce strict API standards and consistent service contracts.

## 1. REST API Design
- **Resource-Noun URLs:** Use plural nouns for resource endpoints (`/users`, `/orders`). Avoid verbs in URLs; use HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) to indicate actions.
- **HTTP Status Codes:** `200` for successful GET/PUT, `201` for created resources (POST), `204` for deleted resources, `400` for client errors, `401`/`403` for auth, `404` for not found, `500` for server errors.
- **Filtering and Pagination:** Use query parameters for filtering (`?status=active`), sorting (`?sort=created_at`), and pagination (`?page=2&limit=10`). 
- **HTTP Methods Semantics:**
  - `GET`: Retrieve resource. Must be idempotent and safe.
  - `POST`: Create a new resource. Not idempotent.
  - `PUT`: Replace a resource entirely. Must be idempotent.
  - `PATCH`: Partially update a resource.
  - `DELETE`: Remove a resource. Must be idempotent.

## 2. API Versioning
- **URL Versioning (Preferred for Breaking Changes):** `/v1/users`, `/v2/users`. Use when the change is not backward-compatible.
- **Header Versioning:** `Accept: application/vnd.api+v1+json`. Good for minor versioning.
- **Deprecation, Not Removal:** Deprecate old versions with `Deprecation` header and timeline. 

## 3. OpenAPI/Swagger Specification
- **Versioned Specs:** Store OpenAPI YAML/JSON files versioned in the repository (`openapi/v1.yaml`). Never generate specs solely at runtime without source control.
- **Security Schemes:** Define `securitySchemes` for OAuth2, API keys, or Bearer tokens. Reference them in individual operation `security` blocks.
- **Request/Response Models:** Define inline or referenced models for every request body and response type. Use `examples` fields to illustrate typical payloads.

## 4. Authentication and Authorization
- **Bearer Tokens:** Use `Authorization: Bearer <jwt>` for stateless authentication. JWTs should be short-lived (15-30 minutes) with refresh token flow.
- **Scope-Based Authorization:** Attach scopes to tokens (`scope: read:users`). Check scopes on the server side for every protected resource.
- **Rate Limiting:** Implement per-IP or per-token rate limiting. Return `429 Too Many Requests`.



## MODULE: ARCHITECTURE-DECISIONS
====================================================
---
name: architecture-decision-records
description: Rule to enforce the documentation of Architecture Decision Records (ADRs) whenever a structural choice is made.
---

# Rule: Architecture Decision Records (ADRs)

> **Purpose:** Ensures the "why" behind major engineering decisions is documented for future maintainers (and for your thesis defense).

## When to Log an ADR
You must generate an ADR in the `docs/ADR/` directory whenever a non-trivial architectural choice is made. A choice is non-trivial if it is hard to reverse. Examples include:
- Changing a core library (e.g., Redux to Zustand).
- Modifying the database schema strategy (e.g., NoSQL vs SQL).
- Choosing a specific rendering pattern (e.g., SSR vs CSR).
- Adopting a specific 3D technique (e.g., InstancedMesh vs Individual Meshes).

## ADR Format
Create a markdown file named `YYYY-MM-DD-short-title.md` (e.g., `2026-09-20-use-zustand-for-3d-state.md`) with the following structure:

```markdown
# [Title of the Decision]

**Date:** YYYY-MM-DD
**Status:** [Proposed | Accepted | Deprecated]

## Context
What is the problem we are trying to solve? Why is a decision needed now?

## Considered Options
1. [Option A]
2. [Option B]

## Decision
What is the final choice and why? (Cite official documentation if applicable).

## Consequences
What becomes easier? What becomes harder? (e.g., "Easier to manage global state, but adds 3kb to bundle size").
```



## MODULE: CLEAN-ARCHITECTURE
====================================================
# Rule: Clean Architecture & Adaptive Layering

> **Purpose:** Framework-agnostic engineering standard for Clean Architecture, layer isolation, and YAGNI guardrails. Attach this rule when scaffolding new projects or designing complex features.

## 1. Core Architecture Axioms
1. **The Dependency Rule:** Source code dependencies point strictly inward toward higher-level policies. Inner layers know nothing about outer layers. Domain logic must not depend on database clients, HTTP frameworks, UI components, or external SDKs.
2. **Framework Independence:** Frameworks are external tools, not architecture drivers. Business rules remain usable and testable without any web framework or database engine present.
3. **YAGNI & Anti-Bloat Guardrails:** Architecture exists to enable change, not to force speculative indirection. Do NOT generate empty interfaces, single-implementation abstractions, or placeholder directories until concrete complexity demands them. Do NOT create multi-file indirection chains for simple CRUD operations.
4. **Boundary Isolation:** Data cross-layer boundaries in plain data structures (DTOs, primitive types, or immutable records). Database entities or HTTP request objects must not leak into the Domain layer.

## 2. Adaptive Adaptation
- **Brownfield (Existing Codebase):** Inspect the existing layout first. Respect established patterns. Never rename, move, or split existing files or folders unless explicitly requested.
- **Greenfield (New Project):** Start with the simplest viable directory structure required. Create directories only when files exist to fill them. Never commit empty `.gitkeep` directories or placeholder boilerplate.

## 3. Layer Definitions
- **Domain:** Core enterprise business rules, entities, pure functions. (Allowed dependencies: None).
- **Application:** Use-case interactors, input/output port definitions. (Allowed dependencies: Domain layer).
- **Interface Adapters:** Controllers, presenters, gateways, DTO mappers, API handlers, repository implementations. (Allowed dependencies: Domain, Application layers).
- **Infrastructure:** Database drivers, web servers, UI views, external API clients, framework wiring. (Allowed dependencies: All layers).



## MODULE: DEPLOYMENT-CHECKLIST
====================================================
# Rule: Deployment Checklist (Ship Without Regret)

A pre-launch/pre-deploy checklist co-opted from the rollout-plan discipline: CI gates, staged rollout, rollback, and observability. Attach before any launch-readiness review, and before any risky migration going live.

## CI gates (must pass before a release is buildable)

- [ ] Typecheck passes with zero errors
- [ ] Lint passes (no `any`, no unused imports)
- [ ] Unit + integration tests pass
- [ ] E2E smoke test on the release channel (not just local)
- [ ] Dependency audit clean (or every finding triaged and documented)
- [ ] Secrets scan — no committed keys/tokens, no `service_role` key in the bundle

## Build & artifact

- [ ] One authoritative lockfile, committed and used by CI
- [ ] Build is reproducible from a tagged commit (not "whatever is on main")
- [ ] Version number bumped and stamped into the artifact
- [ ] Source maps not publicly served; debug mode off

## Staged rollout

- [ ] Ship to a staging/canary group first; watch error rates before wider rollout
- [ ] Database migrations run forward-compatible with the previous app version (expand, then contract; never drop a column still read by the old build)
- [ ] Feature flags gate risky changes so a bad release can be disabled without redeploying

## Rollback

- [ ] Rollback procedure written and rehearsed before the release — don't write it during the incident
- [ ] A rollback is a full-fidelity downgrade: old artifact can run against the current schema, which means keeping schema changes backward-compatible for at least one release
- [ ] Pre-release backup verified restorable (test the restore, not just the backup job)

## Post-deploy verification

- [ ] Health checks pass on every instance/region
- [ ] Logs, metrics, and traces flowing to the observability system
- [ ] Alerting actually fires (test with a synthetic error) for: 5xx spikes, p95 latency, failed deploys, error-budget exhaustion
- [ ] Error/tracking dashboard checked within minutes of deploy, not the next day

## After a release rolls back or degrades

- [ ] Incident documented with what/why/impact, not just the fix
- [ ] Alert turned into an automated check if the incident type wasn't caught automatically

## Related
- Prompts: [[start-new-project-prompt]], [[project-continuation-prompt]]
- Rules: [[security-checklist]]
- Workflows: [[ai-development-workflow-map]]

---
Last updated: 2026-09-07


## MODULE: DESIGN-PRINCIPLES
====================================================
# Rule: Design Principles (SOLID, Composition, DRY/KISS/YAGNI)

> **Purpose:** Classical structural heuristics governing abstraction decisions. Attach this rule when designing modules, components, or class hierarchies.

## 1. SOLID Principles
- **Single Responsibility (SRP):** Each function, class, and component has one reason to change. Separate presentation from routing, data fetching, and state logic.
- **Open/Closed (OCP):** Extend behavior through composition or strategy patterns. Do not mutate established core components to add variants.
- **Liskov Substitution (LSP):** Subtypes and interface implementations must drop into any caller without breaking expectations.
- **Interface Segregation (ISP):** Prefer small, specific interfaces over bloated multi-purpose interfaces. Consumers depend strictly on members they call.
- **Dependency Inversion (DIP):** Depend on abstractions, not concrete implementations. Pass dependencies into functions or constructors.
- **Polymorphism over Type Branching:** Replace repeated `switch`/`if` checks on type flags with discriminated unions, pattern matching, or polymorphic dispatch.

## 2. Composition Over Inheritance
- Compose behavior using small, single-purpose objects or functions rather than inheriting from deep class hierarchies.
- Deep inheritance binds subclasses tightly to parent implementation details, leading to fragile base class problems.
- Encapsulate varying algorithms behind strategy interfaces and delegate work to composed dependencies.

## 3. DRY, KISS, YAGNI, and AHA
- **DRY (Rule of Three):** Extract a shared abstraction only after a pattern repeats three distinct times. Premature extraction produces rigid code.
- **AHA (Avoid Hasty Abstractions):** Prefer mild duplication over the wrong abstraction. Duplication is cheaper than a flawed abstraction that couples unrelated concerns.
- **KISS:** Prefer the least complex design satisfying requirements. Avoid premature optimization and unnecessary indirection layers.
- **YAGNI:** Build strictly what current requirements demand. Do not add features on speculation about future needs.

## 4. Resolving Conflicts
- When SRP and DRY conflict, resolve toward SRP first. A small duplicated block with one clear owner beats a shared abstraction with two reasons to change.
- Treat every abstraction as a debt instrument. Each abstraction must pay rent through reduced duplication, isolated change, or simplified reasoning. Delete abstractions failing this test.

## 5. Data, Behavior, and Boundaries
- **Law of Demeter:** A method talks only to its own class, objects it creates, objects passed as arguments, and objects it holds as fields. Never chain calls through returned objects.
- **Tell, Don't Ask:** Command objects to perform actions rather than querying internal state to decide externally.
- **Functional Core, Imperative Shell:** Keep business logic pure and deterministic. Push side effects (I/O, database, APIs) to system boundaries.



## MODULE: DRIZZLE-ORM-STRICT
====================================================
---
name: drizzle-orm-strict
description: Strict guidelines for using Drizzle ORM in Next.js and modern JS environments. Enforces schema separation, drizzle-kit usage, and performant querying.
trigger: model_decision
---

# Rule: Strict Drizzle ORM Guidelines

> **Purpose:** Enforces performant, secure, and type-safe database access using Drizzle ORM. Applies automatically when Drizzle ORM is detected in the tech stack.

## 1. Schema Definition (`schema.ts`)
- **Single Source of Truth:** Define all database tables, enums, and relations in a centralized `schema.ts` file (or `schema/` directory if massive).
- **Naming Conventions:** Use camelCase for TypeScript variables (e.g., `usersTable`), but snake_case for the actual database table names (e.g., `pgTable('users', {...})`).
- **Timestamps:** Always include `createdAt` (default to `now()`) and `updatedAt` columns on core business tables.

## 2. Queries and Performance
- **Relational vs Core API:** 
  - Use Drizzle's Relational API (`db.query.tableName.findMany()`) for heavily nested graphs (it solves N+1 out of the box).
  - Use the Core SQL-like API (`db.select().from().leftJoin()`) when you need maximum performance, complex aggregations, or specific SQL functions.
- **Client/Server Boundary:** Never leak the database instance to client components (`"use client"`). All Drizzle queries must execute inside Next.js Server Components, Server Actions, or Route Handlers.

## 3. Migrations & Drizzle Kit
- Use `drizzle-kit generate` to create SQL migration files. 
- Use `drizzle-kit push` ONLY for local rapid prototyping. Do not use `push` in production pipelines.
- Store migration files in the `drizzle/` directory.

## 4. Edge Compatibility
- If deploying to Vercel Edge or Cloudflare Workers, ensure you import the specific edge-compatible database driver (e.g., `@neondatabase/serverless` or `@vercel/postgres`).



## MODULE: ERROR-HANDLING
====================================================
# Rule: Error Handling

> **Purpose:** How production code signals and handles failure. Attach this rule when generating or refactoring code that handles exceptions.

## 1. Separate Algorithm from Failure Handling
- Error handling occupies one place. It never wraps every single step. A function where each line sits inside its own check buries the algorithm under failure branches.
- Keep the main path linear from first step to last. Let a single boundary decide what happens when a step breaks.

## 2. Own Your Exception Types and Chain Causes
- Library and framework exception types never escape into application domain code.
- Wrap third-party APIs behind an adapter catching foreign exception types and rethrowing custom domain error types.
- Preserve root causes when rethrowing by passing the original exception via `Error.cause` (e.g., `new DomainError("Operation failed", { cause: originalError })`).

## 3. Type-Safe Catch Inspection
- Treat caught error variables as `unknown` (for example `catch (error)` in TypeScript).
- Inspect and narrow error types explicitly using `instanceof Error` or custom type guards before reading properties like `error.message`.
- Never leave empty catch blocks (`catch (error) {}`) or silently swallow errors.

## 4. No Exceptions as Control Flow
- Throw only when something breaks. When both outcomes of a lookup are expected normal results (such as finding no matching item in a cache), return a default value, option, or Result type instead of throwing.
- A catch block acting as an `if` branch is a design defect.

## 5. No Log-and-Rethrow Anti-Pattern
- Either handle and log an error at a boundary, OR rethrow it to caller code—never both at the same boundary. Logging and rethrowing produces duplicate log entries for a single failure.



## MODULE: EXPO-REACT-NATIVE-STRICT
====================================================
---
name: expo-react-native-strict
description: "Strict Expo and React Native guidelines. Enforces Expo Router, Reanimated for motion, native module constraints, and performance budgets for mobile."
trigger: model_decision
---

# Expo & React Native Strict Standards

This rule applies automatically whenever you are working on a mobile app using Expo and React Native.

## 1. Routing & Architecture
- **Expo Router:** Use Expo Router (file-based routing in the `app/` directory) for all navigation. Do not use raw React Navigation configurations unless strictly necessary for a highly custom navigator.
- **Deep Linking:** Ensure all routes support deep linking naturally via Expo Router's automatic path resolution.

## 2. Performance & UI
- **FlashList over FlatList:** Always default to `@shopify/flash-list` for lists containing more than 20 items. Avoid standard `FlatList` or `ScrollView` for unbounded data.
- **Motion & Animations:** Use `react-native-reanimated` (v3+) for all animations. Do not use the legacy React Native `Animated` API, as it blocks the JS thread. Use `layout` animations for mount/unmount transitions.
- **Image Handling:** Use `expo-image` instead of the standard `<Image>` component for aggressive caching, blurhashes, and better memory management.
- **Styling:** Use NativeWind (Tailwind for React Native) or StyleSheet.create. Avoid inline styles `{ margin: 10 }` as they cause unnecessary re-renders.

## 3. Device & Platform Interactions
- **Safe Area:** Always wrap top-level screens in `<SafeAreaView>` from `react-native-safe-area-context` (not the default React Native one) to handle notches and dynamic islands.
- **Platform Specifics:** Use `Platform.OS` or `Platform.select` sparingly. Prefer unified designs. When native modules diverge, extract them into `.ios.tsx` and `.android.tsx` files rather than heavily branching inside components.
- **Keyboard Handling:** Use `KeyboardAvoidingView` or `react-native-keyboard-aware-scroll-view` for all text input screens to prevent the keyboard from obscuring inputs.

## 4. Supabase & State on Mobile
- **AsyncStorage:** Ensure Supabase is configured with a custom storage adapter (like `expo-secure-store` or `AsyncStorage`) for session persistence, as mobile lacks standard browser cookies.
- **Offline States:** Always account for sudden network drops. Provide loading states (`ActivityIndicator` or skeletons) and error boundaries for all data fetching.

## 5. Build & Native Modules
- **Prebuild First:** Prefer Expo Go for pure JS development, but default to Continuous Native Generation (CNG) via `expo prebuild` when custom native code is required. Avoid dropping down to bare React Native workflows manually.
- **EAS Config:** Keep `app.json` clean and maintain different environments (dev, preview, prod) using `eas.json` profiles.



## MODULE: FUNCTION-DESIGN
====================================================
# Rule: Function Design

> **Purpose:** Structural rules for every function an agent or developer writes. Attach this rule when generating application logic so functions stay small, honest about effects, and self-documenting.

## 1. Scope, Size, and Complexity
- **Small Single-Purpose Functions:** A function must do one thing. If you can label chunks of a function with different names, split it.
- **One Level of Abstraction per Function:** High-level functions read like a table of contents. Call lower-level functions instead of inlining details.
- **Minimize Argument Count:** Aim for 0-2 arguments. Wrap 3+ parameters into a structured options object.
- **Cognitive Complexity Target:** Keep cognitive complexity at or below 15. Avoid deep nesting, complex conditional chains, or long subroutines.

## 2. Pure Functions and Execution Flow
- **Pure Functions First:** Prefer pure functions that compute output solely from input parameters without modifying external state.
- **No Parameter Reassignment:** Data flows in through parameters and out through return values. Treat input arguments as immutable references.
- **No Flag Arguments:** Do not pass boolean flags to select execution paths. Split the paths into separate named functions. Data booleans remain allowed (e.g., `setVisible(true)`).
- **Command Query Separation (CQS):** A function either performs an action (command) or returns data (query), never both.
- **No Hidden Side Effects:** A function name is a contract. If a function performs effects beyond its name (e.g., `checkPassword()` resetting a session), rename it honestly or move the effect out.
- **Early Return Guard Pattern:** Handle errors and edge cases at the top of functions using early returns. Avoid nested `if`/`else` chains.

## 3. Code Documentation
- **JSDoc / Docstring Coverage:** Document every exported function, class, and utility. Include parameters, return values, and thrown errors. Describe contracts, not signatures.
- **Inline Comments Sparingly:** Add inline comments only for non-obvious logic (workarounds, performance trade-offs, external constraints). Code explains what. Comments explain why.
- **Comment Hygiene:** Keep comments current within the same edit as the code change. Delete stale comments immediately. Never leave commented-out code.

## 4. File Layout
- **Headline First:** Place the highest-level function at the top of each source file so a reader learns what the module does within three lines.
- **Stepdown Order:** Define every function below its first caller. Files read top-to-bottom from high-level intent to low-level detail.
- **Declare Near Use:** Introduce each local variable immediately before its first use. Never hoist declarations to the top of long functions.



## MODULE: GIT-WORKFLOW
====================================================
---
name: Git and Version Control Hygiene
description: Strict guidelines to prevent AI tools from creating massive, unreadable commits.
---

# Git Workflow & Atomic Commits

AI coding tools are strictly forbidden from creating massive "dump" commits (e.g., "update files", "fix bug"). You must adhere to the following professional Git workflow:

## 1. Conventional Commits
All commit messages MUST follow the Conventional Commits standard:
- `feat:` (New feature)
- `fix:` (Bug fix)
- `docs:` (Documentation changes)
- `style:` (Formatting, missing semi colons, etc; no code change)
- `refactor:` (Refactoring production code)
- `test:` (Adding tests, refactoring test; no production code change)
- `chore:` (Updating build tasks, package manager configs, etc; no production code change)

## 2. Atomic Commits
- Never group unrelated changes into a single commit.
- If you updated the UI and fixed a database bug, those MUST be two separate commits.
- Review `git diff` before committing to ensure no unintended files or `console.log` statements are included.

## 3. Branching Strategy
- Do not push directly to `main` or `master` unless explicitly instructed.
- Create descriptive branches: `feat/auth-system`, `fix/header-alignment`.



## MODULE: GSAP-REACT-STRICT
====================================================
---
name: gsap-react-strict
description: Critical safety rules for using GSAP in React 18+ (App Router). Enforces useGSAP to prevent severe memory leaks and strict-mode double firing.
trigger: model_decision
---

# Rule: GSAP in React (Memory Leak Prevention)

> **Purpose:** Prevents frame-drops, duplicate animations, and memory leaks caused by incorrect GSAP implementation in modern React environments.

## 1. The `@gsap/react` Mandate
You are **STRICTLY FORBIDDEN** from using raw `useEffect` or `useLayoutEffect` to trigger GSAP animations in React components. React 18's Strict Mode mounts, unmounts, and remounts components, which causes raw GSAP tweens to double-fire and leak memory.

**You MUST use the `useGSAP()` hook from the `@gsap/react` package.**

### Incorrect (Never do this):
```tsx
// ❌ WRONG: Causes memory leaks and double-firing
useEffect(() => {
  gsap.to('.box', { x: 100 });
}, []);
```

### Correct (Required):
```tsx
// ✅ RIGHT: Automatically handles cleanup and context
import { useGSAP } from '@gsap/react';

useGSAP(() => {
  gsap.to('.box', { x: 100 });
});
```

## 2. Scoping Selectors
When targeting elements, you must use the `scope` property inside `useGSAP` instead of global class names to avoid accidentally animating elements in other components.

```tsx
const container = useRef();

useGSAP(() => {
  // This will ONLY target the '.box' inside the container ref
  gsap.to('.box', { rotation: 360 });
}, { scope: container });
```

## 3. Responsive & State-driven Animations
If your GSAP animation depends on React state (e.g., triggering an animation when `isOpen` changes), pass the state variable into the `dependencies` array of `useGSAP`, just like a standard React hook.



## MODULE: MOBILE-PERFORMANCE-BUDGET
====================================================
# Rule: Mobile Performance Budget (Expo / React Native)

Hard, measurable budgets for Expo/React Native apps so performance is a reviewed constraint, not an accident. Attach whenever a session adds screens, lists, images, or animations to a mobile app. Numbers are starting points for a typical consumer app — adjust per project and record the actuals.

## Startup & bundle

- [ ] Hermes enabled (release builds)
- [ ] No `console.log` in production bundles
- [ ] Splash screen controlled explicitly (hide on first frame, not a fixed sleep)
- [ ] Route-level code splitting (async routes / `lazy`); no giant barrel imports (`@components/index` pulls in everything)
- [ ] Initial JS bundle target: < 25 MB uncompressed; audit any dependency over ~1 MB with justification

## Lists

- [ ] `FlashList` (or `FlatList`) for anything longer than ~10 rows — never an unvirtualized `ScrollView` over mapped data
- [ ] Provide `estimatedItemSize` (FlashList) / `getItemLayout` (FlatList) for fixed-size rows
- [ ] `getItemType` for heterogeneous lists; stable `renderItem` via `useCallback`
- [ ] Row components memoized; no inline objects/functions passed into rows (breaks memoization)

## Images

- [ ] `expo-image` with caching over raw `<Image>` for remote photos
- [ ] Request size-appropriate images (never full-res for thumbnails); WebP/AVIF where the source supports it
- [ ] Prefetch hero/above-the-fold images during splash; lazy-load everything below
- [ ] `recyclingKey` on FlashList image rows
- [ ] Image budget: no single hero over ~300 KB; thumbnails ≤ 40 KB

## Rendering

- [ ] Memoize expensive computations (`useMemo`); stabilize handlers (`useCallback`)
- [ ] Split context by update frequency so a fast-changing value doesn't re-render the whole tree
- [ ] Animate `transform`/`opacity`, not `width`/`height`/`top`; native driver / Reanimated for anything but trivial transitions
- [ ] No layout thrashing from reading layout then writing style in the same frame

## Memory & data

- [ ] Subscriptions, timers, and fetch aborted on unmount
- [ ] List data capped in memory (paginate/window, don't hold an unbounded array)
- [ ] Async compound requests batched/parallelized (`Promise.all`), not awaited serially when independent

## Related
- Prompts: [[start-new-project-prompt]], [[project-continuation-prompt]]
- Workflows: [[ai-development-workflow-map]]
- Skills: [[web-performance-audit]]

---
Last updated: 2026-09-07


## MODULE: MODULE-ORGANIZATION
====================================================
# Rule: Module Organization & Barrel File Ban

> **Purpose:** Rules governing how modules import from each other. Attach this rule when creating files, moving exports, or reviewing import statements so the module graph stays flat, tree-shakeable, and fast.

## 1. No Barrel Files in Application Code
- **Rule:** Do not create or add to barrel files in application code. A barrel is an `index.js` or `index.ts` file strictly re-exporting sibling modules (e.g., `export * from './color'`).
- **Why Barrels Cost:** Importing one API through a barrel forces the bundler to resolve every module the barrel re-exports, including unrequested ones. This inflates bundles, causes circular imports, and slows down test runners.
- **Direct Imports:** Import from the specific file defining the API: `import { useUser } from '@/hooks/use-user'`, never `import { useUser } from '@/hooks'`.
- **No New Barrels:** Do not introduce a new `index.ts` whose only job is re-exporting sibling files.

## 2. Zero Circular Dependencies
- **No Module Cycles:** Modules must never form circular import loops (A imports B, B imports A). Circular references break module initialization and cause runtime temporal dead zones (`undefined` imports).
- **Cycle Resolution:** When two modules depend on each other, extract the shared types/logic into a third file, or apply dependency inversion.

## 3. Type-Only Imports and Path Mapping
- **Explicit Type Imports:** Use `import type` (or language equivalent) for type-only references. This ensures complete removal of type references during compilation.
- **Clean Path Mapping:** Use root path aliases (e.g., `@/components/button`) instead of deep relative imports (`../../../components/button`).



## MODULE: NAMING-CONVENTIONS
====================================================
# Rule: Naming Conventions

> **Purpose:** Universal naming specification for every identifier across all languages and layers. Attach this rule when generating or reviewing code to ensure predictable, searchable names.

## 1. Universal Casing Standards (Language-Agnostic)
- **Files and Folders:** `kebab-case` for all source files, directories, and assets (e.g., `theme-provider.tsx`, `auth-wizard/`).
- **Variables and Functions:** Use language-idiomatic casing (`camelCase` in JS/TS; `snake_case` in Python/Rust/SQL).
- **Global Constants:** `UPPER_SNAKE_CASE` across all languages for immutable module-level constants (e.g., `MAX_POSTS_PER_PAGE`).
- **Boolean Variables:** Prefix with `is`, `has`, `can`, or `should` (e.g., `isLoading`, `hasError`, `canSubmit`).

## 2. Frontend and UI Layer
- **Components:** `PascalCase` for component declarations and JSX tags (e.g., `ThemeProvider`, `ProjectCard`).
- **Custom Hooks / Composables:** Prefix with `use` plus a capital letter (e.g., `useTheme`, `useMediaQuery`).
- **Event Handlers:** Prefix with `handle` for internal handlers (`handleClick`), and `on` for component event props (`onClick`).
- **CSS Classes:** `kebab-case` or BEM methodology (`.btn-primary`, `.card__header--active`).

## 3. Backend and Systems Layer
- **TypeScript / JavaScript:** `PascalCase` for types, interfaces, classes, enums; `camelCase` for functions and methods.
- **Python (PEP 8):** `PascalCase` for classes; `snake_case` for functions, methods, parameters, and files.
- **Database:** `snake_case` plural for SQL tables (`user_accounts`), singular `snake_case` for columns (`created_at`).
- **Environment Variables:** `UPPER_SNAKE_CASE` with mandatory framework prefixes (e.g., `NEXT_PUBLIC_API_URL`).

## 4. Naming Clarity Principles
- **Reveal Intent:** A name must answer why it exists and what it does. If a comment fulfills this role, rename the symbol instead.
- **Avoid Disinformation:** Never call a `Map` a "list." Never let two names differ only through visually ambiguous characters.
- **Make Meaningful Distinctions:** Different names must imply different responsibilities. Avoid noise suffixes like `Manager`, `Handler`, or `Data`.
- **Pronounceable and Searchable:** Broadly scoped identifiers must read aloud cleanly and grep cleanly. Single letters only for short-scoped loop locals.
- **Skip Type Encodings:** Do not prefix names with type identifiers (`strName`, `iCount`). The type system surfaces types.
- **Pick One Word per Concept:** Use one canonical verb for identical operations across the codebase (e.g., `fetch` for async reads, `get` for sync).
- **Prefer Positive Booleans:** Use positive states (`isEnabled`, `isVisible`) to prevent double-negatives (`!isDisabled`).
- **Scale Name Length to Scope Size:** Single-letter identifiers are permitted only in 1-3 line local scopes; module-scoped symbols must be explicit.



## MODULE: NEXTJS-APP-ROUTER-STRICT
====================================================
---
name: nextjs-app-router-strict
description: "Strict Next.js 14+ App Router guidelines. Enforces React Server Components (RSC) by default, standardizes data fetching, bans old pages directory patterns, and optimizes Tailwind integration."
trigger: model_decision
---

# Next.js App Router Strict Standards

This rule applies automatically whenever you are working on a Next.js project using the `app/` router.

## 1. Server Components by Default
- **RSC First:** All components are React Server Components by default. Never add `'use client'` at the top of a file unless it absolutely requires browser APIs, React state (`useState`), lifecycle hooks (`useEffect`), or event listeners (`onClick`).
- **Leaf Nodes Only:** Push `'use client'` down the component tree as far as possible. Do not wrap entire pages or layouts in client components.
- **Interleaving:** If a client component needs server-rendered children, pass them via the `children` prop.

## 2. Data Fetching and Mutations
- **Server Fetching:** Fetch data directly in Server Components using `await`. Do not use `useEffect` or `useQuery` for initial data fetching unless doing client-side polling.
- **Server Actions:** Use Server Actions (`'use server'`) for all form submissions and database mutations. Do not write custom API routes (`route.ts`) just to handle form data.
- **Cache Control:** Be explicit about caching. Use `unstable_cache` or `fetch` options (`revalidate`, `cache: 'no-store'`) rather than relying on global defaults, which change across Next.js versions.

## 3. Architecture & Routing
- **Directory Structure:** Colocate components, tests, and styles alongside their specific routes when possible, or inside a clean `@/components` alias folder. 
- **Route Handlers:** Use `app/api/.../route.ts` only for external webhooks, OAuth callbacks, or third-party integrations. Internal app logic should use Server Actions instead.
- **No `pages/`:** Absolutely no usage of `getServerSideProps`, `getStaticProps`, or the `pages/` directory pattern.

## 4. UI & Styling (Tailwind)
- **Utility First:** Use Tailwind CSS exclusively for styling. Do not write custom CSS files or use styled-components unless specifically requested.
- **Merge Safely:** Use `twMerge` and `clsx` (or `cn` utility) when combining Tailwind classes via props to prevent specificity clashes.
- **Next/Image & Next/Link:** Always use `<Image>` for local and remote images (with configured domains). Always use `<Link>` for internal navigation instead of raw `<a>` tags to enable prefetching.

## 5. State Management
- **URL State:** Prefer the URL (query parameters) for shareable state (search, filters, pagination) using `useSearchParams` rather than `useState`. 
- **Server State:** Let React Server Components handle database state. Use Zustand or React Context strictly for complex client-side interactivity (like audio players or deep multi-step wizards).



## MODULE: PRISMA-STRICT
====================================================
---
name: prisma-strict
description: "Strict Prisma ORM guidelines. Enforces schema single-source-of-truth, edge runtime compatibility, correct migration flows, and performance querying."
trigger: model_decision
---

# Prisma ORM Strict Standards

This rule applies automatically whenever you are working on a project that uses Prisma (`prisma/schema.prisma`).

## 1. Schema Design
- **Single Source of Truth:** Treat `schema.prisma` as the absolute source of truth for the database. Do not manually edit the database schema outside of Prisma migrations unless using a strict separate migration tool (like Supabase migrations).
- **Naming:** Use `PascalCase` for model names (e.g., `User`, `BlogPost`) and `camelCase` for field names.
- **Relations:** Always define explicit relation fields and scalar fields. Use `@relation` attributes clearly.

## 2. Query Performance
- **N+1 Prevention:** Use `include` to eagerly load relations in a single query rather than looping over results and firing multiple queries.
- **Select Specificity:** Use `select` to return only the fields you actually need, especially when sending data to the client, to avoid leaking sensitive fields (like password hashes).

## 3. Client Instantiation
- **Global Instance (Next.js):** Always instantiate the Prisma Client in a separate `lib/prisma.ts` file and attach it to the `global` object in development. This prevents exhausting database connections during hot-reloads.
- **Edge Runtime:** If deploying to edge environments (like Vercel Edge Functions or Cloudflare Workers), remember that standard Prisma Client cannot run directly. You must use Prisma Accelerate (Data Proxy) or the driver adapters feature.

## 4. Migrations
- **Safe Changes:** When altering tables (especially dropping columns or changing types), always review the generated SQL in the `prisma/migrations/` folder before applying it to production.
- **Push vs. Migrate:** Use `npx prisma db push` only for rapid prototyping in development. Always use `npx prisma migrate dev` to generate proper migration files for production.



## MODULE: SECURITY-CHECKLIST
====================================================
# Rule: Security Checklist (Tiered)

A consolidated, deduplicated pre-launch security checklist. Used by [[start-new-project-prompt]] (build it in from day one) and [[project-continuation-prompt]] (when a session's goal is a security pass).

## Tier 1 — Start Here (do these on every project, no exceptions)

1. Keep every API key and secret server-side, never in frontend/client code
2. Use the public/anon database key on the frontend, never the admin/service-role key
3. Enable row-level security on every database table, with real per-user policies (no `USING (true)`)
4. Confirm every endpoint checks record ownership, not just that the user is logged in
5. Rate-limit the API, especially login, signup, password reset, and anything that costs money per call
6. Set billing caps and usage alerts on every paid service
7. Use parameterized queries — never build SQL/queries from raw user input

## Tier 2 — Full checklist (work through before launch; re-run after major features)

### Secrets and keys
- Purge secrets from Git history (not just current code) if any were ever committed; rotate anything exposed
- Ensure `.env` and secret files are in `.gitignore`
- Set a periodic rotation cadence for long-lived API keys and secrets, not just rotation after a known exposure

### Database & Cryptography
- Encrypt sensitive fields at rest (PII, tokens) using modern standards (AES-256-GCM)
- Restrict database user/service permissions to least privilege — not full admin
- Enforce TLS 1.3 for all internal and external database/service connections

### Auth and access control
- Enforce authentication and authorization on the server for every protected route — never trust the frontend alone
- Block mass assignment: endpoints only accept the specific fields a user is allowed to change (never `role`, `is_admin`, etc.)
- Use OAuth2 with PKCE (Proof Key for Code Exchange) for mobile and single-page apps; never use the implicit flow
- Implement Refresh Token Rotation (RTR) and automatic reuse detection to revoke compromised sessions
- Store session tokens in secure, `HttpOnly`, `SameSite` cookies — not `localStorage`
- Hash passwords with bcrypt or Argon2id (preferred) if you built your own auth (or confirm your auth provider handles it)
- Reset all active sessions when a password changes
- Invalidate sessions and re-check authorization when a user's role or permission level changes, not just on password rotation
- Expire password reset links after a short window
- Rate-limit password reset requests specifically (separate from general rate limiting)
- Prevent user enumeration — auth/reset errors shouldn't reveal whether an email exists
- Lock accounts after repeated failed login attempts
- Add CSRF tokens on state-changing requests
- Add HSTS so browsers only ever connect via HTTPS

### Rate limiting and abuse
- Add bot protection (CAPTCHA or similar) on public forms, verified server-side
- Limit request payload size

### Input and output
- Validate and sanitize all input server-side (type, length, format) — even if the frontend also validates
- Sanitize before storing, not just before displaying
- Escape user-generated content before rendering (XSS prevention)
- Whitelist allowed file types for uploads (not blocklist); validate size server-side; store uploads where they can't execute
- Trim API responses to only the fields the client needs — never leak password hashes, tokens, or other users' data

### Network and CORS
- Lock down CORS to explicit allowed origins, not wildcard
- Disable directory listing
- Remove or rename default/framework admin routes

### Payments (only if handling money)
- Verify payment webhook signatures; reject anything that fails verification
- Set and verify all prices server-side, never trust a client-submitted amount

### AI features (only if using LLMs)
- Keep user input separate from system instructions to block prompt injection
- Treat model output as untrusted — escape before display, never execute directly
- Cap AI usage per user, enforced server-side
- If the model can call tools/take actions (not just generate text), require explicit confirmation before any side-effecting action, and verify the action server-side rather than trusting the model's stated intent

### Dependencies and supply chain
- Package-hallucination check: LLMs regularly invent plausible-but-nonexistent npm/PyPI package names. Attackers pre-register these fake names with malicious code. **NEVER** add a dependency to a project without first confirming it actually exists on the official registry.
- Treat dependency upgrades as code changes: preview the remediation diff, read changelogs, test each upgrade — never auto-`npm audit fix --force` or bulk-upgrade silently
- Keep one authoritative lockfile per project and prevent unchecked dependency install scripts from running at build/test time (audit them once, then pin)

### Deployment and ops
- Force HTTPS everywhere; redirect HTTP to HTTPS
- Add security headers: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, Permissions-Policy
- Add Subresource Integrity (SRI) hashes on any third-party CDN scripts/styles
- Turn off debug mode in production; confirm source maps and `.git` aren't publicly served
- Show generic error messages to users; log full details privately (no stack traces/secrets to client)
- Scan dependencies for known vulnerabilities; update what's safe, flag what needs manual review
- Treat dependency upgrades as code changes: preview the remediation diff, read changelogs, test each upgrade — never auto-`npm audit fix --force` or bulk-upgrade silently
- Keep one authoritative lockfile per project and prevent unchecked dependency install scripts from running at build/test time (audit them once, then pin)
- Generate and publish a Software Bill of Materials (SBOM) during CI/CD to track all runtime dependencies
- Protect any server-side URL fetching (webhooks, image proxies, link previews): allowlist schemes and hosts, reject requests to private/reserved IP ranges (including cloud metadata `169.254.169.254`), and disallow or re-validate redirects (SSRF)
- Give every personal-data store a retention window and a working deletion path that also covers backups, caches, search indexes, and analytics; support data-subject export/delete where required
- Before destructive filesystem operations (delete/move/overwrite), resolve symlinks and verify the target stays inside the expected allowlisted root — never operate on raw paths supplied by user input or model output
- Turn on logging and monitoring for errors and suspicious activity; never log secrets
- Log security-specific events separately (auth failures, permission denials, suspicious patterns)
- Set up automatic, restorable database backups
- Enable two-factor authentication on hosting, database, domain registrar, and email accounts

## Tier 3 — Mobile-specific (only if building a mobile app)

- Keep API keys out of the app bundle — call your own backend instead
- Store tokens in platform secure storage (Keychain/Keystore), not AsyncStorage
- Validate the user and request server-side before any deep link triggers a sensitive action
- Never rely on biometrics alone for sensitive actions — device biometrics gate the UI, the server still verifies

## How to apply this

Work through Tier 1 first, always. Then Tier 2, skipping Payments/AI sections if not applicable. Add Tier 3 for mobile apps. Apply checklist items in small batches — review each change before moving to the next — rather than attempting all items in one uninterruptible pass. Re-run the relevant tiers after any major feature addition.

## Related
- Prompts: [[start-new-project-prompt]], [[project-continuation-prompt]]
- Workflows: [[ai-development-workflow-map]]

---
Last updated: 2026-09-07



## MODULE: STATE-MANAGEMENT
====================================================
---
name: State Management Boundaries
description: Strict rules to prevent React state spaghetti, infinite re-renders, and prop drilling.
---

# State Management Constraints

AI agents frequently mix server state and client state, leading to performance degradation and spaghetti code. Enforce these boundaries strictly:

## 1. Server State vs. Client State
- **Server State:** Any data fetched from an API or database.
  - MUST use caching libraries like TanStack Query (React Query) or SWR.
  - DO NOT sync server state into local `useState` or global stores. Rely on the cache.
- **Client State:** UI state (e.g., modals open/closed, dark mode, selected tabs).
  - Use `useState` for strictly local component state.
  - Use `Zustand` for global client state.

## 2. React Context Anti-Pattern
- DO NOT use React Context for global state that changes frequently (this causes whole-tree re-renders).
- React Context is ONLY permitted for Dependency Injection (e.g., passing a theme object or an auth provider) that rarely changes.

## 3. Prop Drilling
- If you are passing a prop down more than 2 levels, STOP.
- Refactor using Component Composition (passing `children`) or lift the state into a Zustand store.



## MODULE: TESTING-PRINCIPLES
====================================================
# Rule: Testing Principles

> **Purpose:** Testing engineering rules for unit, integration, and end-to-end test strategies. Attach this rule when writing tests or configuring a CI pipeline.

## 1. Testing Pyramid
- **Unit Tests (70%+):** Fast, isolated tests for individual functions. Must not depend on external services or databases.
- **Integration Tests (20%):** Test interactions between components/APIs. Verify data flow without full UI rendering.
- **E2E Tests (10%):** Simulate real user journeys. Critical paths only (login, checkout). Do not place business logic verification in E2E tests.

## 2. Unit Testing Guidelines
- **Test Isolation:** No shared state. Use `beforeEach`/`afterEach` for cleanup.
- **Arrange-Act-Assert:** Structure every test file with clear setup (Arrange), execution (Act), and verification (Assert) sections.
- **One Concept Per Test:** Never pack multiple behaviors into a single test. Split into separate focused tests so failure diagnosis is immediate.

## 3. Mock and Stub Guidelines
- **Mock What You Don't Own:** Mock external systems (APIs, databases, message queues). Do not mock types or interfaces defined in your own codebase.
- **Avoid Over-Mocking:** If you mock 5 levels deep, the design is too layered or integration tests are needed.
- **Stub Clock/Time:** Use fake timers only when testing time-dependent logic. Restore real timers after each test.

## 4. Test Maintenance
- **Treat Tests as Production Code:** Tests require the same code review, linting, and refactoring attention as production code.
- **Delete Redundant Tests:** If a feature is removed, delete its tests. Do not leave orphaned tests.
- **Document Test Intent:** Add a one-sentence comment at the top of each test explaining what behavior is being verified and why it matters.



## MODULE: UI-ANTI-SLOP
====================================================
# Rule: UI/UX Anti-Slop Patterns

Overused, templated AI-generated design patterns to actively avoid when building new UI. Used by [[start-new-project-prompt]] before any UI/UX decisions are made, and by [[project-continuation-prompt]] when a session's goal is UI/UX work.

## Visual patterns to avoid
1. Purple-to-blue gradient (the default AI gradient)
2. Gradient text on hero headings
3. Emojis used inside headings
4. Inter font used everywhere (pick a deliberate pairing instead)
5. Colored border cards as the default card style
6. Glassmorphism cards as a default choice
7. Low-contrast dark mode (test actual contrast, don't eyeball it)
8. Three icon boxes in a row (the default "features" section layout)
9. A badge sitting above the headline
10. Lucide icons used indiscriminately everywhere
11. Untouched/default shadcn UI components with no customization
12. Generic Space Grotesk + Instrument Serif font pairing
13. Bento-grid layout used as the default way to present any set of features
14. Pill-shaped buttons used as the only button shape everywhere
15. Numbered-circle-with-connecting-line "how it works" diagrams
16. Generic 5-star testimonial cards with stock-looking avatars

## Interaction/motion patterns to avoid
17. Fade-in-on-scroll as the only/default animation
18. Cursor-following beam/glow effects
19. Buttons that only fade on hover with no other affordance

## Layout/craft signals to avoid
20. Inconsistent spacing (no defined spacing scale)
21. Grain texture layered over a gradient as a default treatment

## Copy patterns to avoid
22. Em dashes used everywhere in copy
23. Generic buzzword copy ("supercharge," "unlock," "seamless," "elevate")
24. Serif italic accents used as a generic "premium" signal

## Modern AI design tells to avoid
25. Warm-cream background (`#F4F1EA`-style) + terracotta/clay accent (`#D97757`-style) as the default "editorial" palette
26. Near-black hero (`#0B0B0B` or `#111`) + a single acid-green or bright vermilion accent chosen because it "looks designed" without a real rationale
27. A `→` arrow appended to every link and button
28. All-caps eyebrow labels paired with middle-dot meta strings (`Home · About · Contact`)
29. Monospace fonts for small data labels (timestamps, counts) used as a default editorial tic
30. Broadsheet "newspaper" layouts — hairline rules, zero border-radius, dense multi-column text — treated as premium by default

## React Native / Expo-specific patterns to avoid
31. Unguarded `ScrollView` for long lists — use `FlatList`/`FlashList` with virtualization
32. Ignoring safe-area insets (notch, home indicator, status bar) so content clips or overlaps
33. Web-style hover-only affordances: `:hover` states that do nothing on touch devices
34. Emoji used as icons instead of real SVG iconography
35. Generic placeholder profile avatars or stock imagery instead of meaningful media
36. Async actions with no loading feedback (no skeleton screens or activity indicators)

## How to apply this

Before building any UI, review this list. Make deliberate, specific choices instead — a real design direction (color, type, spacing, motion) chosen for the project's identity, not defaults reached for because they're common in AI output. If in doubt, choose restraint over decoration.

## Related
- Prompts: [[start-new-project-prompt]], [[project-continuation-prompt]]
- Workflows: [[ai-development-workflow-map]]

---
Last updated: 2026-09-07



## MODULE: WRITING-STYLE
====================================================
# Rule: Writing Style & Truth Protocol

> **Purpose:** Reusable writing-style rules, banned-word tiers, and a strict truth protocol for any prompt that produces reader-facing prose: articles, UI copy, emails, documentation, and user-visible messages. Attach this rule when generating text content.

## Writing Style
- Use clear, simple language.
- Be spartan and informative. Use short, impactful sentences.
- Use active voice. Avoid passive voice.
- Focus on practical, actionable content.
- Use "you" and "your" to address the reader directly.
- Avoid em dashes anywhere. Use commas or periods.
- Avoid Latin abbreviations in prose (`e.g.`, `i.e.`, `etc.`). Spell them out ("for example", "that is", "and so on").
- Avoid setup phrases such as "in conclusion," "in closing," or "in summary."
- Avoid unnecessary adjectives and adverbs.

## Banned Words (Anti-Slop)
Do not use these words in reader-facing prose. (This does not apply to code or technical identifiers).
- **Always Banned:** delve, embark, esteemed, shed light, craft, crafting, imagine, remarkable, glimpse, unlock, discover, skyrocket, abyss, innovative, revolutionary, customize, disruptive, utilize, utilizing, illuminate, unveil, pivotal, intricate, elucidate, paradigm, harness, exciting, groundbreaking, skyrocketing, opened up, powerful, inquiring, exploration, testament, really, literally, actually, basically, very, just, probably.
- **Marketing/Filler Ban:** tapestry, beacon, multifaceted, synergy, synergistic, pivot, leverage, holistic, robust, seamless, game-changer, supercharge, elevate, curate, paradigm shift, herculean, panacea, linchpin, quintessential, cornerstone, bedrock.

## Truth Protocol
- Tell the truth. Never speculate, guess, or hallucinate facts.
- Base statements on verifiable, factual, current sources.
- Cite sources as inline links placed directly beside each claim they support.
- State "I cannot confirm this" when something cannot be verified.
- Show how computed figures (reading time, word count) are calculated.



## MODULE: ARCHITECTURE-REFACTOR-AUDIT
====================================================
---
name: architecture-refactor-audit
description: >-
  Run a structural audit to find and fix monolithic files (1000+ lines), spaghetti code, and architectural violations.
  Use when the user asks for "/refactor-audit", "/architecture-audit", or "clean up my code".
trigger: explicit
---

# The Architecture & Refactoring Audit

AI coding tools often degrade project architecture over time by appending code to the same files, creating unmaintainable monoliths. This skill reverses that entropy.

## Workflow

### Phase 1: The Monolith Hunt
1. Scan the codebase (specifically `app/`, `components/`, or `src/`) for any file exceeding 300 lines of code.
2. Identify files that violate the Single Responsibility Principle (e.g., a file handling database queries, UI rendering, and state management simultaneously).

### Phase 2: Feature-Sliced Breakdown
For every monolithic file found, execute a strict refactoring plan:
1. **Extract UI Components:** Move large sub-trees of JSX into their own isolated components.
2. **Extract Logic (Custom Hooks):** Move complex `useState` and `useEffect` chains into standalone custom hooks (e.g., `useUserDashboard.ts`).
3. **Extract Utilities:** Move pure data-formatting functions into a `utils/` or `lib/` directory.

### Phase 3: Folder Structure Enforcement
Ensure the project follows a scalable standard:
- UI Components belong in `components/ui/` (if reusable) or `components/features/` (if domain-specific).
- Database calls and API interactions must be separated from UI components.

### Phase 4: Generate Verdict
Generate a `REFACTOR_VERDICT.md` detailing which files were broken down and the new component hierarchy.



## MODULE: BACKEND-SECURITY-AUDIT
====================================================
---
name: backend-security-audit
description: >-
  Run the ultimate backend and security audit combining automated SAST scanning, practical anti-vulnerability heuristics from The Lazy Developer, and Doubt-Driven Adversarial Reviews.
  Use when the user asks for "/backend-audit", "/security-audit", "check backend", or "harden my API".
trigger: explicit
---

# The Ultimate Backend & Security Audit

This skill executes a comprehensive, multi-layered audit of the backend, database, and API layer. It combines programmatic linting with LLM-driven architectural reviews based on industry gold standards and the "The Lazy Developer" security playbook.

## Workflow

Execute the following 4 passes systematically. Do not skip any pass.

### Phase 1: Programmatic & Tooling Pass
Run terminal commands to check the actual state of the project dependencies and secrets:
1. Run `npm audit` or `yarn audit` to identify vulnerabilities in the supply chain.
2. Search the codebase for leaked secrets (e.g., hardcoded API keys, JWT secrets, database connection strings). 
3. Check `package.json` for outdated or abandoned core packages.

### Phase 2: The Lazy Developer Pass (Business Logic & Auth)
Manually review the codebase specifically looking for the exact mistakes AI tools usually make. Fix these immediately if found:
- **Authorization & IDOR:** Authenticated != Authorized. Check every `GET`, `POST`, `PUT`, `DELETE` endpoint. Does it verify that the *logged-in user owns the specific record* they are trying to access? If missing, add ownership checks.
- **Securing Endpoints:** Any endpoint without a shared secret or auth middleware is public. Lock down every route that writes data or triggers a side effect.
- **Environment Variables:** Ensure server secrets DO NOT have `NEXT_PUBLIC_` or `VITE_` prefixes. Check that `.env.local` is in `.gitignore`.
- **Database RLS & Privilege Escalation:** In Supabase/Prisma, ensure users cannot flip their own `is_admin` or `role` flags via the UI/API. Enforce Row Level Security (RLS) on all tables.
- **Payments & Webhooks:** Ensure webhook signatures are actually verified. Add a database uniqueness constraint (e.g., processed_event_id) so replay attacks cannot double-grant credits.

### Phase 3: The Architecture & Performance Pass
Review the database access and application architecture:
- **Eliminate N+1 Queries:** Find any loops in the code that trigger a database round-trip (e.g., fetching a user, then looping through to fetch their posts). Refactor to use `include` (Prisma) or SQL `JOIN`s to batch the request.
- **Rate Limiting:** Ensure public mutating endpoints (login, signup, reset password) have rate limiting applied.
- **Pagination & Scale Traps:** Look for `.findMany()` or `.select()` calls without `limit` or `take` arguments. AI often assumes databases are small. Enforce limits on all list endpoints.

### Phase 4: Doubt-Driven Development (The Adversarial Review)
Before generating the final verdict and committing fixes, act as a fresh-context adversarial reviewer. Apply this exact mindset to the codebase:
> *"Adversarial review. Find what is wrong with this artifact. Assume the author is overconfident. Do NOT validate. Find issues. Look for unstated assumptions, edge cases not handled, and ways the contract could be violated."*
Scrutinize your own proposed fixes from Phases 2 and 3. If the adversarial review finds holes (e.g., "This fix breaks under concurrent requests"), fix them.

### Phase 5: Fix and Generate Verdict
Refactor the codebase to patch the vulnerabilities discovered. 
Once completed, generate or update a report at `security/BACKEND_VERDICT.md` with the following structure:

```markdown
# Backend Security Verdict -- [Project Name]

**disposition: [SECURE | VULNERABLE]**

## 1. Automated Scan Results
[Summarize npm audit and secret scanning results]

## 2. The Lazy Developer Fixes
[List the IDORs, public endpoints, and webhook replays fixed]

## 3. Architecture & DB Optimizations
[List the N+1 queries killed, and pagination limits enforced]

## 4. Adversarial Findings
[List edge cases caught by the Doubt-Driven review phase]

## Conclusion
[Provide a final security rating and any remaining risks]
```



## MODULE: BUILD-ENGINE
====================================================
---
name: build-engine
description: >-
  The execution engine. Enforces Source-Driven Development (anti-hallucination) and Incremental Implementation (atomic slices) when writing code. 
  Use when the user says "/build", "implement this", or when executing a task list from the Genesis phase.
trigger: explicit
---

# The Incremental Build Engine

When instructed to write code or execute a task, you must NEVER dump large amounts of code across multiple files in a single pass. You must act as a disciplined, senior software engineer and follow this strict execution pipeline.

## Phase 1: Source-Driven Verification
AI training data goes stale. Do not guess framework-specific APIs.
1. **Detect Stack:** Read `package.json` to identify the exact versions of the frameworks in use (e.g., React 19, Three.js).
2. **Fetch Docs (If Uncertain):** If implementing a complex or new API, use your tools to fetch the *official documentation* (e.g., react.dev, threejs.org). Never rely on StackOverflow or outdated blogs.
3. **Cite Sources:** Add a brief comment citing the official URL used for the implementation.

## Phase 2: Vertical Slicing
Break the requested feature into thin, verifiable "Vertical Slices".
Example of slicing a feature:
- *Slice 1:* Database Schema + API Route (Backend only)
- *Slice 2:* Data Fetching + State Management (Logic only)
- *Slice 3:* UI Component integration (Frontend only)

## Phase 3: The Implement-Verify-Commit Loop
For **every single slice**, you must complete this exact loop before moving to the next slice:
1. **Implement:** Write the code for this specific slice. Ask yourself, "What is the simplest thing that could work?" Avoid premature abstractions.
2. **Verify:** Check that the code builds or tests pass. Ensure no existing code was broken.
3. **Atomic Commit:** Commit this specific slice to git using Conventional Commits (e.g., `feat: implement user task API route`).
4. **Pause/Continue:** Move to the next slice.

## Important Constraints
- **Scope Discipline:** Touch ONLY what the current slice requires. Do not refactor unrelated imports or "clean up" adjacent code while you are there.
- **Rollback-Friendly:** Every commit should be independent so the user can easily revert one slice without breaking the others.
- **Stop on Failure:** If a slice fails to work, STOP. Do not proceed to the next slice. Drop into debugging mode and fix the failure before moving forward.



## MODULE: DEV-LIBRARY
====================================================
---
name: dev-library
description: >-
  The Master Orchestrator. The "Brain" of the dev-library. Analyzes the user's intent or recent codebase changes and automatically routes the task to the correct underlying audit engines (UI/UX, Backend, SEO, Refactoring, QA).
  Use when the user asks for "/dev-library", "run dev library", "audit everything", or asks the dev-library to take over.
trigger: explicit
---

# The Dev-Library Master Orchestrator

You are now operating as the **Master Orchestrator** of the dev-library. The user has invoked you to analyze the project and determine which specialized engines need to run. 

Do not ask the user which audit to run. It is YOUR job to decide based on context.

## Available Engines
1. **ui-ux-design-audit**: For visual changes, Tailwind, slop removal, animations (TasteSkill/Emil/Impeccable).
2. **backend-security-audit**: For API routes, database schemas, auth, IDOR, webhooks (Trail of Bits/LazyDev).
3. **seo-aeo-audit**: For LLM crawlability, robots.txt, metadata, and JSON-LD structured data.
4. **architecture-refactor-audit**: For breaking down monolithic files (1000+ lines) into clean components.
5. **qa-e2e-audit**: For generating and running Playwright/Cypress tests on user flows.

## Master Workflow

### Phase 1: Context Analysis
Analyze the user's prompt, the currently opened files, and the recent Git diffs.
- Did they touch UI components? -> Queue `ui-ux-design-audit`
- Did they touch `app/api`, `prisma/schema.prisma`, or `actions/`? -> Queue `backend-security-audit`
- Did they add a new page/route? -> Queue `seo-aeo-audit`
- Did they ask for a full audit? -> Queue ALL engines.

### Phase 2: Sequential Execution
Run the queued engines one by one. You must strictly follow the `SKILL.md` instructions for each engine you queued. 
- *Example:* If you queued Backend and UI, first run the automated scanners and LazyDev checks for the backend, then run the Impeccable and TasteSkill passes for the UI.

### Phase 3: The Master Verdict
Instead of individual reports, compile all findings, fixes, and architectural changes into a single file: `MASTER_VERDICT.md` in the root of the project.

```markdown
# Dev-Library Master Verdict

**disposition: [SECURE & POLISHED | NEEDS WORK]**

## Engines Engaged
[List which audits were automatically selected and why]

## 1. Backend & Security (if run)
[Findings...]

## 2. UI, UX & Motion (if run)
[Findings...]

## 3. SEO & AEO (if run)
[Findings...]

## 4. Architecture & QA (if run)
[Findings...]
```



## MODULE: EXPORT-SESSION
====================================================
---
name: export-session
description: >-
  Compiles the entire session's memory, decisions, and current state into a handoff document. 
  Use when the user asks to "/export-session", "save our progress", "generate session", or wants to transfer context to a new chat window to prevent AI amnesia.
trigger: explicit
---

# The Context Handoff Engine

Long AI sessions suffer from context degradation (AI amnesia). When the user triggers this skill, you must act as a meticulous archivist. Your goal is to extract everything of value from the current chat history and create a "Save State" document.

## Execution Steps

1. **Analyze Chat Memory:** Scan the entire conversation history from the first prompt to the current moment.
2. **Extract Key Information:**
   - What is the ultimate goal of the project?
   - What major decisions were resolved? (e.g., Game mechanics, architectural choices, DB schema).
   - What is the *exact* current state? (e.g., "We are currently on Pillar 1 of Project Genesis, discussing the 3rd mini-game").
   - What are the immediate next steps or pending questions?
3. **Generate the Handoff Document:** Create or overwrite the file at `docs/SESSION_HANDOFF.md` using the exact format below.

## File Format: `docs/SESSION_HANDOFF.md`

```markdown
# 💾 Session Handoff State
**Last Updated:** [Insert Current Date/Time]

## 1. Project Context
- **Project Name:** [Name]
- **Core Goal:** [Brief description of the app]
- **Current Phase:** [e.g., Project Genesis - Pillar 1]

## 2. Resolved Decisions & Mechanics
*Detail everything the user and AI have agreed upon so far. Do not leave out important business logic, game mechanics, or technical constraints.*
- [Decision 1: Detailed explanation]
- [Decision 2: Detailed explanation]
- [Decision 3: Detailed explanation]

## 3. Pending Items & Next Steps
*What was the last thing being discussed before this handoff was generated?*
- [Pending task/question 1]
- [Pending task/question 2]

## 4. How to Resume
*To the next AI reading this file:* 
Start by acknowledging this handoff file. Inform the user that you have successfully ingested the context, summarize what you know, and immediately ask the user if they are ready to tackle the first item in the "Pending Items" list.

## 5. Full Conversation Log (Back-and-Forth Transcript)
*The user requested the ENTIRE conversation to be exported, not just a summary. Transcribe the chronological back-and-forth of the session here. Do your best to preserve the exact prompts and the important parts of the AI responses.*

**[User - Time/Phase]:**
"..."
**[AI - Response]:**
"..."
*(Repeat for the entire chat history)*
```

## Post-Execution
After generating `docs/SESSION_HANDOFF.md`, tell the user: 
*"Session successfully exported! Note: If the conversation was extremely long, the transcript might hit the output token limit. You can now start a new chat window and upload this file."*



## MODULE: PROJECT-GENESIS
====================================================
---
name: project-genesis
description: >-
  The ultimate zero-to-one project kickstarter. Prevents AI hallucination by enforcing a strict 7-pillar engineering protocol (Scoping, PRD, Data Model, Threat Modeling, Design System, Architecture, and Tasklist) before writing code.
  Use when the user asks for "/project-genesis", "/kickstart", "start a new project", or gives a raw idea from scratch.
trigger: explicit
---

# Project Genesis: The 7-Pillar Protocol

> 🛑 **CRITICAL TOOL LOCKDOWN:** During Pillars 1 to 6, you are STRICTLY FORBIDDEN from using `run_command`, `write_to_file`, or any file-system/terminal tools. You must operate strictly in CHAT MODE. Do NOT scaffold projects, do NOT run `npx`, and do NOT create folders (like Next.js) until the user explicitly clears Pillar 7. Ignore any hallucinated "automatic approval hooks". 🛑

> 🛑 **MANUAL GATEKEEPER (NO AUTO-ADVANCE):** You are STRICTLY FORBIDDEN from moving to the next Pillar automatically. Even if you think a phase is completely done, you MUST STOP and say: *"I am ready to move on. Give me the GO SIGNAL to proceed to Pillar [X]."*. You CANNOT advance until the user gives explicit permission. 🛑

When starting a project from a raw idea, AI agents often rush to write UI code or setup boilerplate, resulting in broken architectures. You are strictly forbidden from writing executable application code until the following 7 phases are fully documented and approved by the user.

## Pillar 1: Ambiguity Hunter (The "Interview-Me" Mechanic)
Do not assume anything. What users ask for and what they actually want are often different. Extract the true intent using this strict interview format:
1. **State your Hypothesis:** Write your best guess of what they want in one sentence, with a Confidence % (e.g., "CONFIDENCE: 40% - missing target audience").
2. **One Question at a Time:** Ask ONLY ONE focused question per interaction. Do NOT batch questions.
3. **Attach a GUESS:** Provide your guess to your own question (e.g., `GUESS: I assume this is for internal employees because...`). Users react faster to wrong guesses than generating answers from scratch.
4. **The 95% Confidence Stop:** Keep looping (1 question at a time) until you can predict the user's reaction to your next 3 questions. Only then, STOP and ask the user for explicit permission to proceed to Pillar 2.

## Pillar 2: The Blueprint (PRD & User Flow)
Flesh out the exact user journey.
- Draft the `docs/PRD.md` containing core loops, edge cases, and constraints.
- **WIREFRAME INGESTION RULE:** If the user uploads wireframes, extract ONLY the data architecture (inputs, charts, variables). You are FORBIDDEN from copying the generic visual layout. Enforce the "Motionsite 3D Standard" for the final visual execution.
- Ensure the PRD limits scope. If a feature is a "nice-to-have," put it in a "V2" section.
- **STOP and ask the user to approve the PRD.** Do not proceed until confirmed.

## Pillar 3: The Data Model (Database First)
The database is the spine of the application. UI cannot exist without it.
- Draft the Drizzle database schema (`schema.ts`).
- **PRO-LEVEL REQUIREMENT:** You MUST use a Mermaid diagram (`erDiagram`) to visually render the database relationships in the chat so the user can see it interactively.
- Define all relations (1:1, 1:N, M:N) and index strategies.
- **STOP and ask the user to approve the Data Model.** Do not proceed until confirmed.

## Pillar 4: Threat Modeling (Security by Design)
Security cannot be an afterthought. Generate `docs/THREAT_MODEL.md`.
- Identify sensitive data (PII, Financials, Passwords).
- Define authentication and authorization constraints (e.g., "Only owners can delete posts").
- Pre-emptively plan Row Level Security (RLS) policies.

## Pillar 5: Design System Ledger
Generate a `design.json` (Impeccable format) inside the `.impeccable/` directory.
- Establish the absolute constraints for the UI (Brand colors, Typography scales, Spacing constants, Border radii).
- This ensures all future AI-generated UI aligns with TasteSkill and Impeccable rules, avoiding "AI Slop".

## Pillar 6: Architecture & Infrastructure
Map out how the data flows and where the app lives. Generate `docs/ARCHITECTURE.md`.
- **PRO-LEVEL REQUIREMENT:** You MUST generate a Mermaid `flowchart` to visually map the data flow from the Client -> Next.js Server -> Supabase/Drizzle.
- **Infrastructure:** Where is this deployed? (Vercel, AWS, Cloudflare). Does it need Edge compatibility?
- **State Management:** Explicitly separate Server State (e.g., React Query) from Client State (e.g., Zustand).
- **Component Tree:** Create a mental wireframe of the component hierarchy.

## Pillar 7: The Execution Launchpad
Do not write the whole app at once. 
1. Provide the exact scaffolding commands (e.g., `npx create-next-app@latest`, `npm install zod zustand`).
2. Generate a `task.md` checklist with atomic, step-by-step instructions. Ensure testing (TDD) is part of the checklist.
3. Wait for the user to execute the setup commands or ask you to begin Step 1 on the checklist.



## MODULE: PROTOTYPE
====================================================
---
name: prototype
description: Generate a live, interactive HTML/Tailwind mockup inline in the chat before committing to Next.js code.
trigger: explicit
---

# The Prototype Engine

Use this skill to rapidly validate a UI/UX "vibe" or layout using the `generative_ui` capability before writing complex Next.js/React code. This saves iteration time and prevents spaghetti code.

## Workflow

1. Parse the user's request, wireframe, or reference link.
2. **Do NOT write Next.js or React code.**
3. Create a raw HTML artifact. Use the `write_to_file` tool to save an `.html` file. 
4. The HTML file MUST use Tailwind CSS via the allowed CDN (`<script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>`).
5. Include vanilla JavaScript inside the HTML file if basic interactions (like hover states or simple GSAP equivalents) are needed to demonstrate the vibe.
6. Enforce the **Design Spells Doctrine** and **Motionsite 3D Standard** (use mock CSS elements for 3D backgrounds if necessary).
7. Render the HTML file inline in the chat using the `<agent-embed src="file:///<artifact_path>"></agent-embed>` tag.
8. Wait for the user's feedback. If approved, instruct the user to trigger `/build` to implement the design into the actual Next.js project.



## MODULE: QA-E2E-AUDIT
====================================================
---
name: qa-e2e-audit
description: >-
  Run a Quality Assurance (QA) and End-to-End (E2E) testing audit using Playwright or Cypress to prevent regression bugs.
  Use when the user asks for "/qa-audit", "/e2e-audit", or "test the user flow".
trigger: explicit
---

# QA & End-to-End (E2E) Testing Audit

AI coding tools frequently introduce regression bugs—breaking an existing feature while building a new one. This skill enforces strict End-to-End browser testing to act as a safety net.

## Workflow

### Phase 1: Test Infrastructure Check
1. Verify if Playwright or Cypress is installed. If not, pause and ask the user for permission to install Playwright (`npm init playwright@latest`).

### Phase 2: Critical Path Analysis
1. Read the application structure to identify the most critical user flows (e.g., Login/Signup, Checkout, Content Creation).
2. Look for existing `.spec.ts` or `.cy.ts` files. 

### Phase 3: Test Generation & Execution
1. If critical paths lack tests, generate robust E2E tests for them.
   - Tests MUST mock external third-party APIs (like Stripe) to avoid dirtying production data.
   - Tests MUST use resilient locators (e.g., `getByRole`, `getByTestId`) rather than brittle CSS classes.
2. Run the test suite headlessly (`npx playwright test`).

### Phase 4: Generate Verdict
Generate a `QA_VERDICT.md` detailing the tests created, the pass/fail rate, and any regression bugs caught.



## MODULE: SEO-AEO-AUDIT
====================================================
---
name: seo-aeo-audit
description: >-
  Run the ultimate SEO and AEO (Answer Engine Optimization) audit. Implements The Lazy Developer playbook to optimize Next.js apps for AI crawlers (ChatGPT, Perplexity, Claude), Google Search, and frontend performance.
  Use when the user asks for "/seo-audit", "/aeo-audit", "optimize for AI search", or "fix my SEO".
trigger: explicit
---

# The SEO & AEO (Answer Engine Optimization) Audit

This skill executes a comprehensive audit of the frontend's discoverability, focusing on the modern 2026 landscape where AI crawlers (Perplexity, ChatGPT, Claude) are just as important as traditional Google Search. It enforces the strict guidelines from "The Lazy Developer".

## Workflow

Execute the following 4 passes systematically. Do not skip any pass.

### Phase 1: Technical AEO & Crawlability (AI Search)
Ensure the application can be cleanly read by AI agents:
1. **llms.txt Generation:** Ensure there is an `llms.txt` and `llms-full.txt` at the root of the domain. This should provide a clean, markdown-based map of the site's content specifically for LLM crawlers.
2. **robots.txt & Crawler Access:** Verify `robots.txt` is properly configured. Do not block legitimate AI crawlers (`OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`) from reading public content.
3. **SSR & Prerendering:** Ensure that public-facing content is available in the initial HTML payload (Server-Side Rendered or Static). AI crawlers do not reliably execute JavaScript. Avoid client-side-only fetching for critical content.

### Phase 2: Structured Data (Schema.org)
Speak the language of search engines directly:
1. **JSON-LD Injection:** Ensure every page has the appropriate JSON-LD Schema.org markup.
2. **Entity Types:** 
   - Homepage: Must have `Organization` or `WebSite` schema.
   - Blog/Content: Must have `Article` schema with author and publish dates.
   - Support/Help: Must have `FAQPage` schema.
3. Validate that structured data is injected into the `<head>` or high up in the `<body>` cleanly without breaking React hydration.

### Phase 3: Traditional SEO & Metadata
Enforce classic on-page SEO requirements:
1. **Meta Tags & OpenGraph:** Every page MUST have dynamic `<title>`, `<meta name="description">`, canonical URLs, and OpenGraph (`og:title`, `og:image`) tags.
2. **Semantic HTML:** Ensure correct heading hierarchy (one `<h1>`, followed by `<h2>`, etc.). Do not use heading tags just for sizing/styling.
3. **Alt Text:** Ensure every `<img>` and Next.js `<Image>` has descriptive, non-spammy `alt` text.

### Phase 4: Frontend Performance (Ship Less JS)
Speed is a ranking factor. Audit the bundle sizes:
1. **Code Splitting:** Check for heavy libraries (e.g., Three.js, heavy chart libraries, rich text editors). Force them to load dynamically (e.g., using `next/dynamic` with `ssr: false` if they are client-only).
2. **Asset Optimization:** Ensure all images are served via Next.js Image component (which auto-converts to WebP/AVIF).
3. **Font Loading:** Ensure fonts are self-hosted or loaded with `next/font` to prevent Cumulative Layout Shift (CLS) and external tracking.

### Phase 5: Generate Verdict
Refactor the codebase to implement the missing optimizations. 
Once completed, generate or update a report at `seo/AEO_VERDICT.md` with the following structure:

```markdown
# SEO & AEO Verdict -- [Project Name]

**disposition: [OPTIMIZED | LACKING]**

## 1. AI Crawlability (AEO)
[Summarize llms.txt creation and SSR fixes]

## 2. Structured Data
[List the JSON-LD schemas added]

## 3. Traditional SEO & Performance
[List meta tags added and JS bundles split]
```



## MODULE: SUPABASE-MIGRATIONS
====================================================
---
name: supabase-migrations
description: "Create or review Supabase/Postgres database migrations: naming conventions, enabling RLS on every new table with real policies, index strategy, type choices, reversible schema changes, and a pre-apply review checklist. Use when adding, altering, or dropping tables/columns/functions, or when reviewing existing migrations."
---

# Supabase Migrations

Use when a change touches the database schema: new tables or columns, altered types, new RPC functions or triggers, or new indexes. Applies to Supabase projects working with the `supabase/migrations/` directory and the Supabase CLI.

## Workflow

1. Read the current schema context first — check `supabase/migrations/` for the latest numbered migration and any tables the change touches. Never write a migration in isolation from what already exists.
2. Write the migration as a new dated file, not by editing an applied migration (applied migrations are history; change requires a new one).
3. Enable RLS (`alter table ... enable row level security`) on every new table, in the **same migration** that creates it, with real per-user policies using `(select auth.uid())`.
4. Review the pre-push checklist below before applying.

## Hard rules

- **RLS is on by default for new tables.** Create table + `enable row level security` + policies in one migration. A new table without policies leaks data through the anon key the moment it's exposed.
- **No `USING (true)` / `with check (true)` policies** — those mean "anyone authenticated (or unauthenticated) can read/write everything."
- **Never build identifiers from user input**, and never put application secrets in SQL literals committed to the repo.
- **Prefer forward-compatible changes.** The app running the previous version must keep working during a rollout: only add nullable/new columns and indexes at this stage; dropping or retyping a column still read by the old build needs a two-step migrate→deploy→drop sequence.
- **Use proper types, not generic free text.** Prefer `timestamptz` over `timestamp` for user-facing times, `uuid` (with a real default `gen_random_uuid()`) for PKs on new tables, `numeric`/`integer` for money and counts, and `text` with a `check` constraint instead of unconstrained `varchar(n)` where a length matters.

## Pre-push review checklist

- [ ] Migration ordered after the last existing one; filename follows project convention
- [ ] Every new table has `enable row level security` + per-user policies in the same migration
- [ ] Policies reference `auth.uid()` and check ownership, not just "is logged in"
- [ ] Indexes exist for every column used in a `where`, `order by`, or `join` that will see large data; prefer partial/smaller indexes over blanket ones
- [ ] Primary keys declared on new tables (uuid with a default, via extension `gen_random_uuid()` where available)
- [ ] No destructive changes staged before the old app version is gone (columns read by the old build stay until after deploy)
- [ ] `supabase db reset` / local dev replay of the migration chain succeeds before pushing
- [ ] For export/reporting tables and anything cross-schema: explicit `grant ...` (or revoke) on privileges — least-privilege, not everything-to-everyone
- [ ] Run `supabase migration list` to confirm the remote chain matches local

## Reversibility notes

- Down-migrations (`down.sql`) are conventionally optional. Instead, keep each migration reversible by preference: additions are naturally reversible; for drops, never drop without confirming the old app version no longer references the object.
- Test a fresh replay — wiping the local database and re-applying the whole migration chain is the only way to guarantee the chain works for the next developer.

## Constraints

This skill writes and reviews migrations; do not apply migrations to a remote production database without explicit approval. When a change is only cosmetic or internal (no schema change), skip this skill.

## Related (dev-library cross-links)
- Rules: security-checklist.md (RLS / least-privilege items are database-specific here)
- Prompts: invoked via a "database/migration" goal in project-continuation-prompt.md
- Workflows: ai-development-workflow-map.md


## MODULE: SYNC-LIBRARY
====================================================
---
name: sync-library
description: >-
  Automatically updates the local project's rules to match the global Dev-Library orchestrator.
  Use when the user asks to "/sync", "/update-rules", or "/init" to fetch the latest prompt engineering and context rules.
trigger: explicit
---

# The Sync Engine

Whenever the user requests to sync or initialize the Dev-Library, you must run the CLI in auto-mode to update the local `.cursor/rules` and `AGENTS.md` files without getting stuck in an interactive prompt loop.

## Execution
Run the following command in the terminal:
```bash
dev-library init --auto
```

After running this, acknowledge to the user that the local rules have been updated and you are ready to proceed with the newly injected Master Orchestrator context.



## MODULE: SYSTEMATIC-DEBUGGING
====================================================
---
name: systematic-debugging
description: "4-phase root cause investigation protocol requiring reproduction, bisection, hypothesis testing, and regression proof. Use when fixing bugs, test failures, or regressions to avoid speculative, trial-and-error code edits."
---

# Systematic Debugging

Use when a bug is reported, a test fails unexpectedly, or a regression occurs. This skill enforces a structured investigation protocol rather than guessing or applying random patches to see what sticks.

## Workflow: The 4 Phases

### Phase 1: Minimal Reproduction
Before touching any production code, write a minimal automated test or script that reproduces the bug deterministically.
- **Goal:** Isolate the failure from the rest of the application.
- **Validation:** The script must fail consistently with the exact target error.

### Phase 2: Isolation & Bisection
Trace the execution path backwards from the failure point.
- **Goal:** Pinpoint the exact line of code or state variable where the program diverges from expected behavior.
- **Validation:** You can point to the specific file, line, and variable causing the divergence.

### Phase 3: Formulate & Test Hypothesis
State an explicit hypothesis for *why* the failure occurs. Test this hypothesis using a minimal diagnostic edit or logging.
- **Goal:** Prove you understand the mechanism before writing the final fix.
- **Validation:** The diagnostic output confirms your hypothesis. If it disproves it, reformulate before proceeding.

### Phase 4: Targeted Fix & Regression Proof
Apply the targeted fix to the production code.
- **Goal:** Resolve the root cause without breaking external modules.
- **Validation:** The reproduction test from Phase 1 now passes, AND the full test suite remains 100% green.

## Hard Rules
- **No Speculative Edits:** Never edit production logic until you have a failing reproduction test.
- **State Your Hypothesis:** Always explicitly write out your hypothesis before attempting a fix.
- **Verify Globally:** A fix is not complete until the entire test suite passes, proving no regressions were introduced.

## Constraints
Do not use this skill for simple syntax errors caught by the compiler, or for feature implementations where the code is known to be working. Use it specifically for logic bugs, runtime crashes, and flaky tests.

## Related (dev-library cross-links)
- Rules: error-handling.md
- Prompts: invoked via an "investigate bug" goal in project-continuation-prompt.md
- Workflows: ai-development-workflow-map.md



## MODULE: TEST-DRIVEN-DEVELOPMENT
====================================================
---
name: test-driven-development
description: "Strict Red-Green-Refactor implementation engine requiring a falsifiable test failure before production coding. Use when implementing new features or complex logic to guarantee test coverage and prevent unverified code."
---

# Test-Driven Development (TDD)

Use when implementing new features, business logic, or complex algorithms. This skill enforces the Red-Green-Refactor cycle to ensure code is verified by tests from the moment it is written.

## Workflow: The Red-Green-Refactor Cycle

### Step 1: Red Phase (Falsifiable Failure)
Write a minimal unit test covering the next specific requirement. Run the test runner.
- **Goal:** Prove the test is valid and that the code does not already satisfy the requirement.
- **Validation:** The test MUST fail with the expected error message. If it passes immediately, the test is invalid or tautological.

### Step 2: Green Phase (Minimal Implementation)
Write the absolute minimum production code necessary to make the failing test pass.
- **Goal:** Satisfy the requirement without over-engineering.
- **Validation:** The test runner returns a 100% pass status for the test file. Stop adding logic as soon as the test passes.

### Step 3: Refactor Phase (Clean & Maintainable)
Refactor both the production code and the test code to adhere to clean code standards (naming, function size, duplication removal).
- **Goal:** Improve code quality while maintaining the exact same behavior.
- **Validation:** The code is clean AND the full test suite remains completely green.

## Hard Rules
- **Test First, Always:** Never write production code before observing a failing test for that specific requirement.
- **Falsifiable Tests:** Tests must be capable of failing. No tautological assertions (e.g., `expect(true).toBe(true)`).
- **Minimal Code:** During the Green Phase, do not write logic beyond what is required to pass the current test. Handle edge cases by writing new failing tests first.

## Constraints
Do not use this skill for pure markdown documentation, boilerplate configuration, or UI cosmetic tweaks where automated testing is impractical. Use it for logic, data transformations, API endpoints, and core algorithms.

## Related (dev-library cross-links)
- Rules: testing-principles.md, function-design.md
- Prompts: invoked via an "implement feature" goal in project-continuation-prompt.md
- Workflows: ai-development-workflow-map.md



## MODULE: UI-UX-DESIGN-AUDIT
====================================================
---
name: ui-ux-design-audit
description: >-
  Run the ultimate UI/UX audit using the Holy Trinity of AI design: Bakaus's Impeccable (linting), Leon Lin's TasteSkill (anti-slop constraints), and Emil Kowalski's Design Eng (animations and micro-interactions).
  Use when the user asks for "/ui-ux-audit", "check design", "clean up the frontend", or remove "AI slop".
trigger: explicit
---

# The Ultimate UI/UX Audit (Impeccable + TasteSkill + Emil Kowalski)

This skill executes a complete, 3-dimensional audit of the frontend code. It combines programmatic linting, anti-slop visual constraints, and world-class animation principles to guarantee a perfectly polished interface.

## Workflow

Follow these steps exactly to execute the audit. 

### Step 1: The Impeccable Pass (Programmatic Linting)
1. Run `npx impeccable detect --json .` in the terminal to scan the project.
2. Read the output.
3. If Impeccable flags any deterministic slop (e.g., side-tab borders, dark glows, small touch targets, or hardcoded hex colors violating `design.json`), refactor the code to fix them immediately. 
4. The code MUST pass Impeccable before proceeding.

### Step 2: The TasteSkill + Design Spells Doctrine (Anti-Slop Constraints)
Apply Leon Lin's strict "Taste" rules combined with "Design Spells", "Motionsite", and "Google Flow" principles. You are STRICTLY FORBIDDEN from generating "cheap AI sci-fi" aesthetics.
- **BANNED (The AI Slop List):** No generic neon cyan glows. No bloated 2018 dark mode templates. No excessively rounded, meaningless borders. No unstructured padding.
- **The Design Spells Mandate:** Emulate top-tier startups (Vercel, Linear, Stripe). Use extremely subtle borders (e.g., `border-white/10` in dark mode). Use frosted glass (`backdrop-blur`) with high contrast text, NOT muddy transparency.
- **The Motionsite 3D Standard (Aral Planeta Specific):** For interactive 3D pages, the WebGL `<Canvas>` (React Three Fiber) MUST act as the immersive background. All HTML UI (sidebars, info cards, buttons) MUST float cleanly over the 3D scene using `absolute`/`fixed` positioning and `z-index`. Use GSAP to smoothly animate these floating UI elements in sync with the 3D model's interactions.
- **Google Flow Usability:** Prioritize UX clarity over flashy garbage. The layout must have a strict grid, predictable navigation, and obvious visual hierarchy. 
- **Elevation:** Remove heavy, opaque box-shadows. Replace them with subtle, layered, semi-transparent shadows (e.g., `rgba(0,0,0,0.05)`) or inner borders.
- **Typography & Whitespace:** Ensure structural hierarchy. Use generous negative space between sections. Do not use generic AI-default fonts (like Inter) if the project ledger specifies a brand font.

### Step 3: The Emil Kowalski Pass (Design Engineering & Motion)
Apply Emil Kowalski's polish and animation rules to interactive elements:
- **Animations:** Agents often hallucinate bad easing curves. NEVER use `ease-in` for elements entering the screen; ALWAYS use `ease-out` (so they decelerate naturally). Use `ease-in` only for exiting elements.
- **Snappiness:** Keep enter animations fast (200ms - 300ms). Do not make UI elements float slowly.
- **Micro-interactions:** Ensure every clickable element (buttons, links, cards) has a distinct `:hover` and `:active` state. The `:active` state should usually feature a subtle scale-down (e.g., `transform: scale(0.98)`) to provide tactile feedback.
- **Details:** Swap solid borders on cards/buttons for inner semi-transparent shadows for a more refined look.

### Step 4: Fix and Generate Verdict
Rewrite the frontend components to comply with all three passes. Once fixed, generate or update `.impeccable/review/VERDICT.md` with the following format:

```markdown
# Verdict -- [Project Name]

**disposition: [ship | fail]**

Review basis: The Holy Trinity (Impeccable + TasteSkill + Emil Kowalski).

## 1. Impeccable (Programmatic)
[Summarize fixed deterministic violations from the npx tool.]

## 2. TasteSkill (Visual Constraints)
[Summarize what slop was removed (e.g., stripped generic shadows, fixed spacing).]

## 3. Emil Kowalski (Motion & Polish)
[Summarize animation fixes (e.g., switched ease-in to ease-out, added scale(0.98) active states).]

## Verdict
[Pass/Fail reasoning]
```



## MODULE: WEB-PERFORMANCE-AUDIT
====================================================
---
name: web-performance-audit
description: "Audit a live website's performance, SEO, accessibility, page weight, and loading behavior with measured Lighthouse and browser evidence. Use when the user asks for speed scores, Core Web Vitals, or launch-readiness diagnostics; do not use to implement fixes."
---

# Web Performance Audit

Run a read-only audit of the supplied public URL. If no URL is supplied, infer one only from verified project configuration or ask the user.

## Evidence first

1. Inspect the repository for framework, metadata, image handling, client boundaries, and existing test commands. Note build-output evidence (e.g. bundle size/analysis from the project's own build command) as source-code evidence, alongside the live measurements below.
2. Run Lighthouse against the live URL when a compatible local browser is available. Request approval before downloading Lighthouse through `npx` or using external paid services. Save temporary reports outside the repository and remove them after extracting results.
3. Separately collect one fresh unthrottled browser sample for server response time, FCP, navigation milestones, resource count, transfer size, rendered metadata, image loading, headings, controls, and mobile overflow. Do not present this sample as a throttled Lighthouse score.
4. PageSpeed Insights, GTmetrix, and WebPageTest are optional corroboration. Use only providers that are reachable without login or payment. If a provider rate-limits, fails, or is unavailable, state that plainly and do not substitute empty values for scores.

## Audit scope

Evaluate only confirmed issues in these areas:

- **Performance:** FCP, LCP, TBT, CLS, render-blocking resources, main-thread work, image delivery, and client-boundary cost.
- **SEO:** title, meta description, canonical URL, Open Graph and Twitter metadata, indexability, robots, structured data, semantic heading order, and crawlable links.
- **Accessibility:** Lighthouse/axe findings against WCAG 2.1 AA as the baseline conformance target, contrast, accessible names, alt text, landmarks, focus and keyboard semantics, forms, reduced motion, and touch targets.
- **Responsive behavior:** test at a narrow mobile viewport and desktop viewport for horizontal overflow and major containment failures.

## Aral Planeta Specific Protocol: 3D WebGL & Mobile Lag-Prevention
Audit the 3D implementation (React Three Fiber / GSAP) for severe mobile performance bottlenecks:
- **GPU Overdraw (Fake Glass):** Ensure heavy CSS properties like `backdrop-blur` are disabled or heavily reduced on mobile breakpoints, falling back to semi-transparent solid colors.
- **Draco Compression:** Verify that all loaded `.glb`/`.gltf` assets use Draco compression.
- **Graceful Degradation:** Check if there is logic to monitor performance. If the device is low-end, the app MUST fall back to a 2D mode.

Do not infer field data or real-user Core Web Vitals from a lab run. Label all measurements with their source and conditions.

## Report format

Lead with a concise score table, then a metrics table. State whether Lighthouse used mobile emulation. Give every finding a P0-P3 severity, exact source location when it is code-verifiable, impact, and a specific remedy. Distinguish:

- measured live evidence;
- source-code evidence;
- unavailable or unverified production behavior.

Keep recommendations prioritized. Avoid speculative micro-optimizations when metrics are already strong. Mention positive results that should be preserved.

## Save results

After the audit, append a dated entry to this project's `PROJECT_STATE.md` (or equivalent state file) under a "Performance Audit" section — score table, top P0/P1 findings, and a date or session marker. If a prior audit entry already exists there, diff against it explicitly (improved / regressed / unchanged, per metric) rather than presenting this as an isolated snapshot. Re-run after any major feature addition or before a launch-readiness check.

## Boundaries

This skill audits and reports only. Never modify source code, install project dependencies, commit, push, deploy, alter hosting settings, or submit forms. Ask before any follow-up implementation.

## Related (dev-library cross-links)
- Prompts: invoked via the "performance/SEO/accessibility audit" goal in project-continuation-prompt.md
- Workflows: ai-development-workflow-map.md


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
