import type React from "react"
import type { Metadata } from "next"
import { ConvexClientProvider } from "@/components/ConvexClientProvider"
import { Toaster } from "react-hot-toast";

import { Suspense } from "react"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "SynergySphere - Team Collaboration Platform",
  description: "Advanced team collaboration and project management",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans`}>
        <Toaster />
        <ConvexClientProvider>
          <ClerkProvider>


          <Suspense fallback={null}>
            {children}
          </Suspense>

          </ClerkProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
