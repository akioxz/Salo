---
name: nextjs-app-router-strict
description: "Strict Next.js 14+ App Router guidelines. Enforces React Server Components (RSC) by default, standardizes data fetching, bans old pages directory patterns, and optimizes Tailwind integration."
trigger: model_decision
---

# Next.js App Router Strict Standards

This rule applies automatically whenever you are working on a Next.js project using the `app/` router.

## 1. Server Components by Default
- **RSC First:** All components are React Server Components by default. Never add `'use client'` at the top of a file unless it absolutely requires browser APIs, React state (`useState`), lifecycle hooks (`useEffect`), or event listeners (`onClick`).
- **Leaf Nodes Only:** Push `'use client'` down the component tree as far as possible. Do not wrap entire pages or layouts in client components.
- **Interleaving:** If a client component needs server-rendered children, pass them via the `children` prop.

## 2. Data Fetching and Mutations
- **Server Fetching:** Fetch data directly in Server Components using `await`. Do not use `useEffect` or `useQuery` for initial data fetching unless doing client-side polling.
- **Server Actions:** Use Server Actions (`'use server'`) for all form submissions and database mutations. Do not write custom API routes (`route.ts`) just to handle form data.
- **Cache Control:** Be explicit about caching. Use `unstable_cache` or `fetch` options (`revalidate`, `cache: 'no-store'`) rather than relying on global defaults, which change across Next.js versions.

## 3. Architecture & Routing
- **Directory Structure:** Colocate components, tests, and styles alongside their specific routes when possible, or inside a clean `@/components` alias folder. 
- **Route Handlers:** Use `app/api/.../route.ts` only for external webhooks, OAuth callbacks, or third-party integrations. Internal app logic should use Server Actions instead.
- **No `pages/`:** Absolutely no usage of `getServerSideProps`, `getStaticProps`, or the `pages/` directory pattern.

## 4. UI & Styling (Tailwind)
- **Utility First:** Use Tailwind CSS exclusively for styling. Do not write custom CSS files or use styled-components unless specifically requested.
- **Merge Safely:** Use `twMerge` and `clsx` (or `cn` utility) when combining Tailwind classes via props to prevent specificity clashes.
- **Next/Image & Next/Link:** Always use `<Image>` for local and remote images (with configured domains). Always use `<Link>` for internal navigation instead of raw `<a>` tags to enable prefetching.

## 5. State Management
- **URL State:** Prefer the URL (query parameters) for shareable state (search, filters, pagination) using `useSearchParams` rather than `useState`. 
- **Server State:** Let React Server Components handle database state. Use Zustand or React Context strictly for complex client-side interactivity (like audio players or deep multi-step wizards).
