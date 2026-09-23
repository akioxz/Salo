// convex/households.ts
// Household pairing RPCs — translated from Supabase SECURITY DEFINER functions
// Ref: docs/archive/schema.sql sections 6-7
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Helper to reliably get the authenticated user doc across Convex Auth providers */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSessionUser(ctx: any) {
  const authUserId = await getAuthUserId(ctx);
  if (authUserId) {
    const user = await ctx.db.get(authUserId);
    if (user) return user;
  }
  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    const user = await ctx.db
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .query("users")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .withIndex("by_token", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (user) return user;
  }
  return null;
}

/** Create a new household. The caller becomes the first member. */
export const create = mutation({
  args: {
    role: v.union(v.literal("family"), v.literal("ofw")),
  },
  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx);

    if (!user) {
      throw new Error("Not authenticated.");
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

/** Look up household preview info by invite code for the /join page */
export const getByInviteCode = query({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.inviteCode) return null;

    const household = await ctx.db
      .query("households")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!household || !household.inviteExpiresAt || household.inviteExpiresAt < Date.now()) {
      return null;
    }

    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    let inviterName = "Kapamilya";
    let inviterRole: "ofw" | "family" = "ofw";

    if (members[0]) {
      const inviterUser = await ctx.db.get(members[0].userId);
      inviterName = inviterUser?.name || "Kapamilya";
      inviterRole = members[0].role;
    }

    return {
      householdId: household._id,
      inviterName,
      inviterRole,
      isFull: members.length >= 2,
    };
  },
});

/** Join an existing household using an invite code. */
export const join = mutation({
  args: {
    inviteCode: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    if (args.name && args.name.trim() && !user.name) {
      await ctx.db.patch(user._id, { name: args.name.trim() });
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
    const user = await getSessionUser(ctx);
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

import { requireMembership } from "./auth_helpers";

export const setVisitDate = mutation({
  args: {
    nextVisitDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireMembership(ctx);

    // Only OFW can set the date
    if (membership.role !== "ofw") {
      throw new Error("Only the OFW can set the visit date");
    }

    // Validate date if provided
    if (args.nextVisitDate !== undefined) {
      if (!Number.isFinite(args.nextVisitDate) || args.nextVisitDate < 0) {
        throw new Error("Invalid date value.");
      }
    }

    await ctx.db.patch(membership.householdId, {
      nextVisitDate: args.nextVisitDate,
    });
  },
});

export const leaveHousehold = mutation({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireMembership(ctx);

    // Delete the membership record so the household has a free slot again.
    await ctx.db.delete(membership._id);
  },
});
