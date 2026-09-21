// convex/auth_dev_helper.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyMembership(ctx: any) {
// --- TEMPORARY DEV BYPASS ---
let user = await ctx.db.query("users").first();
  if (!user) {
    const userId = await ctx.db.insert("users", { name: "Dev Tester", email: "dev@tester.com", tokenIdentifier: "dev-token" });
    user = await ctx.db.get(userId);
  } else if (!user.email || !user.tokenIdentifier) {
    await ctx.db.patch(user._id, { email: user.email || "dev@tester.com", tokenIdentifier: user.tokenIdentifier || "dev-token" });
    user = await ctx.db.get(user._id);
  }

  let household = await ctx.db.query("households").first();
  if (!household) {
    const hhId = await ctx.db.insert("households", {});
    household = await ctx.db.get(hhId);
  }

  let membership = await ctx.db.query("householdMembers").first();
  if (!membership) {
    const memId = await ctx.db.insert("householdMembers", {
      userId: user!._id,
      householdId: household!._id,
      role: "ofw",
    });
    membership = await ctx.db.get(memId);
  }

  return { user: user!, membership: membership! };
}
