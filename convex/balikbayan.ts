import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { verifyMembership } from "./auth_dev_helper";

export const list = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { membership } = await verifyMembership(ctx);
      
      const items = await ctx.db
        .query("balikbayanBox")
        .withIndex("by_household", (q) => q.eq("householdId", membership.householdId))
        .order("asc")
        .collect();

      return items;
    } catch (_e) {
      return [];
    }
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { user, membership } = await verifyMembership(ctx);

    const itemId = await ctx.db.insert("balikbayanBox", {
      householdId: membership.householdId,
      authorId: user._id,
      title: args.title,
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
    const { membership } = await verifyMembership(ctx);

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
