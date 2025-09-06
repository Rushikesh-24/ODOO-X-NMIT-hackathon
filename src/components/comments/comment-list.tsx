"use client"

import { useQuery } from "convex/react"
import { CommentItem } from "./comment-item"
import { CommentForm } from "./comment-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { Id } from "../../../convex/_generated/dataModel"
import { api } from "../../../convex/_generated/api"

interface CommentListProps {
  projectId: Id<"projects">
  taskId?: Id<"tasks">
  title?: string
}

export function CommentList({ projectId, taskId, title = "Discussion" }: CommentListProps) {
  const comments = useQuery(
    taskId ? api.comments.getTaskComments : api.comments.getProjectComments,
    taskId ? { taskId } : { projectId },
  )

  if (comments === undefined) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>{title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>{title}</span>
            <span className="text-sm font-normal text-muted-foreground">
              ({comments.length} {comments.length === 1 ? "comment" : "comments"})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CommentForm
            projectId={projectId}
            taskId={taskId}
            placeholder={taskId ? "Comment on this task..." : "Start a discussion..."}
          />
        </CardContent>
      </Card>

      {comments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No comments yet</p>
              <p className="text-sm">
                {taskId ? "Be the first to comment on this task." : "Start the conversation with your team."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}
