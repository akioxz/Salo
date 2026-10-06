---
name: mcp-orchestrator
description: "Model Context Protocol (MCP) Manager. Instructs terminal AIs on how to configure and boot external MCP servers for extended capabilities."
category: "infrastructure"
---

# MCP ORCHESTRATOR

## Phase 1: Context Sync
- Check `.vscode/settings.json`, `cline_mcp_settings.json`, or OpenCode config for existing MCP server definitions.
- Understand the environment constraints (Node.js, Python, Docker).

## Phase 2: Protocol Audit
- Determine what external context the AI needs (e.g., PostgreSQL database access, GitHub PR management, Puppeteer Web Scraping, Exa Neural Search).
- Verify if the required MCP server is already installed globally via `npx` or `pip`.

## Phase 3: Gated Execution
1. **Server Provisioning:** Write the JSON configuration block required to bind the MCP server to the current AI IDE (Cline, OpenCode, Cursor).
2. **Environment Variable Shield:** Ensure that required keys (like `GITHUB_TOKEN` or `DATABASE_URL`) are loaded securely from `.env` and NOT hardcoded in the MCP config file.
3. **Connection Test:** Execute a basic command (e.g., listing database tables) to verify the MCP handshake is successful.

## Phase 4: Auto-Checkpoint
- Log the active MCP servers and their capabilities in `.devlib_state.md`.
