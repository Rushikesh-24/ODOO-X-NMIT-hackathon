import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      ownerId: args.ownerId,
      memberIds: [args.ownerId], // Owner is automatically a member
      createdAt: Date.now(),
    })

    // Create notification for project creation
    await ctx.db.insert("notifications", {
      userId: args.ownerId,
      type: "project_created",
      message: `You created project "${args.name}"`,
      read: false,
      createdAt: Date.now(),
    })

    return projectId
  },
})

export const getUserProjects = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        // Get projects where user is the owner (this still uses the index)
        const ownedProjects = await ctx.db
            .query("projects")
            .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
            .collect();

        // Get ALL projects and filter them on the server to find where user is a member
        // WARNING: This is a full table scan and can be slow for large datasets.
        const allProjects = await ctx.db
            .query("projects")
            .collect();

        const memberProjects = allProjects.filter(project => 
            project.memberIds.includes(args.userId)
        );

        // Combine results, removing duplicates
        const projectMap = new Map();
        [...ownedProjects, ...memberProjects].forEach(project => {
            projectMap.set(project._id.toString(), project);
        });

        return Array.from(projectMap.values());
    },
});
export const getProjectById = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId)
  },
})

export const addProjectMember = mutation({
  args: {
    projectId: v.id("projects"),
    userEmail: v.string(),
    addedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error("Project not found")
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.userEmail))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    // Check if user is already a member
    if (project.memberIds.includes(user.clerkId)) {
      throw new Error("User is already a member of this project")
    }

    // Add user to project
    await ctx.db.patch(args.projectId, {
      memberIds: [...project.memberIds, user.clerkId],
    })

    // Create notification for new member
    await ctx.db.insert("notifications", {
      userId: user.clerkId,
      type: "project_invitation",
      message: `You were added to project "${project.name}"`,
      read: false,
      createdAt: Date.now(),
    })

    return user
  },
})

export const getProjectMembers = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)
    if (!project) return []

    const members = await Promise.all(
      project.memberIds.map(async (clerkId) => {
        return await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), clerkId))
          .first()
      }),
    )

    return members.filter(Boolean)
  },
})
