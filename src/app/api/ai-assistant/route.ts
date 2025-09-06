/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../../convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const { query, userId } = await request.json()

    // Simple pattern matching for common queries
    const lowerQuery = query.toLowerCase()

    let response = ""

    if (lowerQuery.includes("project") && (lowerQuery.includes("working") || lowerQuery.includes("assigned"))) {
      // Get user's projects
      const projects = await convex.query(api.projects.getUserProjects, { userId })
      if (projects.length === 0) {
        response = "You're not currently working on any projects. Would you like to create a new project?"
      } else {
        response = `You're currently working on ${projects.length} project${projects.length > 1 ? "s" : ""}:\n\n${projects.map((p) => `• **${p.name}** - ${p.description || "No description"}`).join("\n")}`
      }
    } else if (lowerQuery.includes("task") && (lowerQuery.includes("assigned") || lowerQuery.includes("my"))) {
      // Get user's tasks
      const tasks = await convex.query(api.tasks.getUserTasks, { userId })
      if (tasks.length === 0) {
        response = "You don't have any tasks assigned to you at the moment."
      } else {
        const highPriority = tasks.filter((t) => (t as any).priority === "High").length
        const inProgress = tasks.filter((t) => t.status === "in-progress").length
        const completed = tasks.filter((t) => t.status === "done").length

        response = `You have ${tasks.length} task${tasks.length > 1 ? "s" : ""} assigned to you:\n\n`
        response += `• ${highPriority} high priority task${highPriority !== 1 ? "s" : ""}\n`
        response += `• ${inProgress} in progress\n`
        response += `• ${completed} completed\n\n`

        if (highPriority > 0) {
          const highTasks = tasks.filter((t) => (t as any).priority === "High" && t.status !== "done")
          response += `**High Priority Tasks:**\n${highTasks
            .slice(0, 3)
            .map((t) => `• ${t.title}`)
            .join("\n")}`
        }
      }
    } else if (lowerQuery.includes("overdue") || lowerQuery.includes("due")) {
      // Get overdue/due soon tasks
      const tasks = await convex.query(api.tasks.getUserTasks, { userId })
      const now = new Date()
      const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done")
      const dueSoon = tasks.filter((t) => {
        if (!t.dueDate || t.status === "done") return false
        const dueDate = new Date(t.dueDate)
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        return dueDate >= now && dueDate <= threeDaysFromNow
      })

      if (overdue.length === 0 && dueSoon.length === 0) {
        response = "Great news! You don't have any overdue or urgent tasks."
      } else {
        response = ""
        if (overdue.length > 0) {
          response += `⚠️ You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}:\n${overdue.map((t) => `• ${t.title}`).join("\n")}\n\n`
        }
        if (dueSoon.length > 0) {
          response += `📅 ${dueSoon.length} task${dueSoon.length > 1 ? "s" : ""} due soon:\n${dueSoon.map((t) => `• ${t.title} (due ${new Date(t.dueDate!).toLocaleDateString()})`).join("\n")}`
        }
      }
    } else if (lowerQuery.includes("progress") || lowerQuery.includes("status")) {
      // Get overall progress
      const projects = await convex.query(api.projects.getUserProjects, { userId })
      const tasks = await convex.query(api.tasks.getUserTasks, { userId })

      const completedTasks = tasks.filter((t) => t.status === "done").length
      const totalTasks = tasks.length
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      response = `📊 **Your Progress Overview:**\n\n`
      response += `• **Projects:** ${projects.length} active\n`
      response += `• **Tasks:** ${completedTasks}/${totalTasks} completed (${completionRate}%)\n`
      response += `• **Completion Rate:** ${completionRate >= 80 ? "🎉 Excellent!" : completionRate >= 60 ? "👍 Good progress!" : "💪 Keep going!"}`
    } else {
      // Default response with suggestions
      response = `I can help you with information about your projects and tasks! Try asking me:\n\n• "What projects am I working on?"\n• "What tasks are assigned to me?"\n• "Do I have any overdue tasks?"\n• "What's my progress status?"\n• "Show me my high priority tasks"`
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("AI Assistant error:", error)
    return NextResponse.json({ error: "Sorry, I encountered an error processing your request." }, { status: 500 })
  }
}
