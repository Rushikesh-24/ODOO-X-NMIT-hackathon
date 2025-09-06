import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const createComment = mutation({
  args: {
    content: v.string(),
    authorId: v.string(),
    projectId: v.id("projects"),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      content: args.content,
      authorId: args.authorId,
      projectId: args.projectId,
      taskId: args.taskId,
      createdAt: Date.now(),
    })

    // Get project members to notify them
    const project = await ctx.db.get(args.projectId)
    if (project) {
      // Create notifications for all project members except the author
      const membersToNotify = project.memberIds.filter((memberId) => memberId !== args.authorId)

      for (const memberId of membersToNotify) {
        await ctx.db.insert("notifications", {
          userId: memberId,
          type: args.taskId ? "task_comment" : "project_comment",
          message: args.taskId ? `New comment on a task in "${project.name}"` : `New discussion in "${project.name}"`,
          read: false,
          createdAt: Date.now(),
        })
      }
    }

    return commentId
  },
})

export const getProjectComments = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .filter((q) => q.and(q.eq(q.field("projectId"), args.projectId), q.eq(q.field("taskId"), undefined)))
      .order("desc")
      .collect()
  },
})

export const getTaskComments = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .order("asc")
      .collect()
  },
})

export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId)

    if (!comment) {
      throw new Error("Comment not found")
    }

    // Only allow the author to delete their comment
    if (comment.authorId !== args.userId) {
      throw new Error("You can only delete your own comments")
    }

    await ctx.db.delete(args.commentId)
    return true
  },
})

export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId)

    if (!comment) {
      throw new Error("Comment not found")
    }

    // Only allow the author to edit their comment
    if (comment.authorId !== args.userId) {
      throw new Error("You can only edit your own comments")
    }

    await ctx.db.patch(args.commentId, {
      content: args.content,
    })

    return await ctx.db.get(args.commentId)
  },
})
