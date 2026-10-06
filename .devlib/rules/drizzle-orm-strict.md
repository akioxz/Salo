---
name: drizzle-orm-strict
description: Strict guidelines for using Drizzle ORM in Next.js and modern JS environments. Enforces schema separation, drizzle-kit usage, and performant querying.
trigger: model_decision
---

# Rule: Strict Drizzle ORM Guidelines

> **Purpose:** Enforces performant, secure, and type-safe database access using Drizzle ORM. Applies automatically when Drizzle ORM is detected in the tech stack.

## 1. Schema Definition (`schema.ts`)
- **Single Source of Truth:** Define all database tables, enums, and relations in a centralized `schema.ts` file (or `schema/` directory if massive).
- **Naming Conventions:** Use camelCase for TypeScript variables (e.g., `usersTable`), but snake_case for the actual database table names (e.g., `pgTable('users', {...})`).
- **Timestamps:** Always include `createdAt` (default to `now()`) and `updatedAt` columns on core business tables.

## 2. Queries and Performance
- **Relational vs Core API:** 
  - Use Drizzle's Relational API (`db.query.tableName.findMany()`) for heavily nested graphs (it solves N+1 out of the box).
  - Use the Core SQL-like API (`db.select().from().leftJoin()`) when you need maximum performance, complex aggregations, or specific SQL functions.
- **Client/Server Boundary:** Never leak the database instance to client components (`"use client"`). All Drizzle queries must execute inside Next.js Server Components, Server Actions, or Route Handlers.

## 3. Migrations & Drizzle Kit
- Use `drizzle-kit generate` to create SQL migration files. 
- Use `drizzle-kit push` ONLY for local rapid prototyping. Do not use `push` in production pipelines.
- Store migration files in the `drizzle/` directory.

## 4. Edge Compatibility
- If deploying to Vercel Edge or Cloudflare Workers, ensure you import the specific edge-compatible database driver (e.g., `@neondatabase/serverless` or `@vercel/postgres`).
