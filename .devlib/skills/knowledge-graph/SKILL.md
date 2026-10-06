---
name: knowledge-graph
description: "DevLib Polyglot Knowledge Graph rule. Maps codebase architecture deterministically without burning tokens on blind reading."
category: "architecture"
---

# POLYGLOT KNOWLEDGE GRAPH

## Phase 1: Context Sync
- Locate or create `.devlib_graph.md` in the project root.
- Read the current state of the architecture map to understand component dependencies.

## Phase 2: Graph Audit
- Identify missing connections. When reviewing a massive project (100+ files), DO NOT read every file. Instead, parse the imports and exports of the specific module you are touching.
- Ensure the graph separates the layers: UI, Business Logic, and Database/API.

## Phase 3: Gated Execution
1. **Node Mapping:** Whenever you create a new file or component, you MUST add it as a "Node" in `.devlib_graph.md`.
2. **Edge Definition:** Clearly state what other files depend on this Node. (e.g., `[AuthContext.tsx] --> relies on --> [supabaseClient.ts]`).
3. **Pruning:** If you delete or refactor a file, update the graph to prevent "Ghost Dependencies" or AI hallucination in future sessions.

## Phase 4: Auto-Checkpoint
- Save `.devlib_graph.md` before ending the turn.
