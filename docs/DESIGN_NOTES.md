# 🎨 Design Notes — Code Patterns & Structure

## 1. Frontend Architecture
- **Component Pattern:** Next.js App Router. Client components used for interactivity (`"use client"`), especially for Convex hooks.
- **Styling Approach:** Tailwind CSS + custom UI Kit. Strict adherence to anti-slop rules (TasteSkill).
- **State Management:** Convex React Query for remote state. React `useState` for local ephemeral state.

## 2. Key UI Templates & Patterns
- **Colors:** Warm, personal vibe. Uses `zinc` for grays, `amber` for primary accents, and `sky` specifically for the OFW role. Avoids generic blue/purple corporate gradients.
- **Shadows:** No generic `shadow-sm`. We use subtle RGBA layers (`shadow-[0_4px_20px_rgba(0,0,0,0.05)]`).
- **Animations:** Strict adherence to Emil Kowalski rules. Enter animations use `ease-out`. Buttons implement tactile `active:scale-[0.98]`.

## 3. Backend Architecture
- **API Pattern:** Convex Mutations and Queries.
- **Database Access:** Convex Database with schema validation (`v.object`).
- **Auth Flow:** `@convex-dev/auth` for seamless authentication tightly integrated with the database.

## 4. Design Patterns In Use
- **Route Guarding:** Centralized in `page.tsx` utilizing `useConvexAuth` and `api.households.getMine` to enforce household membership before rendering the feed.

## 5. Component Registry
| Component | Path | Status | Description |
|---|---|---|---|
| HouseholdActivityFeed | `src/components/feed/HouseholdActivityFeed.tsx` | ✅ Done | Main Feed UI mapped to Convex data |
| CommentsThread | `src/components/feed/CommentsThread.tsx` | ✅ Done | Inline comment system |
| PhotoUploadField | `src/components/post/PhotoUploadField.tsx` | 🚧 WIP | Drag and drop file input for Convex Storage |
| CreatePostModal | `src/components/CreatePostModal.tsx` | 🚧 WIP | Modal integrating the photo upload and post submission |
