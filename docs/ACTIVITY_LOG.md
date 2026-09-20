# 📝 Activity Log & Changelog
All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### 🟢 Session: 2026-09-20 — "Phase 2 & UI Kit Integration"

#### Added
- Migrated Database and Auth from Supabase to Convex.
- `src/app/auth/page.tsx`: Unified Auth UI.
- `src/app/pairing/page.tsx`: Household pairing logic via 128-bit hex codes.
- `salo-ui-kit`: Integrated `HouseholdActivityFeed`, `CommentsThread`, and `PhotoUploadField`.

#### Changed
- `src/app/page.tsx`: Refactored to implement route guards and render the new `HouseholdActivityFeed`.
- `CreatePostModal.tsx`: Updated to use the new drag-and-drop `PhotoUploadField`.

#### Fixed
- Fixed strict Next.js React linting rule (`react-hooks/static-components`) regarding `CategoryIcon` in the Feed component.
- Impeccable contrast warning `gray-on-color` on the `CommentsThread` component.

#### Security
- RLS logic implemented at the Convex schema level to isolate data by `householdId`.

🔴 SESSION END — Summary: Migrated to Convex, built Auth/Pairing, and seamlessly integrated a polished, anti-slop UI kit for the Feed.
