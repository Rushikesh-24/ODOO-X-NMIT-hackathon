'use client'
import { useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { AddMemberDialog } from "@/components/projects/add-member-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Calendar, Settings, CheckSquare, MessageSquare, FileText } from "lucide-react"
import { Id } from "../../../../convex/_generated/dataModel"
import { api } from "../../../../convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { use } from "react"

interface ProjectDetailPageProps {
  params: Promise<{ projectId: Id<"projects"> }>
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { user } = useUser()
  const router = useRouter()
  const { projectId } = use(params)
  const project = useQuery(
    api.projects.getProjectById,
    { projectId: projectId || "jn746k2kapj2cwhhhjax4545b17q2awm" as Id<"projects"> }
  )
  const members = useQuery(
    api.projects.getProjectMembers,
    { projectId: projectId || "jn746k2kapj2cwhhhjax4545b17q2awm" as Id<"projects"> }
  )
  const tasks = useQuery(
    api.tasks.getProjectTasks,
    { projectId: projectId || "jn746k2kapj2cwhhhjax4545b17q2awm" as Id<"projects"> }
  )

  if (project === undefined || members === undefined || tasks === undefined) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-muted animate-pulse rounded mb-8" />
          <div className="space-y-6">
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Button onClick={() => router.push("/projects")}>Back to Projects</Button>
        </div>
      </div>
    )
  }

  const isOwner = project.ownerId === user?.id
  const completedTasks = tasks.filter((task) => task.status === "done").length
  const totalTasks = tasks.length

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground">{project.description || "No description"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isOwner && <AddMemberDialog projectId={projectId} />}
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Team Members</span>
                <Badge variant="secondary">{members.length}</Badge>
              </CardTitle>
              <CardDescription>People working on this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member?.clerkId} className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{member?.name?.charAt(0) || member?.userName?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member?.name || member?.userName}</p>
                      <p className="text-sm text-muted-foreground">{member?.email}</p>
                    </div>
                    {member?.clerkId === project.ownerId && <Badge variant="outline">Owner</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Project Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p>{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Owner</p>
                <p>{members.find((m) => m?.clerkId === project.ownerId)?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Members</p>
                <p>
                  {members.length} team member{members.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Task Progress</p>
                <p>
                  {completedTasks} of {totalTasks} tasks completed
                </p>
                {totalTasks > 0 && (
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Button className="h-24 flex-col space-y-2" onClick={() => router.push(`/projects/${projectId}/tasks`)}>
            <CheckSquare className="w-6 h-6" />
            <div className="text-center">
              <span className="text-lg font-semibold">Tasks</span>
              <span className="text-sm opacity-80 block">
                {totalTasks} total, {completedTasks} done
              </span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col space-y-2 bg-transparent"
            onClick={() => router.push(`/projects/${projectId}/discussions`)}
          >
            <MessageSquare className="w-6 h-6" />
            <div className="text-center">
              <span className="text-lg font-semibold">Discussions</span>
              <span className="text-sm opacity-80 block">Team communication</span>
            </div>
          </Button>
          <Button variant="outline" className="h-24 flex-col space-y-2 bg-transparent">
            <FileText className="w-6 h-6" />
            <div className="text-center">
              <span className="text-lg font-semibold">Files</span>
              <span className="text-sm opacity-80 block">Project documents</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
