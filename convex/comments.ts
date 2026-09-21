// convex/comments.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { verifyMembership } from "./auth_dev_helper";

/** Add a comment to a post. */
export const add = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { user, membership } = await verifyMembership(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.householdId !== membership.householdId) {
      throw new Error("Post not in your household");
    }

    await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: user._id,
      content: args.content,
    });
  },
});
