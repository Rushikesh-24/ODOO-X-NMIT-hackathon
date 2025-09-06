"use client"

import type React from "react"

import { useState } from "react"
import { useMutation } from "convex/react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from 'react-hot-toast';
import { User, Mail, AtSign } from "lucide-react"
import { api } from "../../../convex/_generated/api"

export function ProfileForm() {
  const { user, login } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [userName, setUserName] = useState(user?.userName || "")
  const [isLoading, setIsLoading] = useState(false)

  const updateProfile = useMutation(api.users.updateUserProfile)

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updatedUser = await updateProfile({
        userId: user.userId,
        name: name.trim() || undefined,
        userName: userName.trim(),
      })

      // Update local auth state
      login({
        ...user,
        name: updatedUser?.name || user.name,
        userName: updatedUser?.userName || user.userName,
      })

      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Profile Information</span>
        </CardTitle>
        <CardDescription>Update your personal information and preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg">
                {name?.charAt(0) || userName?.charAt(0) || user.email?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{name || userName || "No name set"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">Username</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input id="email" value={user.email} disabled className="pl-10 bg-muted" />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if you need to update your email.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
