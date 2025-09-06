import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    userName: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first()

    if (existingUser) {
      // Update existing user with latest data from Clerk
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        userName: args.userName,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      })
      return existingUser
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      userName: args.userName,
      name: args.name,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return await ctx.db.get(userId)
  },
})

export const getCurrentUser = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first()
  },
})

export const getUserById = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.clerkId) return null

    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first()
  },
})

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect()
  },
})
