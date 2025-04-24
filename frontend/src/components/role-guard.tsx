"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { hasRolePermission, getDashboardByRole } from "@/lib/roles"
import type { UserRole } from "@/lib/roles"

interface RoleGuardProps {
  requiredRole: UserRole
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ requiredRole, children, fallback }: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if not loading and we have definitive authentication state
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      if (user && !hasRolePermission(user.role, requiredRole)) {
        // Redirect to appropriate dashboard if user doesn't have permission
        const dashboardRoute = getDashboardByRole(user.role)
        router.push(dashboardRoute)
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // If not authenticated or doesn't have permission, show fallback or nothing
  if (!isAuthenticated || !user || !hasRolePermission(user.role, requiredRole)) {
    return fallback || null
  }

  // User has permission, render children
  return <>{children}</>
}
