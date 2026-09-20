import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Ensure the user is authenticated before giving them an upload URL
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    
    // Return an upload URL pointing to Convex Storage
    return await ctx.storage.generateUploadUrl();
  },
});
