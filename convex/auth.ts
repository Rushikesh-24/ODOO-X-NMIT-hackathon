import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

function hashPassword(password: string): string {
  // Simple hash function - in production use bcrypt or similar
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

function generateToken(): string {
  return crypto.randomUUID() + "-" + Date.now().toString()
}

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
    const hashedPassword = hashPassword(args.password)
    const authToken = generateToken()

    await ctx.db.insert("users", {
      userId,
      userName: args.userName,
      email: args.email,
      password: hashedPassword,
      name: args.name,
      authToken,
      createdAt: Date.now(),
    })

    return {
      userId,
      email: args.email,
      userName: args.userName,
      name: args.name,
      authToken,
    }
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

    const hashedPassword = hashPassword(args.password)
    if (!user || user.password !== hashedPassword) {
      throw new Error("Invalid email or password")
    }

    // Generate new auth token on login
    const authToken = generateToken()

    // Update user with new token
    await ctx.db.patch(user._id, { authToken })

    return {
      userId: user.userId,
      email: user.email,
      userName: user.userName,
      name: user.name,
      authToken,
    }
  },
})

export const verifyToken = query({
  args: {
    authToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("authToken"), args.authToken))
      .first()

    if (!user) {
      return null
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

export const logout = mutation({
  args: {
    authToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("authToken"), args.authToken))
      .first()

    if (user) {
      await ctx.db.patch(user._id, { authToken: undefined })
    }

    return { success: true }
  },
})
