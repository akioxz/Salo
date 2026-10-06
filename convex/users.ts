import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";



export const updateProfile = mutation({
  args: {
    name: v.string(),
    familyTitle: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthenticated");
    }

    const updates: {
      name: string;
      familyTitle: string;
      image?: string;
    } = {
      name: args.name,
      familyTitle: args.familyTitle,
    };

    if (args.imageStorageId) {
      const url = await ctx.storage.getUrl(args.imageStorageId);
      if (url) {
        updates.image = url;
      }
    }

    await ctx.db.patch(userId, updates);
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});
