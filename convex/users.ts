import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const updateUserProfile = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    userName: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const updates: Partial<{
      name: string;
      userName: string;
      profileImageUrl: string;
    }> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.userName !== undefined) updates.userName = args.userName
    if (args.profileImageUrl !== undefined) updates.profileImageUrl = args.profileImageUrl

    await ctx.db.patch(user._id, updates)

    return await ctx.db.get(user._id)
  },
})

export const getUserStats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get projects where user is the owner (using the existing index)
    const ownedProjects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();

    // Get projects where user is a member (this requires a full table scan
    // as there is no index on the memberIds array)
    // This is a known limitation and a new table is the recommended solution.
    const memberProjects = await ctx.db
      .query("projects")
      .collect()
      .then(projects => projects.filter(project => project.memberIds.includes(args.userId)));

    // Combine unique projects
    const allProjects = new Set([...ownedProjects, ...memberProjects]);

    // Get user's tasks using the new index (efficient!)
    const userTasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assigneeId", args.userId))
      .collect();

    // Get user's comments (using the existing index)
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("authorId"), args.userId))
      .collect();

    // Return the stats
    return {
      projectsCount: allProjects.size,
      tasksAssigned: userTasks.length,
      tasksCompleted: userTasks.filter((task) => task.status === "done").length,
      commentsCount: comments.length,
    };
  },
});
