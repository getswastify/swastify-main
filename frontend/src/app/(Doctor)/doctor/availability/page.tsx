"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { DoctorAvailabilityManager } from "@/components/doctor/doctor-availability-manager"
import { Loader2 } from "lucide-react"

export default function AvailabilityPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <RoleGuard requiredRole="DOCTOR">
      <div className="w-full max-w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Availability Management</h1>
            <p className="text-muted-foreground">Set and manage your weekly availability for appointments</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DoctorAvailabilityManager />
        )}
      </div>
    </RoleGuard>
  )
}
