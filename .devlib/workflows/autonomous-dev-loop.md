---
name: autonomous-dev-loop
description: "The master orchestration loop tying together MCP, Knowledge Graph, and Agent Guard."
---

# 🔄 WORKFLOW: AUTONOMOUS DEV LOOP

This workflow defines the lifecycle of how terminal AIs (Cline, OpenCode, Claude Code) must execute features under the DevLib OS.

## STAGE 1: Environmental Bind (MCP & Context)
- AI boots up and reads `DEVLIB_BOOTSTRAP.md`.
- AI checks `cline_mcp_settings.json` or `.vscode/settings.json` to ensure required MCP servers (e.g., PostgreSQL, Puppeteer) are running.
- AI parses `.devlib_graph.md` to map the current architecture into its immediate context.

## STAGE 2: Targeted Implementation (Write)
- AI isolates the exact nodes (files) in the Knowledge Graph that need modification.
- AI executes the code changes, applying Domain Skills (e.g., `frontend-design-architect.md` or `api-architecture-standards.md`).

## STAGE 3: Zero-Trust Shield (Test)
- AI triggers the test runner (`npm run test`, `pytest`, etc.).
- If failure -> Re-route to Stage 2.
- If pass -> Proceed to Stage 4.

## STAGE 4: Graph Mutation (Save)
- AI updates `.devlib_graph.md` with new dependencies or pruned ghost nodes.
- AI updates `.devlib_state.md` with the completed task.
- AI executes the gated commit.
