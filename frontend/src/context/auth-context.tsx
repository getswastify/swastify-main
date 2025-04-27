"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/types/auth"
import api from "@/lib/axios"
import type { AxiosError } from "axios"
import { setCookie, deleteCookie } from "@/lib/cookies"

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
  hasRole: (role: string) => boolean
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Safe error logging function that only logs in development
const safeLogError = (message: string, error: unknown): void => {
  // Only log in development, never in production
  if (process.env.NODE_ENV === "development") {
    console.error(message, error)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()
  const pathname = usePathname()

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    if (!state.user) return false
    return state.user.role === role
  }

  // Login function
  const login = async (email: string, password: string): Promise<{ status: boolean; message: string }> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      const response = await api.post("/auth/login", { email, password })

      if (response.data.status) {
        // After successful login, fetch the user data
        try {
          const userResponse = await api.get("/auth/getuser-details")

          if (userResponse.data.status) {
            const userData = userResponse.data.data

            // Store user role in cookie
            if (userData?.role) {
              setCookie("user_role", userData.role, 7) // 7 days expiry
            }

            setState({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            })

            return { status: true, message: response.data.message || "Login successful" }
          }
        } catch (error) {
          safeLogError("Error fetching user data after login:", error)
        }

        // Even if we couldn't get user data, still consider login successful
        const userData = response.data.data?.user || null

        // Store user role in cookie
        if (userData?.role) {
          setCookie("user_role", userData.role, 7) // 7 days expiry
        }

        setState({
          user: userData,
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
    } catch (error: unknown) {
      const axiosError = error as AxiosError

      safeLogError("Login error:", axiosError)

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      // fallback message handling
      const errorMessage =
        (axiosError.response?.data as { message?: string })?.message ||
        axiosError.message ||
        "An unexpected error occurred"

      return {
        status: false,
        message: errorMessage,
      }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call the logout API first
      await api.post("/auth/logout")

      // Update state
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      // Delete cookies (server should also clear the HTTP-only cookies)
      deleteCookie("user_role")

      // Finally, navigate to login page
      router.push("/login")
    } catch (error) {
      safeLogError("Logout error:", error)

      // Even if API call fails, clear state and cookies
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      // Delete cookies
      deleteCookie("user_role")

      // Still redirect to login
      router.push("/login")
    }
  }

  // Check authentication status on mount and pathname change
  useEffect(() => {
    const checkAuth = async () => {
      // Skip authentication check on public routes
      const publicRoutes = ["/login", "/register", "/verify-otp", "/forgot-password", "/reset-password", "/"]
      const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

      // Check if we already have user data in state
      if (state.user && state.isAuthenticated) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      // Don't make the API call if we're on a public route
      if (isPublicRoute) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      try {
        // Only make API call on protected routes
        const response = await api.get("/auth/getuser-details")

        if (response.data.status && response.data.data) {
          const userData = response.data.data

          // Store user role in cookie
          if (userData?.role) {
            setCookie("user_role", userData.role, 7) // 7 days expiry
          }

          setState({
            user: userData,
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
        safeLogError("Authentication check error:", error)

        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    checkAuth()

    // Add cleanup function to prevent memory leaks
    return () => {
      // Cancel any pending requests if component unmounts
    }
  }, [pathname, state.user, state.isAuthenticated])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasRole,
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
