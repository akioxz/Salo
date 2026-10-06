// convex/posts.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getSessionUser, requireMembership } from "./auth_helpers";

/** Get all posts for the current user's household, with reactions and comments. */
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

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_household", (q) =>
        q.eq("householdId", membership.householdId),
      )
      .order("desc")
      .take(50);

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

        const commentsWithAuthors = await Promise.all(
          comments.map(async (c) => {
            const cAuthor = await ctx.db.get(c.authorId);
            const cMembership = await ctx.db
              .query("householdMembers")
              .withIndex("by_user", (q) => q.eq("userId", c.authorId))
              .unique();
            return {
              ...c,
              author: {
                name: cAuthor?.name ?? "Kapamilya",
                familyTitle: cAuthor?.familyTitle,
                role: cMembership?.role ?? "family",
                image: cAuthor?.image,
              },
            };
          })
        );

        const photoUrl = post.photoStorageId
          ? await ctx.storage.getUrl(post.photoStorageId)
          : undefined;

        const audioUrl = post.audioStorageId
          ? await ctx.storage.getUrl(post.audioStorageId)
          : undefined;

        const hasReacted = reactions.some(
          (r) => r.userId === user._id && r.type === "heart"
        );

        let isCovered = false;
        if (post.type === "need") {
          const coveringExpense = await ctx.db
            .query("posts")
            .withIndex("by_linked_need", (q) => q.eq("linkedNeedId", post._id))
            .first();
          isCovered = !!coveringExpense;
        }

        return {
          ...post,
          photoUrl,
          audioUrl,
          hasReacted,
          isCovered,
          author: {
            name: author?.name ?? "Kapamilya",
            familyTitle: author?.familyTitle,
            role: authorMembership?.role,
            image: author?.image,
          },
          reactions,
          comments: commentsWithAuthors,
        };
      }),
    );
  },
});

/** Create a new post in the user's household. */
export const create = mutation({
  args: {
    type: v.union(v.literal("expense"), v.literal("need"), v.literal("padala")),
    amount: v.optional(v.number()),
    category: v.string(),
    caption: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    audioStorageId: v.optional(v.id("_storage")),
    linkedNeedId: v.optional(v.id("posts")),
  },
  handler: async (ctx, args) => {
    const { user, membership } = await requireMembership(ctx);

    // Input validation
    if (args.amount !== undefined && (args.amount < 0 || !Number.isFinite(args.amount))) {
      throw new Error("Amount must be a non-negative number.");
    }
    if (!args.category.trim()) {
      throw new Error("Category is required.");
    }
    if (args.caption && args.caption.length > 2000) {
      throw new Error("Caption too long (max 2000 chars).");
    }

    const postId = await ctx.db.insert("posts", {
      householdId: membership.householdId,
      authorId: user._id,
      type: args.type,
      amount: args.amount,
      category: args.category.trim(),
      caption: args.caption?.trim(),
      photoStorageId: args.photoStorageId,
      audioStorageId: args.audioStorageId,
      linkedNeedId: args.linkedNeedId,
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
    const { user, membership } = await requireMembership(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.householdId !== membership.householdId) {
      throw new Error("Post not in your household");
    }
    if (post.authorId !== user._id) {
      throw new Error("You can only delete your own posts");
    }

    // Clean up storage files
    if (post.photoStorageId) {
      await ctx.storage.delete(post.photoStorageId);
    }
    if (post.audioStorageId) {
      await ctx.storage.delete(post.audioStorageId);
    }

    // Clean up reactions
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    // Clean up comments
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
