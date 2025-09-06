"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  userId: string
  email: string
  userName: string
  name?: string
}

interface AuthState {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user: User) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "auth-storage" }
  )
)