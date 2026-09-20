// convex/schema.ts
// Salo data model — translated from Supabase schema.sql
// Ref: docs/archive/schema.sql for the original Postgres schema
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // ---------------------------------------------------------------
  // Users (lightweight profile, linked to Convex Auth identity)
  // ---------------------------------------------------------------
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    tokenIdentifier: v.string(), // Convex Auth identity reference
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  // ---------------------------------------------------------------
  // Households — max 2 members, invite-code pairing
  // ---------------------------------------------------------------
  households: defineTable({
    inviteCode: v.optional(v.string()), // null once redeemed
    inviteExpiresAt: v.optional(v.number()), // Unix ms timestamp
  }).index("by_invite_code", ["inviteCode"]),

  householdMembers: defineTable({
    householdId: v.id("households"),
    userId: v.id("users"),
    role: v.union(v.literal("family"), v.literal("ofw")),
  })
    .index("by_household", ["householdId"])
    .index("by_user", ["userId"]),

  // ---------------------------------------------------------------
  // Posts — expense or need, with optional amount and photo
  // ---------------------------------------------------------------
  posts: defineTable({
    householdId: v.id("households"),
    authorId: v.id("users"),
    type: v.union(v.literal("expense"), v.literal("need")),
    amount: v.optional(v.number()),
    category: v.string(),
    caption: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
  }).index("by_household", ["householdId"]),

  // ---------------------------------------------------------------
  // Reactions — heart or thanks, one per type per user per post
  // ---------------------------------------------------------------
  reactions: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    type: v.union(v.literal("heart"), v.literal("thanks")),
  })
    .index("by_post", ["postId"])
    .index("by_post_user_type", ["postId", "userId", "type"]),

  // ---------------------------------------------------------------
  // Comments — tied to a post, authored by a household member
  // ---------------------------------------------------------------
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
  }).index("by_post", ["postId"]),
});
