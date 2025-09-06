"use client"

import type React from "react"

import { useState } from "react"
import { useMutation } from "convex/react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from 'react-hot-toast';
import { Send } from "lucide-react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"

interface CommentFormProps {
  projectId: Id<"projects">
  taskId?: Id<"tasks">
  placeholder?: string
}

export function CommentForm({ projectId, taskId, placeholder = "Write a comment..." }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const createComment = useMutation(api.comments.createComment)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !content.trim()) return

    setIsLoading(true)
    try {
      await createComment({
        content: content.trim(),
        authorId: user.userId,
        projectId,
        taskId,
      })

      setContent("")
      toast.success("Comment posted!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post comment")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-sm">
                {user.name?.charAt(0) || user.userName?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !content.trim()}>
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
