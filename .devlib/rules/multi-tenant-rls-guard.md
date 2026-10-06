---
name: multi-tenant-rls-guard
description: "Enforces Row-Level Security for multi-tenant database designs."
category: "architecture"
---

# MULTI-TENANT RLS GUARDRAIL

## Directive
When designing database schemas, ORM models, or API endpoints for a SaaS application, you must treat data isolation as a critical security mandate.

## Enforcement
1. **Row-Level Security (RLS):** If writing SQL for Supabase, PostgreSQL, or similar databases, you MUST include RLS policies that restrict data access to the `auth.uid()` or the specific `tenant_id` of the user.
2. **Tenant Scoping:** In application code (e.g., Prisma, Drizzle, Eloquent), every database query reading or modifying user data MUST be scoped to the authenticated user's ID or Organization ID. 
3. **Never Trust the Client:** Do not rely on the frontend to filter out other users' data. Security must be enforced at the database or backend resolver level.
