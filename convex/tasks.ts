import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    assigneeId: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      projectId: args.projectId,
      assigneeId: args.assigneeId,
      dueDate: args.dueDate,
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Create notification for assignee if different from creator
    if (args.assigneeId && args.assigneeId !== args.createdBy) {
      await ctx.db.insert("notifications", {
        userId: args.assigneeId,
        type: "task_assigned",
        message: `You were assigned task "${args.title}"`,
        read: false,
        createdAt: Date.now(),
      })
    }

    return taskId
  },
})

export const getProjectTasks = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .order("desc")
      .collect()
  },
})

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("todo"), v.literal("in-progress"), v.literal("done")),
    updatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId)
    if (!task) {
      throw new Error("Task not found")
    }

    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now(),
    })

    // Create notification for assignee if status changed to done
    if (args.status === "done" && task.assigneeId && task.assigneeId !== args.updatedBy) {
      await ctx.db.insert("notifications", {
        userId: task.assigneeId,
        type: "task_completed",
        message: `Task "${task.title}" was marked as completed`,
        read: false,
        createdAt: Date.now(),
      })
    }

    return task
  },
})

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assigneeId: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    status: v.optional(v.union(v.literal("todo"), v.literal("in-progress"), v.literal("done"))),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updates } = args

    await ctx.db.patch(taskId, {
      ...updates,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(taskId)
  },
})

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId)
    return true
  },
})

export const getTaskById = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId)
  },
})
