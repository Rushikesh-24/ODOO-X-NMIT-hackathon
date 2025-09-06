import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    userName: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first()

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    const userId = crypto.randomUUID()

    await ctx.db.insert("users", {
      userId,
      userName: args.userName,
      email: args.email,
      password: args.password, // In production, this should be hashed
      name: args.name,
      createdAt: Date.now(),
    })

    return { userId, email: args.email, userName: args.userName }
  },
})

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first()

    if (!user || user.password !== args.password) {
      throw new Error("Invalid email or password")
    }

    return {
      userId: user.userId,
      email: user.email,
      userName: user.userName,
      name: user.name,
    }
  },
})

export const getCurrentUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first()
  },
})
