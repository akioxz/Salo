// convex/files.ts
import { mutation } from "./_generated/server";
import { requireMembership } from "./auth_helpers";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Ensure the user is authenticated and belongs to a household
    await requireMembership(ctx);

    return await ctx.storage.generateUploadUrl();
  },
});
