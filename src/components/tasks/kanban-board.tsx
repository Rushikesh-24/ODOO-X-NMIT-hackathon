"use client"

import { useQuery } from "convex/react"
import { TaskCard } from "./task-card"
import { CreateTaskDialog } from "./create-task-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"

interface KanbanBoardProps {
  projectId: Id<"projects">
}

const columns = [
  { id: "todo", title: "To-Do", color: "bg-slate-100 dark:bg-slate-800" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-100 dark:bg-blue-900/20" },
  { id: "done", title: "Done", color: "bg-green-100 dark:bg-green-900/20" },
] as const

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const tasks = useQuery(api.tasks.getProjectTasks, { projectId })

  if (tasks === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="h-12 bg-muted animate-pulse rounded" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const tasksByStatus = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Board</h2>
          <p className="text-muted-foreground">Manage and track your project tasks</p>
        </div>
        <CreateTaskDialog projectId={projectId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasksByStatus[column.id]
          return (
            <Card key={column.id} className={column.color}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{column.title}</span>
                  <Badge variant="secondary" className="ml-2">
                    {columnTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => <TaskCard key={task._id} task={task} projectId={projectId} />)
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Task Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Tasks</span>
                <span className="font-medium">{tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="font-medium text-green-600">{tasksByStatus.done.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="font-medium text-blue-600">{tasksByStatus["in-progress"].length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">To-Do</span>
                <span className="font-medium text-slate-600">{tasksByStatus.todo.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{tasks.length > 0 ? Math.round((tasksByStatus.done.length / tasks.length) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: tasks.length > 0 ? `${(tasksByStatus.done.length / tasks.length) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Overdue Tasks</span>
                <span className="font-medium text-red-600">
                  {tasks.filter((task) => task.dueDate && task.dueDate < Date.now() && task.status !== "done").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due This Week</span>
                <span className="font-medium">
                  {
                    tasks.filter((task) => {
                      if (!task.dueDate) return false
                      const weekFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000
                      return task.dueDate <= weekFromNow && task.dueDate >= Date.now()
                    }).length
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
