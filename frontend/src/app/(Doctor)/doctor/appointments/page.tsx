"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, ChevronDown, Clock, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  getDoctorAppointments,
  updateAppointmentStatus,
  formatAppointmentTime,
  type DoctorAppointment,
} from "@/actions/appointments"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getVariant = () => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "CANCELLED":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  return (
    <Badge variant="outline" className={`${getVariant()} font-medium`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  )
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<DoctorAppointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Fetch appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getDoctorAppointments()

        if (response.status && response.data?.appointments) {
          setAppointments(response.data.appointments)
          setFilteredAppointments(response.data.appointments)
        } else {
          setError(response.message || "Failed to fetch appointments")
          setAppointments([])
          setFilteredAppointments([])
        }
      } catch (err) {
        console.error("Error fetching appointments:", err)
        setError("An unexpected error occurred while fetching appointments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  // Filter appointments based on search query and status filter
  useEffect(() => {
    let filtered = [...appointments]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (appointment) =>
          appointment.patientName.toLowerCase().includes(query) ||
          appointment.patientEmail.toLowerCase().includes(query) ||
          appointment.patientPhone.includes(query),
      )
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }, [appointments, searchQuery, statusFilter])

  // Handle status update
  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
  ) => {
    setIsUpdating(appointmentId)

    try {
      const response = await updateAppointmentStatus(appointmentId, newStatus)

      if (response.status) {
        // Update the appointment in the local state
        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment.appointmentId === appointmentId ? { ...appointment, status: newStatus } : appointment,
          ),
        )

        toast.success("Status updated", {
          description: `Appointment status has been updated to ${newStatus.toLowerCase()}.`,
        })
      } else {
        toast.error("Failed to update status", {
          description: response.message || "An error occurred while updating the appointment status.",
        })
      }
    } catch (err) {
      console.error("Error updating appointment status:", err)
      toast.error("Error", {
        description: "An unexpected error occurred while updating the appointment status.",
      })
    } finally {
      setIsUpdating(null)
    }
  }


  // Get today's appointments
  const getTodayAppointments = () => {
    const today = new Date().toLocaleDateString()
    return filteredAppointments.filter(
      (appointment) => new Date(appointment.appointmentTime).toLocaleDateString() === today,
    )
  }

  // Get upcoming appointments (excluding today)
  const getUpcomingAppointments = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return filteredAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentTime)
      appointmentDate.setHours(0, 0, 0, 0)
      return appointmentDate > today
    })
  }

  // Get past appointments
  const getPastAppointments = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return filteredAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentTime)
      appointmentDate.setHours(0, 0, 0, 0)
      return appointmentDate < today
    })
  }

  // Render appointment table
  const renderAppointmentTable = (appointments: DoctorAppointment[]) => {
    if (appointments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No appointments found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery || statusFilter
              ? "Try adjusting your filters to see more results."
              : "You don't have any appointments in this category."}
          </p>
        </div>
      )
    }

    return (
      <ScrollArea className="h-[calc(100vh-350px)] rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.appointmentId}>
                <TableCell>
                  <div className="font-medium">{appointment.patientName}</div>
                  <div className="text-sm text-muted-foreground">{appointment.patientEmail}</div>
                  <div className="text-sm text-muted-foreground">{appointment.patientPhone}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{formatAppointmentTime(appointment.appointmentTime)}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={appointment.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isUpdating === appointment.appointmentId}>
                        {isUpdating === appointment.appointmentId ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <>
                            Update Status <ChevronDown className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(appointment.appointmentId, "CONFIRMED")}
                        disabled={appointment.status === "CONFIRMED"}
                        className="text-green-600"
                      >
                        Confirm
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(appointment.appointmentId, "COMPLETED")}
                        disabled={appointment.status === "COMPLETED"}
                        className="text-blue-600"
                      >
                        Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(appointment.appointmentId, "CANCELLED")}
                        disabled={appointment.status === "CANCELLED"}
                        className="text-red-600"
                      >
                        Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    )
  }

  return (
    <RoleGuard requiredRole="DOCTOR">
      <div className="w-full max-w-full space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {statusFilter
                      ? `Filter: ${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}`
                      : "Filter"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("CONFIRMED")}>Confirmed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("COMPLETED")}>Completed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")}>Cancelled</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Schedule</CardTitle>
                <CardDescription>View and manage your upcoming and past appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="today" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                  </TabsList>
                  <TabsContent value="today">{renderAppointmentTable(getTodayAppointments())}</TabsContent>
                  <TabsContent value="upcoming">{renderAppointmentTable(getUpcomingAppointments())}</TabsContent>
                  <TabsContent value="past">{renderAppointmentTable(getPastAppointments())}</TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  )
}
