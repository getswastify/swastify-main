"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RoleGuard } from "@/components/role-guard"
import { getDoctorDashboard } from "@/actions/dashboard"
import { AlertCircle, CheckCircle, User, Calendar, Users, Clock, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/context/auth-context"
import { VerificationStatusBadge } from "@/components/verification-status-badge"

export default function DoctorDashboardPage() {
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDoctorDashboard()
        // Check for either isProfile or isProfileComplete
        setIsProfileComplete(response.data?.isProfile || response.data?.isProfileComplete || false)
        setVerificationStatus(response.data?.isVerified)
      } catch (error) {
        console.error("Error fetching dashboard:", error)
        setIsProfileComplete(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Function to render verification status alert
  const renderVerificationAlert = () => {
    if (!verificationStatus) return null

    switch (verificationStatus) {
      case "APPROVED":
        return (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Profile Verified</AlertTitle>
            <AlertDescription>Your doctor profile has been verified and approved.</AlertDescription>
          </Alert>
        )
      case "REJECTED":
        return (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              Your profile verification was rejected. Please update your information and contact support.
            </AlertDescription>
          </Alert>
        )
      case "PENDING":
      default:
        return (
          <Alert className="border-yellow-500 bg-yellow-500/10">
            <Clock className="h-4 w-4 text-yellow-500" />
            <AlertTitle>Verification Pending</AlertTitle>
            <AlertDescription>
              Your doctor profile is awaiting verification. You will be notified once it is approved.
            </AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <RoleGuard requiredRole="DOCTOR">
      <div className="w-full max-w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your doctor dashboard, Dr. {user?.lastName || "User"}</p>
          </div>
          {!isLoading && verificationStatus && (
            <VerificationStatusBadge status={verificationStatus} className="mt-2 md:mt-0" />
          )}
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            {isProfileComplete === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Profile Incomplete</AlertTitle>
                <AlertDescription>
                  Your doctor profile is incomplete. Please complete your profile to access all features.
                </AlertDescription>
              </Alert>
            )}

            {isProfileComplete === true && renderVerificationAlert()}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-background">
                <CardHeader className="pb-2">
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Manage your professional information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-20 items-center justify-center rounded-md bg-primary/10">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button
                    className="w-full"
                    onClick={() => router.push("/doctor/profile")}
                    variant={isProfileComplete ? "outline" : "default"}
                  >
                    {isProfileComplete ? "View Profile" : "Complete Profile"}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/40 dark:to-background">
                <CardHeader className="pb-2">
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>Manage your appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-20 items-center justify-center rounded-md bg-blue-500/10">
                    <Calendar className="h-10 w-10 text-blue-500" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={verificationStatus !== "APPROVED"}
                    onClick={() => router.push("/doctor/appointments")}
                  >
                    View Appointments
                  </Button>
                </CardFooter>
              </Card>

              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/40 dark:to-background">
                <CardHeader className="pb-2">
                  <CardTitle>Patients</CardTitle>
                  <CardDescription>Manage your patients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-20 items-center justify-center rounded-md bg-purple-500/10">
                    <Users className="h-10 w-10 text-purple-500" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button className="w-full" variant="outline" disabled={verificationStatus !== "APPROVED"}>
                    View Patients
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {verificationStatus !== "APPROVED" && (
              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800">
                <p className="font-medium">Note:</p>
                <p>
                  Some features are limited until your profile is verified. We will review your information as soon as
                  possible.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </RoleGuard>
  )
}
