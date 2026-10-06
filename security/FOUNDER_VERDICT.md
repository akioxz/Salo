# Founder & Business Audit Report -- Salo

## Executive Summary
- **Business Health Score:** 65%
- **Primary Risk Factor:** LEGAL LIABILITY & APP STORE REJECTION
- **Launch Readiness Verdict:** BLOCKED - CRITICAL VULNERABILITIES FOUND

---

### 1. LEGAL & COMPLIANCE RISKS
- **Finding:** Missing Account Deletion Parity. There is no self-service way for users to delete their accounts and wipe their PII.
- **File:** `src/components/ProfileModal.tsx`
- **Violation:** Apple App Store Guideline 5.1.1(v) & GDPR Art. 17. The app will be strictly rejected during Apple App Review.
- **Actionable Fix:** Implement a destructive action in `ProfileModal.tsx` that calls a Convex mutation to wipe user records from `users`, `householdMembers`, and all authored posts, then invalidates the auth token.

- **Finding:** Missing Apple Sign-In Parity.
- **File:** `src/app/welcome/page.tsx:167`
- **Violation:** Apple App Store Guideline 4.8. If Google Login is offered on an iOS/PWA build, Apple Login must be present.
- **Actionable Fix:** Add `@convex-dev/auth` Apple provider and mount the Apple SSO button in `WelcomePage`.

---

### 2. REVENUE & MONETIZATION LEAKS
- **Finding:** N/A (Currently no Stripe integration or monetization gates).
- **Revenue Impact:** $0. Core product relies on viral loops rather than premium paywalls at this stage.

---

### 3. GROWTH, RETENTION & TTV BOTTLENECKS
- **Finding:** Un-optimized Viral Hooks (Partially Fixed). The `layout.tsx` was missing OpenGraph and Twitter cards, which means shared invite links (`/join?code=...`) would display poorly in Messenger/WhatsApp (the primary channels for OFWs). I have injected `og:image` and `twitter:card` metadata to boost CTR.
- **File:** `src/app/layout.tsx:43`
- **Friction Factor:** Low CTR on WhatsApp/Viber invites if previews are missing.
- **Actionable Fix:** Implement dynamic OG Image generation for `/join?code=X` so the preview shows the inviter's name and family title (e.g. "Nanay Lita is inviting you to Salo!").

- **Finding:** Blank Slate Drop-Off.
- **File:** `src/app/page.tsx:150`
- **Friction Factor:** "No posts yet" is a dead end. TTV (Time to Value) is low when users don't know what to post first.
- **Actionable Fix:** Replace the empty state with interactive 1-click starter templates (e.g., "Post your first padala", "Add this week's grocery budget").

---

### 4. FOUNDER'S ACTION PLAN
Prioritized 3-step immediate roadmap for the founder:
1. **P0 (Immediate Blockers):** Implement GDPR-compliant Account Deletion in `ProfileModal.tsx` and integrate Apple Sign-In to survive Apple App Store Review.
2. **P1 (Revenue Hardening):** Integrate Sentry or Highlight to track production crashes on hostile 3G networks (common in target demographics).
3. **P2 (Growth Optimizations):** Set up `vercel/og` to dynamically generate personalized invite banners for the `/join` link to supercharge the viral loop.
