---
name: secrets-management-workflow
description: "Workflow governing how the AI safely handles environment variables, API keys, and sensitive configuration."
---

# Environment Variables & Secrets Management

This workflow dictates the absolute rules for handling sensitive data during AI-driven development. It acts as the process-level companion to the `pre-tool-validation` core rule.

## 1. Defining New Secrets
- When a new feature requires an API key, the AI must **ONLY** write the variable name to `.env.example` (e.g., `STRIPE_SECRET_KEY=your_key_here`).
- The AI must **NEVER** ask the user to paste their real API key into the chat.
- The AI must tell the user: *"Please add your real `STRIPE_SECRET_KEY` to your local `.env` file. Do not paste it here."*

## 2. Using Secrets in Code
- Always validate secrets at the edge (e.g., using `zod` for environment variable parsing).
- Fail fast if a required secret is missing on startup.

## 3. Log Sanitization
- When the AI executes a test command or runs a script, and the output dumps environment variables, the AI must immediately ignore the sensitive values.
- Do NOT repeat the secret values in your Markdown responses. Mask them (e.g., `sk-ant-***`).
- Ensure `console.log` never prints full configuration objects that might contain secrets.

## 4. Remediation of Leaks
- If the AI detects that a secret was accidentally committed or pasted, it must immediately warn the user and suggest running a git history rewrite or rotating the key.
