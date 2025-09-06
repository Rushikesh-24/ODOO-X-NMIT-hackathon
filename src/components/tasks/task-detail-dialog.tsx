"use client"

import React from "react"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CommentList } from "@/components/comments/comment-list"
import { Calendar, User, Clock, MessageSquare } from "lucide-react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import toast from "react-hot-toast"
import { useUser } from "@clerk/nextjs"

interface TaskDetailDialogProps {
  taskId: Id<"tasks"> | null
  projectId: Id<"projects">
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({ taskId, projectId, open, onOpenChange }: TaskDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState<string>("unassigned")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo")
  const [isLoading, setIsLoading] = useState(false)

  const task = useQuery(api.tasks.getTaskById, taskId ? { taskId } : "skip")
  const members = useQuery(api.projects.getProjectMembers, { projectId })
  const updateTask = useMutation(api.tasks.updateTask)
  const { user } = useUser()

  // Update form when task loads
  React.useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setAssigneeId(task.assigneeId || "unassigned")
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "")
      setStatus(task.status)
    }
  }, [task])

  const assignee = members?.find((m) => m?.clerkId === task?.assigneeId)
  const isOverdue = task?.dueDate && task.dueDate < Date.now() && task.status !== "done"

  const handleSave = async () => {
    if (!taskId || !user) return

    setIsLoading(true)
    try {
      await updateTask({
        taskId,
        title,
        description,
        assigneeId: assigneeId === "unassigned" ? undefined : assigneeId,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        status,
      })

      setIsEditing(false)
      toast.success("Task updated!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update task")
    } finally {
      setIsLoading(false)
    }
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{task.title}</span>
            <div className="flex items-center space-x-2">
              <Badge
                variant={task.status === "done" ? "default" : task.status === "in-progress" ? "secondary" : "outline"}
              >
                {task.status === "todo" ? "To-Do" : task.status === "in-progress" ? "In Progress" : "Done"}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive">
                  <Clock className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Created {new Date(task.createdAt).toLocaleDateString()}
            {task.updatedAt !== task.createdAt && ` • Updated ${new Date(task.updatedAt).toLocaleDateString()}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Task Details</TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title</Label>
                  {isEditing ? (
                    <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{task.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="task-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded min-h-[100px] whitespace-pre-wrap">
                      {task.description || "No description"}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  {isEditing ? (
                    <Select value={status} onValueChange={(value: "todo" | "in-progress" | "done") => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To-Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                      <Badge
                        variant={
                          task.status === "done" ? "default" : task.status === "in-progress" ? "secondary" : "outline"
                        }
                      >
                        {task.status === "todo" ? "To-Do" : task.status === "in-progress" ? "In Progress" : "Done"}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Assignee</Label>
                  {isEditing ? (
                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {members?.map((member) => (
                          <SelectItem key={member?.clerkId} value={member?.clerkId || ""}>
                            {member?.name || member?.userName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                      {assignee ? (
                        <>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {assignee.name?.charAt(0) || assignee.userName?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{assignee.name || assignee.userName}</span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  {isEditing ? (
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Task</Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <CommentList projectId={projectId} taskId={taskId || undefined} title="Task Comments" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
