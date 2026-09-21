# Pillar 4: Threat Model (Salo V2)

**Date:** 2026-09-21
**Status:** Accepted

## 1. Sensitive Data Inventory

| Data Type | Sensitivity | Location |
|---|---|---|
| Email + Password | HIGH (PII + Auth) | Convex `users` table, hashed by `@convex-dev/auth` |
| Household membership | MEDIUM | `householdMembers` table |
| Financial amounts (Padala, Expenses) | HIGH (Financial PII) | `posts.amount` field |
| Receipt photos | MEDIUM (may contain PII like names, addresses) | Convex `_storage` |
| `nextVisitDate` | LOW-MEDIUM (travel schedule = physical security risk if leaked) | `households` table |
| Invite codes | MEDIUM (allows joining a household) | `households.inviteCode` |

## 2. Authentication & Authorization

### Current State (V1 — Dev Bypass)
- Auth is **temporarily bypassed** via `convex/auth_dev_helper.ts` for local testing.
- The real auth system (`@convex-dev/auth` with Password provider) is fully wired but disabled in `page.tsx`.

### Required for Production (V2 Ship)
- [ ] **Re-enable `verifyMembership`** in `posts.ts`, `comments.ts`, and `reactions.ts` to use real `ctx.auth.getUserIdentity()`.
- [ ] **Delete `convex/auth_dev_helper.ts`** entirely before any deploy.
- [ ] **Enforce Household Isolation:** Every query and mutation must verify that the authenticated user belongs to the same `householdId` as the resource they are accessing. A user in Household A must NEVER see posts from Household B.

## 3. Authorization Rules (Who Can Do What)

| Action | Who | Rule |
|---|---|---|
| Create post (expense/need/padala) | Any household member | Must belong to the household |
| Link an Expense to a Need ("Covered!") | Any household member | Both posts must belong to the same household |
| Set `nextVisitDate` | OFW role only | `membership.role === "ofw"` |
| React to a post | Any household member | Must belong to the same household |
| Comment on a post | Any household member | Must belong to the same household |
| Delete a post | Author only | `post.authorId === user._id` |
| Generate/redeem invite code | Existing member only | Household must have < 2 members |

## 4. Threat Scenarios

### T1: Invite Code Brute Force
- **Risk:** An attacker guesses invite codes to join random households.
- **Mitigation:** Invite codes must be cryptographically random (min 8 chars, alphanumeric). Codes expire after `inviteExpiresAt`. Rate-limit redemption attempts.

### T2: Cross-Household Data Leak
- **Risk:** A malicious user crafts a direct API call to `api.posts.list` with a different `householdId`.
- **Mitigation:** The `list` query must ALWAYS derive `householdId` from the authenticated user's membership, never from client-supplied arguments.

### T3: Receipt Photo Exfiltration
- **Risk:** Convex `_storage` URLs are signed but could be shared.
- **Mitigation:** Storage URLs are short-lived by default in Convex. Ensure `getUrl()` is only called inside authenticated queries.

### T4: Dev Bypass Left in Production
- **Risk:** `auth_dev_helper.ts` is accidentally deployed, giving unauthenticated users full write access.
- **Mitigation:** Add a CI check or pre-deploy script that fails if `auth_dev_helper` is imported anywhere. Document in deployment checklist.

## 5. Data Privacy (GDPR / Philippine Data Privacy Act)
- Users must be able to request deletion of their data (posts, comments, reactions, photos).
- Receipt photos should not be retained after account deletion.
- No analytics or tracking SDKs should be added without explicit consent.
