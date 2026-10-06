---
name: few-shot-examples-standard
description: "Mandates the inclusion of concrete input/output examples in skills."
category: "ai-behavior"
---

# FEW-SHOT EXAMPLES STANDARD

## Directive
LLMs follow patterns better than instructions. When creating or upgrading a `SKILL.md` file in the DevLib, you must provide concrete examples of the desired output.

## Enforcement
1. **Example Blocks Required:** Every skill that transforms code, writes copy, or generates architecture MUST contain an `### Examples` section.
2. **Format:** Use explicit `Input:` and `Expected Output:` blocks.
3. **Zero-Ambiguity:** The examples must clearly demonstrate the edge cases and the exact formatting (e.g., JSON structure, Markdown layout) the skill is meant to enforce. Never assume the AI will "just figure out" the format.
