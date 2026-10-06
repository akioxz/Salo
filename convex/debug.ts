import { query } from "./_generated/server";

export const getAkio = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const households = await ctx.db.query("households").collect();
    const members = await ctx.db.query("householdMembers").collect();
    return { users, households, members };
  },
});

export const getAllPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").take(5);
  },
});
