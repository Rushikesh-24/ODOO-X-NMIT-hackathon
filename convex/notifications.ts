import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getUserNotifications = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .take(50) // Limit to 50 most recent notifications
  },
})

export const getUnreadNotificationCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.and(q.eq(q.field("userId"), args.userId), q.eq(q.field("read"), false)))
      .collect()

    return notifications.length
  },
})

export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      read: true,
    })
    return true
  },
})

export const markAllNotificationsAsRead = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .filter((q) => q.and(q.eq(q.field("userId"), args.userId), q.eq(q.field("read"), false)))
      .collect()

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        read: true,
      })
    }

    return unreadNotifications.length
  },
})

export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId)
    return true
  },
})

export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      message: args.message,
      read: false,
      createdAt: Date.now(),
    })
  },
})
