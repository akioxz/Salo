// convex/reactions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireMembership } from "./auth_helpers";

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
    const { user, membership } = await requireMembership(ctx);

    // Verify post belongs to user's household
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.householdId !== membership.householdId) {
      throw new Error("Post not in your household");
    }

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
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("reactions", {
        postId: args.postId,
        userId: user._id,
        type: args.type,
      });
      return true;
    }
  },
});
