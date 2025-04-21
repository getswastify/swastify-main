"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/auth"
import api from "@/lib/axios"


// Define the auth state interface
interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Define the auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ status: boolean; message: string }>
  logout: () => Promise<void>
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to check if a token exists
const hasAuthToken = (): boolean => {
  if (typeof window === "undefined") return false

  // We can only reliably check localStorage from client-side JavaScript
  // since httpOnly cookies are not accessible via document.cookie
  return !!localStorage.getItem("auth_token")
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  // Login function
  const login = async (email: string, password: string): Promise<{ status: boolean; message: string }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      const response = await api.post("/auth/login", { email, password })
      console.log("Login response:", response.data)

      if (response.data.status) {
        // After successful login, fetch the user data
        try {
          const userResponse = await api.get("/auth/getuser-details")
          console.log("User details response:", userResponse.data)

          if (userResponse.data.status) {
            setState({
              user: userResponse.data.data.user,
              isAuthenticated: true,
              isLoading: false,
            })
            return { status: true, message: response.data.message || "Login successful" }
          }
        } catch (error) {
          console.error("Error fetching user data after login:", error)
        }

        // Even if we couldn't get user data, still consider login successful
        setState({
          user: response.data.data?.user || null,
          isAuthenticated: true,
          isLoading: false,
        })
        return { status: true, message: response.data.message || "Login successful" }
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return {
          status: false,
          message: response.data.message || "Login failed",
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      // Extract error message from axios error response
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred"
      return {
        status: false,
        message: errorMessage,
      }
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
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
      // Already navigated to login page, so no need to do anything else
    }
  }

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Always make a lightweight API call to check authentication status
        // The cookie will be sent automatically with the request
        const response = await api.get("/auth/getuser-details")

        if (response.data.status && response.data.data?.user) {
          // If successful, update localStorage with token if it doesn't exist
          // This helps with our client-side checks
          if (typeof window !== "undefined" && !localStorage.getItem("auth_token") && response.data.data?.token) {
            localStorage.setItem("auth_token", response.data.data.token)
          }

          setState({
            user: response.data.data.user,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          // Clear any stale token in localStorage
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token")
          }

          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (error) {
        // On error, clear localStorage and set unauthenticated
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token")
        }

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
