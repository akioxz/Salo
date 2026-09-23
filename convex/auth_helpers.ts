// convex/auth_helpers.ts
// Centralized, secure authentication helpers for all Convex mutations/queries.
// Replaces the insecure auth_dev_helper.ts bypass.

import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;

/**
 * Get the currently authenticated user document.
 * Returns null if not authenticated.
 */
export async function getSessionUser(ctx: Ctx): Promise<Doc<"users"> | null> {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) return null;
  return await ctx.db.get(authUserId);
}

/**
 * Get the authenticated user or throw.
 * Use in mutations that require authentication.
 */
export async function requireUser(ctx: Ctx): Promise<Doc<"users">> {
  const user = await getSessionUser(ctx);
  if (!user) {
    throw new Error("Not authenticated.");
  }
  return user;
}

/**
 * Get the authenticated user AND their household membership, or throw.
 * Use in mutations/queries that require both auth and household membership.
 */
export async function requireMembership(ctx: Ctx): Promise<{
  user: Doc<"users">;
  membership: Doc<"householdMembers">;
}> {
  const user = await requireUser(ctx);

  const membership = await ctx.db
    .query("householdMembers")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .unique();

  if (!membership) {
    throw new Error("You do not belong to a household.");
  }

  return { user, membership };
}
