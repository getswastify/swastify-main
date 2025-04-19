"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/auth"

// Define the auth state interface
interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Define the auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Your backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL|| "http://localhost:3001"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include", // This ensures cookies are received
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.status) {
        // After successful login, fetch the user data
        try {
          const userResponse = await fetch(`${API_URL}/auth/getuser-details`, {
            credentials: "include",
          })

          if (userResponse.ok) {
            const userData = await userResponse.json()
            if (userData && userData.data && userData.data.user) {
              setState({
                user: userData.data.user,
                isAuthenticated: true,
                isLoading: false,
              })
              return true
            }
          }

          // If we couldn't get user data, still consider login successful
          setState({
            user: null,
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        } catch (error) {
          console.error("Error fetching user data after login:", error)
          // Still consider login successful even if we couldn't get user data
          setState({
            user: null,
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        }
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      return false
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // First set the state to prevent flashing of error messages
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      // Then navigate to login page
      router.push("/login")

      // Finally, call the logout API
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
      // Already navigated to login page, so no need to do anything else
    }
  }

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/getuser-details`, {
          credentials: "include",
        })

        if (!response.ok) {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
          return
        }

        const data = await response.json()

        if (data && data.data && data.data.user) {
          setState({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
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
