---
name: api-architecture-standards
description: "Strict REST/GraphQL API design enforcement, focusing on idempotency, RESTful nouns, and proper HTTP status codes."
category: "backend"
---

# API ARCHITECTURE STANDARDS

## Phase 1: Context Sync
- Read `SCHEMA.md` or `.devlib_state.md` to understand the data models and existing API routes.

## Phase 2: Architecture Audit
- Ensure URLs use **Nouns, not Verbs** (e.g., `POST /users`, not `POST /createUser`).
- Verify **Idempotency** for `PUT`, `DELETE`, and financial `POST` requests.
- Plan pagination (Cursor-based preferred over Offset-based) and rate-limiting.

## Phase 3: Gated Execution
1. **Status Codes:** Enforce strict HTTP code usage (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict).
2. **Payload Structure:** Wrap responses in a standardized JSON envelope (e.g., `{ "data": {}, "meta": {} }`).
3. **Security:** Ensure Row-Level Security (RLS) and token validation logic is mapped out.

## Phase 4: Auto-Checkpoint
- Log the newly created endpoints and their data contracts in `.devlib_state.md`.
