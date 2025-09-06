import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
users: defineTable({
    userId: v.string(),
    userName: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
})
})