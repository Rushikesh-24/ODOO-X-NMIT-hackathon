"use client"

import { useQuery } from "convex/react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { ProjectCard } from "@/components/projects/project-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { api } from "../../../convex/_generated/api"

export default function ProjectsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const projects = useQuery(api.projects.getUserProjects, user ? { userId: user.userId } : "skip")

  if (!user) {
    router.push("/auth")
    return null
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground">Manage your team projects</p>
            </div>
          </div>
          <CreateProjectDialog />
        </div>

        {projects === undefined ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to start collaborating with your team.
            </p>
            <CreateProjectDialog />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onClick={() => router.push(`/projects/${project._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
