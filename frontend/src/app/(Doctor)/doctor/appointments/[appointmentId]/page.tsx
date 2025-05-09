"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api from "@/lib/axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, User, FileText, Phone, Mail, Video, ExternalLink, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RoleGuard } from "@/components/role-guard"

interface AppointmentDetails {
  appointmentId: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  appointmentTime: string
  status: string
  meetLink?: string
  doctorName: string
  doctorSpecialization: string
  doctorEmail: string
  createdAt: string
  updatedAt: string
  reason?: string
  location?: string
  notes?: string
}

interface ApiError {
  response?: {
    data?: {
      error?: string
      message?: string
    }
  }
  message?: string
}

const AppointmentDetailsPage = () => {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/doctor/appointment-details/${appointmentId}`)

        if (response.data.status) {
          setAppointment(response.data.data)
          setError(null)
        } else {
          setError(response.data.message || "Failed to fetch appointment details")
        }
      } catch (err) {
        const error = err as ApiError;
        if (error.response?.data) {
          setError(error.response.data.error || error.message || "An error occurred while fetching appointment details");
        } else if (error.message) {
          setError(error.message || "An error occurred while fetching appointment details");
        } else {
          setError("An error occurred while fetching appointment details");
        }
        toast.error("Failed to load appointment details")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointmentDetails()
  }, [appointmentId])

  const handleStatusChange = async (value: string) => {
    try {
      await api.put("/doctor/update-appointment-status", {
        appointmentId,
        status: value,
      })

      // Update local state
      if (appointment) {
        setAppointment({
          ...appointment,
          status: value,
        })
      }

      toast.success("Status updated successfully!")
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
    }
  }

  // Format the appointment date and time
  const formatAppointmentDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatAppointmentTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const openMeetLink = () => {
    if (appointment?.meetLink && appointment.meetLink !== "Not Available") {
      window.open(appointment.meetLink, "_blank")
    }
  }

  const isValidMeetLink = (link?: string) => {
    return link && link !== "Not Available" && link.startsWith("http")
  }

  return (
    <RoleGuard requiredRole="DOCTOR">
      <div className="container mx-auto py-4 px-4 md:px-6 md:py-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-1 w-fit bg-gray-800/80 hover:bg-gray-700 text-white border-gray-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Appointments
            </Button>

            {appointment && (
              <Badge
                className={`${getStatusColor(appointment.status)} px-3 py-1 rounded-full text-sm w-fit self-start sm:self-auto`}
              >
                {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">Appointment Details</h1>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} />
          ) : appointment ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90 shadow-xl backdrop-blur-sm">
                <CardHeader className="border-b border-gray-700/50">
                  <CardTitle className="text-xl text-white">Patient Information</CardTitle>
                  <CardDescription className="text-gray-400">Details about the patient and appointment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-2 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{appointment.patientName}</p>
                      </div>
                    </div>

                    {(appointment.patientEmail || appointment.patientPhone) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                        {appointment.patientEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-300">{appointment.patientEmail}</span>
                          </div>
                        )}
                        {appointment.patientPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-300">{appointment.patientPhone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator className="bg-gray-700/50" />

                  <div className="space-y-4">
                    <h3 className="font-medium text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Appointment Schedule
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {formatAppointmentDate(appointment.appointmentTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-800/50 p-3 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {formatAppointmentTime(appointment.appointmentTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isValidMeetLink(appointment.meetLink) ? (
                    <>
                      <Separator className="bg-gray-700/50" />
                      <div className="space-y-4">
                        <h3 className="font-medium text-white flex items-center gap-2">
                          <Video className="h-4 w-4 text-primary" />
                          Video Consultation
                        </h3>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 hover:border-primary/50 transition-all duration-300">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">Google Meet</span>
                              <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                                Online
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <a
                                href={appointment.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:text-primary/80 hover:underline flex items-center gap-1 transition-colors"
                              >
                                {(appointment.meetLink ?? "").substring(0, 30)}...
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 bg-primary/10 border-primary/30 hover:bg-primary/20 text-primary w-fit"
                              onClick={openMeetLink}
                            >
                              <Video className="h-3.5 w-3.5 mr-1" />
                              Join Meeting
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : appointment.status === "CONFIRMED" ? (
                    <>
                      <Separator className="bg-gray-700/50" />
                      <div className="space-y-4">
                        <h3 className="font-medium text-white flex items-center gap-2">
                          <Video className="h-4 w-4 text-primary" />
                          Video Consultation
                        </h3>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                          <div className="flex items-center gap-2 text-gray-300">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">
                              Video consultation link is not available yet. It will be generated closer to the
                              appointment time.
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {appointment.reason && (
                    <>
                      <Separator className="bg-gray-700/50" />
                      <div className="space-y-3">
                        <h3 className="font-medium text-white flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Reason for Visit
                        </h3>
                        <p className="text-sm text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                          {appointment.reason}
                        </p>
                      </div>
                    </>
                  )}

                  {appointment.notes && (
                    <>
                      <Separator className="bg-gray-700/50" />
                      <div className="space-y-3">
                        <h3 className="font-medium text-white flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Notes
                        </h3>
                        <p className="text-sm text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                          {appointment.notes}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="h-fit">
                <Card className="border-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90 shadow-xl backdrop-blur-sm">
                  <CardHeader className="border-b border-gray-700/50">
                    <CardTitle className="text-xl text-white">Actions</CardTitle>
                    <CardDescription className="text-gray-400">Manage this appointment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Update Status</label>
                      <Select defaultValue={appointment.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4">
                      {isValidMeetLink(appointment.meetLink) ? (
                        <Button className="w-full gradient-button" onClick={openMeetLink}>
                          <Video className="h-4 w-4 mr-2" />
                          Join Video Consultation
                        </Button>
                      ) : (
                        <Button className="w-full gradient-button" disabled={appointment.status !== "CONFIRMED"}>
                          Start Consultation
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </RoleGuard>
  )
}

const LoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card className="md:col-span-2 border-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90 shadow-xl">
      <CardHeader className="border-b border-gray-700/50">
        <Skeleton className="h-6 w-48 bg-gray-800" />
        <Skeleton className="h-4 w-72 mt-2 bg-gray-800" />
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-40 bg-gray-800" />
            <Skeleton className="h-6 w-24 bg-gray-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-5 w-full bg-gray-800" />
            <Skeleton className="h-5 w-full bg-gray-800" />
          </div>
        </div>
        <Skeleton className="h-px w-full bg-gray-700" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-40 bg-gray-800" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-5 w-full bg-gray-800" />
            <Skeleton className="h-5 w-full bg-gray-800" />
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="h-fit">
      <Card className="border-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90 shadow-xl">
        <CardHeader className="border-b border-gray-700/50">
          <Skeleton className="h-6 w-24 bg-gray-800" />
          <Skeleton className="h-4 w-40 mt-2 bg-gray-800" />
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-10 w-full bg-gray-800" />
          <Skeleton className="h-10 w-full mt-4 bg-gray-800" />
          <Skeleton className="h-10 w-full bg-gray-800" />
        </CardContent>
      </Card>
    </div>
  </div>
)

const ErrorState = ({ error }: { error: string }) => (
  <Card className="w-full border-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90 shadow-xl">
    <CardHeader className="border-b border-gray-700/50">
      <CardTitle className="text-red-500">Error</CardTitle>
    </CardHeader>
    <CardContent className="pt-6">
      <p className="text-gray-300">{error}</p>
      <Button onClick={() => window.location.reload()} className="mt-4 gradient-button">
        Try Again
      </Button>
    </CardContent>
  </Card>
)

export default AppointmentDetailsPage
