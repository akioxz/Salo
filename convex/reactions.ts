// convex/reactions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Toggle a reaction. If it exists, remove it. If it doesn't, add it.
 * Enforces one reaction of a given type per user per post.
 */
export const toggle = mutation({
  args: {
    postId: v.id("posts"),
    type: v.union(v.literal("heart"), v.literal("thanks")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    // Check if the reaction already exists
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_post_user_type", (q) =>
        q
          .eq("postId", args.postId)
          .eq("userId", user._id)
          .eq("type", args.type),
      )
      .unique();

    if (existing) {
      // Remove it
      await ctx.db.delete(existing._id);
      return false; // Indicates it was removed
    } else {
      // Add it
      await ctx.db.insert("reactions", {
        postId: args.postId,
        userId: user._id,
        type: args.type,
      });
      return true; // Indicates it was added
    }
  },
});
