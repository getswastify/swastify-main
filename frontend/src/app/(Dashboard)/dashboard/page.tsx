"use client"

import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserNav } from "@/components/user-nav"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  // If not authenticated and not loading, redirect to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // If not authenticated, don't render anything (will be redirected by useEffect)
  if (!isAuthenticated || !user) {
    return null
  }

  // Show dashboard
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <UserNav />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.firstName || "User"}!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {user.firstName || ""} {user.lastName || ""}
            </p>
            <p>
              <strong>Email:</strong> {user.email || ""}
            </p>
            <p>
              <strong>User ID:</strong> {user.id || ""}
            </p>
            <p>
              <strong>Role:</strong> {user.role || ""}
            </p>
            {user.phone && (
              <p>
                <strong>Phone:</strong> {user.phone}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
