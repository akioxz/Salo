# 🕸️ DEVLIB KNOWLEDGE GRAPH TEMPLATE

> **AI INSTRUCTION:** Do not deviate from this format. This file must be maintained at the root of the project as `.devlib_graph.md`. It acts as your permanent memory of the codebase architecture.

## 1. System Boundary
- **Project Name:** [Insert Name]
- **Core Tech Stack:** [e.g., Next.js, Drizzle ORM, Postgres]
- **MCP Active:** [List connected MCP servers]

## 2. Dependency Nodes (The Map)
*Format: `[Module/File] --> [Depends On] : (Description)`*

### 🎨 UI & Presentation Layer
- `[components/LoginForm.tsx]` --> `[hooks/useAuth.ts]` : (Handles UI state and submit actions)

### ⚙️ Business Logic Layer
- `[hooks/useAuth.ts]` --> `[utils/supabaseClient.ts]` : (Manages session tokens and redirects)

### 🗄️ Database & Infrastructure Layer
- `[utils/supabaseClient.ts]` --> `[MCP: Postgres]` : (Direct connection to DB via RLS)

## 3. Ghost Node Tracker
*Log any files that were recently deleted or deeply refactored here so future AI agents do not hallucinate their existence.*
- `[pages/old-login.tsx]` - DELETED on [Date]
