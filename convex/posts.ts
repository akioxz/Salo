// convex/posts.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Helper to authenticate and verify household membership.
 * Returns the user and their household membership.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyMembership(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_token", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  if (!user) throw new Error("User not found");

  const membership = await ctx.db
    .query("householdMembers")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_user", (q: any) => q.eq("userId", user._id))
    .unique();

  if (!membership) throw new Error("You do not belong to a household");

  return { user, membership };
}

/** Get all posts for the current user's household, with reactions and comments. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { membership } = await verifyMembership(ctx);

      const posts = await ctx.db
        .query("posts")
        .withIndex("by_household", (q) =>
          q.eq("householdId", membership.householdId),
        )
        .order("desc") // by _creationTime (newest first)
        .collect();

      // Fetch authors, reactions, and comments for each post
      return await Promise.all(
        posts.map(async (post) => {
          const author = await ctx.db.get(post.authorId);
          const authorMembership = await ctx.db
            .query("householdMembers")
            .withIndex("by_user", (q) => q.eq("userId", post.authorId))
            .unique();

          const reactions = await ctx.db
            .query("reactions")
            .withIndex("by_post", (q) => q.eq("postId", post._id))
            .collect();

          const comments = await ctx.db
            .query("comments")
            .withIndex("by_post", (q) => q.eq("postId", post._id))
            .collect();

          return {
            ...post,
            author: {
              name: author?.name ?? author?.email ?? "Unknown",
              role: authorMembership?.role,
            },
            reactions,
            comments,
          };
        }),
      );
    } catch (_e) {
      // Return empty array if not authenticated or no household yet
      return [];
    }
  },
});

/** Create a new post in the user's household. */
export const create = mutation({
  args: {
    type: v.union(v.literal("expense"), v.literal("need")),
    amount: v.optional(v.number()),
    category: v.string(),
    caption: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { user, membership } = await verifyMembership(ctx);

    const postId = await ctx.db.insert("posts", {
      householdId: membership.householdId,
      authorId: user._id,
      type: args.type,
      amount: args.amount,
      category: args.category,
      caption: args.caption,
      photoStorageId: args.photoStorageId,
    });

    return postId;
  },
});

/** Delete a post (only if the user is the author). */
export const remove = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const { user } = await verifyMembership(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (post.authorId !== user._id) {
      throw new Error("You can only delete your own posts");
    }

    // Reactions and comments don't cascade delete automatically in Convex
    // like they do in Postgres (ON DELETE CASCADE), so we must manually clean them up.
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(args.postId);
  },
});
