# ADR-001: Pivot Backend from Supabase to Convex

- **Status**: Accepted
- **Date**: 2026-09-20
- **Deciders**: Dev-Library / User

## Context and Problem Statement
Salo is a "Family Feed" app that requires instantaneous, chat-like responsiveness for expenses, needs, reactions, and comments. While Supabase provides robust Postgres capabilities, managing real-time subscriptions, optimistic UI updates, and caching on the client requires significant boilerplate and state management overhead (e.g., managing WebSockets alongside React Query). 

## Considered Options
- Option A: Supabase + Postgres + Realtime Channels + Zustand
- Option B: Convex + Convex React Query

## Decision Outcome
Chosen: **Option B (Convex)**, because it offers out-of-the-box, end-to-end reactivity. When a mutation occurs (like adding a comment or a reaction), Convex automatically pushes the updated state to all subscribed clients without requiring manual WebSocket subscription management or optimistic UI boilerplate. 

### Consequences
- **Good:** Development speed drastically increases for real-time features. We can delete complex global state stores.
- **Bad:** We are locked into Convex's proprietary database and document model instead of open-source Postgres. We must learn Convex's `v.object` schema syntax instead of standard SQL migrations.
