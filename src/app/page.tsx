"use client";

// import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "@/components/projects/project-card";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, FolderOpen, CheckSquare, MessageSquare } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import SidebarLayout from "@/components/sidebar";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  // const { isAuthenticated, user, logout, isLoading } = useAuth()
  const { user ,isLoaded , isSignedIn} = useUser()
  const router = useRouter()

  const createUser = useMutation(api.users.createuser);
  const checkUser = useQuery(api.users.getUserById, { clerkId: user?.id || "" });

  useEffect(() => {
    if (!isSignedIn || !user || checkUser === undefined) return;
    if (!checkUser) {
      console.log("Creating new user:", user.id);
      createUser({
        clerkId: user.id,
        userName: user.username || "",
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || "",
        imageUrl: user.imageUrl || "",
      });
    }
  }, [isSignedIn, user, checkUser, createUser]);

  const projects = useQuery(api.projects.getUserProjects, user ? { userId: user.id } : "skip")


  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }


  return (
    <SidebarLayout>
    <div className="min-h-screen bg-background">
        
        {/* Main Content */}
        <main className="mx-auto p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              Welcome back, {user?.fullName || user?.firstName}!
            </h2>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push("/projects")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FolderOpen className="w-5 h-5" />
                  <span>Projects</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{projects?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Active projects</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <CheckSquare className="w-5 h-5" />
                  <span>Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Pending tasks</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Unread messages</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-dashed"
              onClick={() => router.push("/projects")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Plus className="w-5 h-5" />
                  <span>New Project</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Start collaborating
                </p>
              </CardContent>
            </Card>
          </div>

          {projects && projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Projects</h2>
                <Button variant="ghost" onClick={() => router.push("/projects")}>
                  View All
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.slice(0, 3).map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onClick={() => router.push(`/projects/${project._id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
    </div>
    </SidebarLayout>
  );
}
