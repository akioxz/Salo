import { mutation } from "./_generated/server";

export const clearAndSeed = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all posts
    const posts = await ctx.db.query("posts").collect();
    for (const post of posts) {
      await ctx.db.delete(post._id);
    }
    
    // Delete all comments
    const comments = await ctx.db.query("comments").collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }
    
    // Delete all reactions
    const reactions = await ctx.db.query("reactions").collect();
    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    // Get the first user and household to attach posts to
    const user = await ctx.db.query("users").first();
    const household = await ctx.db.query("households").first();
    
    if (!user || !household) {
      console.log("No user or household found. Run the app once to create a user.");
      return;
    }

    // Seed new posts
    await ctx.db.insert("posts", {
      householdId: household._id,
      authorId: user._id,
      type: "expense",
      amount: 450,
      category: "GROCERIES",
      caption: "Quick restock for the week",
    });

    await ctx.db.insert("posts", {
      householdId: household._id,
      authorId: user._id,
      type: "padala",
      amount: 3000,
      category: "REMITTANCE",
      caption: "Sent some extra for Kuya's bday",
    });
    
    await ctx.db.insert("posts", {
      householdId: household._id,
      authorId: user._id,
      type: "need",
      amount: 1200,
      category: "UTILITIES",
      caption: "Electric bill is due next week",
    });

  }
});

export const sanitizeExistingPosts = mutation({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    let updated = 0;
    for (const post of posts) {
      if (post.caption) {
        const cleaned = post.caption.replace(/\p{Extended_Pictographic}/gu, "").trim();
        if (cleaned !== post.caption) {
          await ctx.db.patch(post._id, { caption: cleaned });
          updated++;
        }
      }
    }
    return { updated };
  },
});
