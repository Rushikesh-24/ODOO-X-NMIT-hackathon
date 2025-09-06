"use client"

import { useQuery } from "convex/react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, CheckSquare, MessageSquare, TrendingUp } from "lucide-react"
import { api } from "../../../convex/_generated/api"

export function ProfileStats() {
  const { user } = useAuth()
  const stats = useQuery(api.users.getUserStats, user ? { userId: user.userId } : "skip")

  if (!user || stats === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const completionRate = stats.tasksAssigned > 0 ? Math.round((stats.tasksCompleted / stats.tasksAssigned) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <FolderOpen className="w-5 h-5 text-blue-500" />
            <span>Projects</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.projectsCount}</p>
          <p className="text-sm text-muted-foreground">Active projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <CheckSquare className="w-5 h-5 text-green-500" />
            <span>Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {stats.tasksCompleted}/{stats.tasksAssigned}
          </p>
          <p className="text-sm text-muted-foreground">Completed tasks</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            <span>Comments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.commentsCount}</p>
          <p className="text-sm text-muted-foreground">Total comments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <span>Completion</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{completionRate}%</p>
          <p className="text-sm text-muted-foreground">Task completion rate</p>
        </CardContent>
      </Card>
    </div>
  )
}
