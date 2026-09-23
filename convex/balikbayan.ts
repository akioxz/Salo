// convex/balikbayan.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getSessionUser, requireMembership } from "./auth_helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);
    if (!user) return [];

    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!membership) return [];

    const items = await ctx.db
      .query("balikbayanBox")
      .withIndex("by_household", (q) => q.eq("householdId", membership.householdId))
      .order("asc")
      .collect();

    const itemsWithAuthor = await Promise.all(
      items.map(async (item) => {
        const author = await ctx.db.get(item.authorId);
        return {
          ...item,
          authorName: author?.name || "Kapamilya",
        };
      })
    );

    return itemsWithAuthor;
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { user, membership } = await requireMembership(ctx);

    // Input validation
    const title = args.title.trim();
    if (!title || title.length > 200) {
      throw new Error("Title must be 1-200 characters.");
    }
    if (args.price !== undefined && (args.price < 0 || !Number.isFinite(args.price))) {
      throw new Error("Price must be a non-negative number.");
    }

    const itemId = await ctx.db.insert("balikbayanBox", {
      householdId: membership.householdId,
      authorId: user._id,
      title,
      price: args.price,
      status: "open",
    });

    return itemId;
  },
});

export const updateStatus = mutation({
  args: {
    itemId: v.id("balikbayanBox"),
    status: v.union(v.literal("open"), v.literal("bought"), v.literal("packed")),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireMembership(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    if (item.householdId !== membership.householdId) {
      throw new Error("Item not in your household");
    }

    await ctx.db.patch(args.itemId, {
      status: args.status,
    });
  },
});
