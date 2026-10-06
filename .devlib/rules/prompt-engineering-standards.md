---
name: prompt-engineering-standards
description: "Strict guidelines for prompt architecture, the 9-dimension intent matrix, and anti-pattern avoidance for writing rules and system instructions."
trigger: model_decision
---

# Dev-Library Rule Extensions: Prompt Engineering & Agent Specs

## 1. Prompt Architecture Guidelines
- **No Placeholders Ever**: Prompts must be ready to execute. Either bake the user's content directly into the prompt (if provided) or instruct the AI to prompt the user for the missing inputs (e.g., "Before you draft, ask me for X and Y").
- **Literal Scope & Specificity**: State exact boundaries for instructions. Do not assume the model will generalize. Use phrases like "for each one, without skipping any" or "apply this to the entire contract, not just the first section."
- **Explicit Length & Structure**: The model calibrates length based on perceived complexity. Explicitly define targets ("in about 200 words", "a thorough multi-section analysis"). Use positive framing ("write in flowing prose") over negative ("don't use bullets").
- **XML Tagging for Complexity**: For multi-part prompts, enclose distinct sections in descriptive XML tags (`<instructions>`, `<context>`, `<examples>`, `<input>`). Place long inputs at the top and the actual task/question at the bottom.
- **Explain the "Why"**: Providing a rationale for a constraint ("avoid ellipses because the TTS engine mispronounces them") significantly improves compliance.
- **Adaptive Thinking Trigger**: When prompting the chat app, always end with the exact line: `Think carefully before answering, using deep multi-step reasoning.` This enables adaptive thinking which is otherwise off by default.

## 2. 9-Dimension Intent Matrix Nuances
Every agent skill/router must define its intent across these 9 dimensions to prevent hallucination and ensure deterministic task execution:
1. **Task**: The core objective (e.g., structure a brain dump).
2. **Target Tool**: The supported runtime environments (e.g., Cursor, Claude Code, Cline, Raw API).
3. **Output Format**: The strict shape of the response (e.g., structured readback, fenced code block).
4. **Constraints**: Hard limits and behavioral guardrails (e.g., "Max 3 open questions", "Never execute a dump directly").
5. **Input**: Expected user input triggers.
6. **Context**: Why this task exists and what anti-patterns it prevents.
7. **Audience**: Who consumes the result.
8. **Success Criteria**: Definitive verification that the task succeeded.
9. **Examples**: Concrete input/output mappings.

## 3. Anti-Patterns in Prompting & Writing
- **The Brain Dump Trap**: Executing on stream-of-consciousness requests (AP-1, AP-2). *Fix*: Extract Goal, Deliverables, Context, and Constraints before acting. Resolve contradictions by recency (AP-29) and park irrelevant details (AP-11).
- **No Human Review on High Stakes (AP-45)**: Auto-executing destructive or highly conflicting requests. *Fix*: Use a "Confirm Mode" readback to halt for approval.
- **Negative Parallelism / Reframe Ban**: Writing "This isn't X. This is Y" or "Not X, but Y." *Fix*: Delete the rejected frame and state the positive claim directly.
- **Copulative Avoidance**: Bloated verbs to dodge "is" or "has" (e.g., "serves as", "boasts a"). *Fix*: Use plain verbs ("is", "has", "uses").
- **Analogy & Metaphor Bloat**: Explaining ordinary ideas with "roadmap", "engine", "compass", or using verbs like "bolted on", "sanded down". *Fix*: Be literal.
- **AI Vocabulary Tells**: Overusing words like delve, realm, harness, paradigm, unlock, meticulously. *Fix*: Strip these terms completely.

## 4. The Prompt Auditor Suite Pipeline
A repeatable 9-step system to turn messy ideas into consistent, reusable prompts:
1. **Prompt Master**: Turns brain dumps into clean task specs.
2. **Grill Me**: Interrogates the user to eliminate vagueness.
3. **How To**: Maps out unknown steps.
4. **Optimizer 4.8**: Polishes the prompt for Opus 4.8 (explicit constraints, XML tags, thinking trigger).
5. **Fable Prompter**: Optimizes the prompt for Fable 5.
6. **Personal Voice**: Tunes the prompt's output to match the user's specific tone.
7. **Anti-AI**: Strips AI tells, bloat, and robotic patterns from the generated text.
8. **Write a Skill**: Bottles the optimized prompt as a reusable markdown skill.
9. **Handoff**: Creates a session document to seamlessly continue work in the next chat.
