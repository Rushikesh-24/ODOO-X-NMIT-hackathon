"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TaskDetailDialog } from "./task-detail-dialog"
import { Calendar, Clock, MoreHorizontal, User, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Id } from "../../../convex/_generated/dataModel"
import { api } from "../../../convex/_generated/api"

interface TaskCardProps {
  task: {
    _id: Id<"tasks">
    title: string
    description?: string
    assigneeId?: string
    dueDate?: number
    status: "todo" | "in-progress" | "done"
    createdAt: number
    updatedAt: number
  }
  projectId: Id<"projects">
  onEdit?: () => void
}

export function TaskCard({ task, projectId, onEdit }: TaskCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus)
  const deleteTask = useMutation(api.tasks.deleteTask)
  const members = useQuery(api.projects.getProjectMembers, { projectId })
  const comments = useQuery(api.comments.getTaskComments, { taskId: task._id })

  const assignee = members?.find((m) => m?.clerkId === task.assigneeId)
  const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status !== "done"
  const commentCount = comments?.length || 0

  const handleStatusChange = async (newStatus: "todo" | "in-progress" | "done") => {
    setIsLoading(true)
    try {
      await updateTaskStatus({
        taskId: task._id,
        status: newStatus,
        updatedBy: "current-user", // This should be the actual current user ID
      })
    } catch (error) {
      console.error("Failed to update task status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask({ taskId: task._id })
      } catch (error) {
        console.error("Failed to delete task:", error)
      }
    }
  }

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-all duration-200",
          isOverdue && "border-destructive/50 bg-destructive/5",
        )}
        onClick={() => setShowDetail(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDetail(true)
                  }}
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("todo")
                  }}
                  disabled={task.status === "todo"}
                >
                  Move to To-Do
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("in-progress")
                  }}
                  disabled={task.status === "in-progress"}
                >
                  Move to In Progress
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("done")
                  }}
                  disabled={task.status === "done"}
                >
                  Move to Done
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  className="text-destructive"
                >
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {assignee ? (
                <div className="flex items-center space-x-1">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-xs">
                      {assignee.name?.charAt(0) || assignee.userName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span className="text-xs">Unassigned</span>
                </div>
              )}
            </div>

            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center space-x-1 text-xs",
                  isOverdue ? "text-destructive" : "text-muted-foreground",
                )}
              >
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {commentCount > 0 && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <MessageSquare className="w-3 h-3" />
                <span>{commentCount}</span>
              </div>
            )}

            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <TaskDetailDialog taskId={task._id} projectId={projectId} open={showDetail} onOpenChange={setShowDetail} />
    </>
  )
}
