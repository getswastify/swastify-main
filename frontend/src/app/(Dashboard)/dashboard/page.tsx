"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { logout } from "@/actions/auth"

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/logout")
  }

  return (
    <div className="container py-10 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Welcome to your Swastify dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You are now logged in to the application.</p>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
