import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const createUser = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first()

    if (existingUser) {
      throw new Error("User with the same userId or email already exists")
    }

    await ctx.db.insert("users", {
        userId: args.userId,
        userName: args.userName,
        email: args.email,
        name: args.name,
        profileImageUrl: args.profileImageUrl,
    })

    return true
  },
})

export const getUserById = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
  },
});