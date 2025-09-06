"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
interface User {
  userId: string
  email: string
  userName: string
  name?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, userName: string, name?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authToken, setAuthToken] = useState<string | null>(null)

  const loginMutation = useMutation(api.auth.login)
  const registerMutation = useMutation(api.auth.register)
  const logoutMutation = useMutation(api.auth.logout)

  const userFromToken = useQuery(api.auth.verifyToken, authToken ? { authToken } : "skip")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      setAuthToken(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userFromToken !== undefined) {
      setUser(userFromToken)
      setIsLoading(false)
    }
  }, [userFromToken])

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password })
      localStorage.setItem("authToken", result.authToken)
      setAuthToken(result.authToken)
      setUser({
        userId: result.userId,
        email: result.email,
        userName: result.userName,
        name: result.name,
      })
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, userName: string, name?: string) => {
    try {
      const result = await registerMutation({ email, password, userName, name })
      localStorage.setItem("authToken", result.authToken)
      setAuthToken(result.authToken)
      setUser({
        userId: result.userId,
        email: result.email,
        userName: result.userName,
        name: result.name,
      })
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      if (authToken) {
        await logoutMutation({ authToken })
      }
      localStorage.removeItem("authToken")
      setAuthToken(null)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
