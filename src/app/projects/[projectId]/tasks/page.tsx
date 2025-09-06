"use client"

import { useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"
import { use } from "react"


export default function TasksPage({ params }: { params: Promise<{ projectId: Id<"projects"> }> }) {
  const router = useRouter()
  const { projectId  } = use(params)

  const project = useQuery(api.projects.getProjectById, { projectId })

  if (project === undefined) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-muted animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
            ))}
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">Task Management</p>
          </div>
        </div>

        <KanbanBoard projectId={projectId} />
      </div>
    </div>
  )
}
