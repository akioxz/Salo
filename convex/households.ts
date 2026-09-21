// convex/households.ts
// Household pairing RPCs — translated from Supabase SECURITY DEFINER functions
// Ref: docs/archive/schema.sql sections 6-7
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Create a new household. The caller becomes the first member. */
export const create = mutation({
  args: {
    role: v.union(v.literal("family"), v.literal("ofw")),
  },
  handler: async (ctx, args) => {
    // For now, use a simple identity check.
    // Auth integration will replace this in Slice 3.
    const identity = await ctx.auth.getUserIdentity();

    // Look up user by identity, or create one for development
    let user;
    if (identity) {
      user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier),
        )
        .unique();
    }

    // Dev-only: if no auth, use a placeholder user for testing
    if (!user) {
      throw new Error("Not authenticated. Auth will be configured in Slice 3.");
    }

    // Check: user must not already belong to a household
    const existingMembership = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existingMembership) {
      throw new Error("You already belong to a household");
    }

    // 128-bit hex invite code (crypto.randomUUID is available in Convex runtime)
    const inviteCode = crypto.randomUUID().replace(/-/g, "");
    const inviteExpiresAt = Date.now() + 48 * 60 * 60 * 1000; // 48 hours

    const householdId = await ctx.db.insert("households", {
      inviteCode,
      inviteExpiresAt,
    });

    await ctx.db.insert("householdMembers", {
      householdId,
      userId: user._id,
      role: args.role,
    });

    return { householdId, inviteCode, inviteExpiresAt };
  },
});

/** Join an existing household using an invite code. */
export const join = mutation({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check: user must not already belong to a household
    const existingMembership = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existingMembership) {
      throw new Error("You already belong to a household");
    }

    // Find the household by invite code
    const household = await ctx.db
      .query("households")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!household || !household.inviteExpiresAt) {
      throw new Error("Invalid or expired invite code");
    }

    if (household.inviteExpiresAt < Date.now()) {
      throw new Error("Invite code has expired");
    }

    // Check: household must have fewer than 2 members
    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    if (members.length >= 2) {
      throw new Error("Household is already full");
    }

    // Assign the opposite role
    const existingRole = members[0]?.role;
    const newRole = existingRole === "family" ? "ofw" : "family";

    await ctx.db.insert("householdMembers", {
      householdId: household._id,
      userId: user._id,
      role: newRole,
    });

    // Single-use: nullify the invite code
    await ctx.db.patch(household._id, {
      inviteCode: undefined,
      inviteExpiresAt: undefined,
    });

    return { householdId: household._id, role: newRole };
  },
});

/** Get the current user's household and partner info. */
export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return null;

    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!membership) return null;

    const household = await ctx.db.get(membership.householdId);

    // Get all members of this household
    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) =>
        q.eq("householdId", membership.householdId),
      )
      .collect();

    // Resolve user names for each member
    const memberDetails = await Promise.all(
      members.map(async (m) => {
        const memberUser = await ctx.db.get(m.userId);
        return {
          userId: m.userId,
          role: m.role,
          name: memberUser?.name ?? memberUser?.email ?? "Unknown",
        };
      }),
    );

    return {
      household,
      myRole: membership.role,
      members: memberDetails,
    };
  },
});

import { verifyMembership } from "./auth_dev_helper";

export const setVisitDate = mutation({
  args: {
    nextVisitDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { membership } = await verifyMembership(ctx);

    // Only OFW can set the date
    if (membership.role !== "ofw") {
      throw new Error("Only the OFW can set the visit date");
    }

    await ctx.db.patch(membership.householdId, {
      nextVisitDate: args.nextVisitDate,
    });
  },
});

