"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Save, X } from "lucide-react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { toast } from 'react-hot-toast';

interface CommentItemProps {
  comment: {
    _id: Id<"comments">
    content: string
    authorId: string
    projectId: Id<"projects">
    taskId?: Id<"tasks">
    createdAt: number
  }
}

export function CommentItem({ comment }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isLoading, setIsLoading] = useState(false)

  const updateComment = useMutation(api.comments.updateComment)
  const deleteComment = useMutation(api.comments.deleteComment)
  const members = useQuery(api.projects.getProjectMembers, { projectId: comment.projectId })
  const { user } = useAuth()

  const author = members?.find((m) => m?.userId === comment.authorId)
  const isAuthor = user?.userId === comment.authorId

  const handleEdit = async () => {
    if (!user || !editContent.trim()) return

    setIsLoading(true)
    try {
      await updateComment({
        commentId: comment._id,
        content: editContent.trim(),
        userId: user.userId,
      })

      setIsEditing(false)
      toast.success("Comment updated!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update comment")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !confirm("Are you sure you want to delete this comment?")) return

    setIsLoading(true)
    try {
      await deleteComment({
        commentId: comment._id,
        userId: user.userId,
      })

      toast.success("Comment deleted!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete comment")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(comment.content)
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-sm">
              {author?.name?.charAt(0) || author?.userName?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm">{author?.name || author?.userName || "Unknown User"}</p>
                <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
              </div>
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleEdit} disabled={isLoading || !editContent.trim()}>
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
