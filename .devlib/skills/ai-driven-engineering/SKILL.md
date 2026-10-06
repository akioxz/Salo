---
name: ai-driven-engineering
description: "Master workflow for building agentic applications, LLM routing, and context management."
category: "ai"
---

# AI-DRIVEN ENGINEERING

## Phase 1: Context Sync
- Analyze the user's token budget and target LLM models (e.g., Claude 3.5, GPT-4o, Llama).

## Phase 2: System Audit
- Evaluate the architecture for **Context Amnesia** risks. 
- Ensure RAG (Retrieval-Augmented Generation) pipelines use appropriate chunking and vector search strategies.
- Verify that system prompts are isolated from user inputs to prevent Prompt Injection (OWASP LLM01).

## Phase 3: Gated Execution
1. **Model Routing:** Assign complex reasoning to heavy models, and basic formatting to fast/cheap models.
2. **Context Pinning:** Use targeted file references (`@file`) instead of dumping entire codebases into the prompt.
3. **Output Forcing:** Implement `<think>` blocks for Chain-of-Thought reasoning and XML tags for structured parsing.

## Phase 4: Auto-Checkpoint
- Save the orchestration flow and agent definitions to `.devlib_state.md`.
