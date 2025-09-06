"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import type { ReactNode } from "react"

interface ConvexClientProviderProps {
  children: ReactNode
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

  if (!convexUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
          <p className="text-muted-foreground max-w-md">
            Missing NEXT_PUBLIC_CONVEX_URL environment variable. Please add it to your project settings and run `convex
            dev` locally.
          </p>
          <div className="text-sm text-muted-foreground">
            <p>To fix this:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Run `npx convex dev` in your terminal</li>
              <li>Add NEXT_PUBLIC_CONVEX_URL to your environment variables</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  const convex = new ConvexReactClient(convexUrl)

  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
