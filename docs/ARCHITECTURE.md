# Pillar 6: Architecture & Infrastructure (Salo V2)

**Date:** 2026-09-21
**Status:** Accepted

## 1. Infrastructure Deployment
- **Frontend / Fullstack Host:** Vercel (Next.js 14 App Router)
- **Database & Backend logic:** Convex (Real-time sync, Serverless functions, File Storage)
- **Authentication:** Convex Auth (Password provider)
- **Domain:** Custom domain (TBD), edge-optimized.

## 2. State Management Strategy
- **Server State (Convex):** 
  - All household data (posts, reactions, comments) lives in Convex and is synced to the client via `useQuery()`. This guarantees real-time updates across the globe (e.g., OFW sees the receipt immediately).
- **Client State (React useState / URL Params):**
  - UI toggles (e.g., opening the Create Post modal, toggling the comments thread, image lightbox state) are handled by local React state.
  - No global client state library (like Zustand/Redux) is needed yet because Convex handles the heavy lifting of caching and real-time syncing.

## 3. Component Tree (V2 Updates)
```text
Home Page (`page.tsx`)
 ├── TopBar
 │    └── NextVisitCountdown (NEW)
 ├── HouseholdActivityFeed
 │    ├── WeeklyKwentoRecap (NEW)
 │    └── PostCard
 │         ├── UserAvatar & Timestamp
 │         ├── PostContent
 │         ├── LinkedNeedBadge (NEW - "Covered!")
 │         ├── ReactionPicker (UPDATED - custom vocab)
 │         └── CommentsThread
 └── CreatePostModal (FAB)
      ├── Needs/Expense/Padala Toggle
      └── FileUpload
```

## 4. Edge Cases & Performance
- **Image Optimization:** Rely on Next.js `<Image>` component for external URLs (if using a CDN) or standard `<img>` tags for Convex storage IDs (fetching the URL directly).
- **Optimistic UI:** Convex mutations are automatically optimistic on the client. `handleReact` feels instant.
