# Backend Security Verdict -- Salo

**disposition: SECURE**

## 1. Automated Scan Results
- `npm audit`: 0 vulnerabilities found
- Secret scan (repo + git history): No leaked keys or tokens found
- `.env.local`: Contains `ENABLE_AUTH_BYPASS=true` + secrets; never printed, gitignored
- Convex dependencies: `convex@1.46.0`, `@convex-dev/auth@0.0.95` - no known CVEs

## 2. The Lazy Developer Fixes

### posts.ts (convex/posts.ts)
**Issue**: Inline `verifyMembership` had unconditional TEMPORARY DEV BYPASS (lines 10-37) - auto-seeded placeholder user/household/membership without any env gate. All three mutations (`list`, `create`, `remove`) called this.
**Fix**: Replaced with import from `./auth_dev_helper` which enforces `ENABLE_AUTH_BYPASS === "true"` guard and throws `Error("Auth bypass is not enabled")` when disabled. Removed 30 lines of duplicate seeding logic.

### comments.ts (convex/comments.ts)
**Issue**: `add` mutation used `verifyMembership` from `auth_dev_helper` but never validated that `args.postId` belongs to the caller's household. Cross-household comment injection possible.
**Fix**: Added post lookup + householdId comparison (lines 15-19). Throws "Post not in your household" on mismatch.

### balikbayan.ts (convex/balikbayan.ts)
**Issue**: `updateStatus` mutation had explicit comment "no strict ownership check needed" and only called `verifyMembership(ctx)` without verifying item ownership. Any authenticated household member could change any item's status across all households.
**Fix**: Added item lookup + householdId comparison (lines 50-56). Throws "Item not in your household" on mismatch. Also fixed `list` to use membership from verifyMembership (was already correct).

## 3. Architecture & DB Optimizations
- **N+1 in posts.list**: The `list` query hydrates author, reactions, comments, and comment authors per post via `Promise.all(map(...))`. Acceptable for small household feeds (<50 posts). No immediate refactor needed.
- **Index usage**: All queries use `.withIndex("by_household")` or `.withIndex("by_post")` correctly. `posts.list` uses `by_household` + `order("desc")`. `comments.add` and `balikbayan.updateStatus` do point lookups via `.get()` then compare `householdId` - no index scan.
- **Pagination**: Not yet implemented on `posts.list` or `balikbayan.list`. Acceptable for MVP (household scope limits data volume). Add cursor pagination when feed exceeds ~50 items.

## 4. Adversarial Findings

| Finding | Severity | Evidence | Resolution |
|---------|----------|----------|------------|
| Auth bypass env gate missing in posts.ts | P0 | Inline function had no `process.env` check | Fixed: imports gated helper |
| Cross-household comment injection | P0 | `comments.add` missing `householdId` check | Fixed: lines 15-19 |
| Cross-household balikbayan status change | P0 | `updateStatus` had "no ownership check needed" comment | Fixed: lines 50-56 |
| Frontend type errors blocking CI | P1 | `page.tsx` accessed non-existent `myHousehold.user`/`membership` | Fixed: use `myHousehold.members.find(...)` + `myHousehold.myRole` |
| CountdownBanner null household access | P1 | `household` possibly null after `me` check | Fixed: `if (!me || !me.household)` |
| ConvexError import missing | P1 | `ConvexError` not exported in convex@1.46.0 | Fixed: use plain `Error` with same message |

### Remaining Risks (Accepted for MVP)
1. **No rate limiting** on `posts.create`, `comments.add`, `balikbayan.add` - low blast radius (household-scoped, 2 users max)
2. **No pagination** on list endpoints - household data volume bounded by 2 users
3. **`auth_dev_helper` seeds empty household `{}`** (no name) - dev-only, production uses real auth (Slice 3)
4. **`verifyMembership` returns `{user, membership}` but `balikbayan.list` only uses `membership`** - minor over-fetch, acceptable
5. **No input sanitization on `comments.content` / `balikbayan.title`** - rendered in React (auto-escaped), no server-side HTML rendering

## 5. Type-Check Status
```
npx tsc --noEmit  →  PASS (0 errors)
```

## 6. Conclusion
All P0/P1 findings from the Lazy Developer pass and adversarial review have been resolved. The backend now enforces:
- Auth bypass gated by `ENABLE_AUTH_BYPASS === "true"` (dev only)
- Household-scoped access on all mutating endpoints (`posts.create`, `posts.remove`, `comments.add`, `balikbayan.add`, `balikbayan.updateStatus`)
- Proper error messages on cross-household attempts
- Clean type-check for CI/CD gate

**Verified savings: $0** (no production deployment yet; this is a pre-launch audit)

---
*Generated: 2026-09-21 | Auditor: Dev-Library Master Orchestrator*