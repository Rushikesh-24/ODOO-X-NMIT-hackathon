"use client"

import { useQuery } from "convex/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Calendar } from "lucide-react"
import { Id } from "../../../convex/_generated/dataModel"
import { api } from "../../../convex/_generated/api"

interface ProjectCardProps {
  project: {
    _id: Id<"projects">
    name: string
    description?: string
    ownerId: string
    memberIds: string[]
    createdAt: number
  }
  onClick: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const members = useQuery(api.projects.getProjectMembers, { projectId: project._id })

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <CardDescription className="mt-1">{project.description || "No description"}</CardDescription>
          </div>
          <Badge variant="secondary">
            {project.memberIds.length} member{project.memberIds.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {members?.slice(0, 3).map((member, index) => (
                <Avatar key={member?.userId || index} className="w-6 h-6 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {member?.name?.charAt(0) || member?.userName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
              ))}
              {members && members.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{members.length - 3}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
