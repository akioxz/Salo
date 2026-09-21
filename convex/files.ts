import { mutation } from "./_generated/server";
import { verifyMembership } from "./auth_dev_helper";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Ensure the user is authenticated before giving them an upload URL
    await verifyMembership(ctx);
    
    // Return an upload URL pointing to Convex Storage
    return await ctx.storage.generateUploadUrl();
  },
});
