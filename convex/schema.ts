import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

const schema = defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    userName: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_clerkId", ["clerkId"]),
    
  projects: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  ownerId: v.string(),
  memberIds: v.array(v.string()),
  createdAt: v.number(),
}).index("by_owner", ["ownerId"]),
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    assigneeId: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    status: v.union(v.literal("todo"), v.literal("in-progress"), v.literal("done")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_assignee", ["assigneeId"]),
  comments: defineTable({
    content: v.string(),
    authorId: v.string(),
    projectId: v.id("projects"),
    taskId: v.optional(v.id("tasks")),
    createdAt: v.number(),
  }),
  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  }),
})

export default schema
