"use client"
import React from 'react'
import { Input } from '../ui/input'
import { NotificationBell } from '../notifications/notification-bell'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { SignOutButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

function Header() {
    const { user ,isLoaded , isSignedIn} = useUser()
      const router = useRouter()
  return (
            <header className="border-t border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className=" mx-auto px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Input placeholder="Search..."/>
                  </div>
                  <div className="flex items-center space-x-4">
                    <NotificationBell />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/profile")}
                      className="flex items-center space-x-2"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {user?.fullName?.charAt(0) || user?.firstName?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">
                        {user?.fullName || user?.firstName}
                      </span>
                    </Button>
                    <SignOutButton/>
                  </div>
                </div>
              </div>
            </header>
    
  )
}

export default Header