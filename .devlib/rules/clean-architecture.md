---
name: clean-architecture
description: "1. **The Dependency Rule:** Source code dependencies point strictly inward toward higher-level policies. Inner layers know nothing about outer laye..."
---
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
