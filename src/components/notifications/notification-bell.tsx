/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "../../../convex/_generated/api"

export function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const notifications = useQuery(api.notifications.getUserNotifications, user ? { userId: user.userId } : "skip")
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount, user ? { userId: user.userId } : "skip")

  const markAsRead = useMutation(api.notifications.markNotificationAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead)
  const deleteNotification = useMutation(api.notifications.deleteNotification)

  if (!user) return null

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any })
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ userId: user.userId })
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification({ notificationId: notificationId as any })
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "📋"
      case "task_completed":
        return "✅"
      case "project_invitation":
        return "👥"
      case "project_created":
        return "🚀"
      case "task_comment":
      case "project_comment":
        return "💬"
      default:
        return "🔔"
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount && unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications === undefined ? (
          <div className="p-4">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification._id}
                  className={cn("flex items-start space-x-3 p-3 cursor-pointer", !notification.read && "bg-muted/50")}
                  onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification._id)
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
