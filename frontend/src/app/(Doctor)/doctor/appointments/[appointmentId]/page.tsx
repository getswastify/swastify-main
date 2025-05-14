"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Phone,
  Mail,
  Video,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3,
} from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RoleGuard } from "@/components/role-guard"

interface TimelineEvent {
  id: number
  title: string
  description: string
  timestamp: string
  type: string
}

interface AppointmentDetails {
  appointmentId: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  patientImage?: string | null
  appointmentTime: string
  status: string
  meetLink?: string
  doctorName: string
  doctorSpecialization: string
  doctorEmail: string
  doctorImage?: string | null
  createdAt: string
  updatedAt: string
  reason?: string
  location?: string
  notes?: string
  timeline?: TimelineEvent[]
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
        const error = err as ApiError
        if (error.response?.data) {
          setError(error.response.data.error || error.message || "An error occurred while fetching appointment details")
        } else if (error.message) {
          setError(error.message || "An error occurred while fetching appointment details")
        } else {
          setError("An error occurred while fetching appointment details")
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

  // Format date to "Monday, May 12, 2025" format
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format time to "11:00 AM" format
  const formatTime = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <div className="flex items-center gap-2 text-green-400 bg-green-900/30 px-3 py-1.5 rounded-full">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Confirmed</span>
          </div>
        )
      case "PENDING":
        return (
          <div className="flex items-center gap-2 text-amber-400 bg-amber-900/30 px-3 py-1.5 rounded-full">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Pending</span>
          </div>
        )
      case "CANCELLED":
        return (
          <div className="flex items-center gap-2 text-red-400 bg-red-900/30 px-3 py-1.5 rounded-full">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">Cancelled</span>
          </div>
        )
      case "COMPLETED":
        return (
          <div className="flex items-center gap-2 text-blue-400 bg-blue-900/30 px-3 py-1.5 rounded-full">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Completed</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-2 text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-full">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Unknown</span>
          </div>
        )
    }
  }

  const openMeetLink = () => {
    if (appointment?.meetLink && appointment.meetLink !== "Not Available") {
      window.open(appointment.meetLink, "_blank")
    }
  }

  const isValidMeetLink = (link?: string) => {
    return link && link !== "Not Available" && link.startsWith("http")
  }

  // Get virtual meeting message based on appointment status
  const getVirtualMeetingMessage = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return appointment?.meetLink ? (
          <Button onClick={openMeetLink} className="w-full bg-[#10b981] hover:bg-[#0d9668] text-white">
            <Video className="mr-2 h-4 w-4" />
            Join Video Consultation
          </Button>
        ) : (
          <div className="bg-[#1f2b42] px-4 py-3 rounded-lg text-gray-400 flex items-center">
            <Video className="mr-2 h-4 w-4" />
            <span>Meeting link not available</span>
          </div>
        )
      case "CANCELLED":
        return (
          <div className="bg-[#1f2b42] px-4 py-3 rounded-lg text-gray-400 flex items-center">
            <Video className="mr-2 h-4 w-4" />
            <span>Appointment cancelled</span>
          </div>
        )
      case "COMPLETED":
        return (
          <div className="bg-[#1f2b42] px-4 py-3 rounded-lg text-gray-400 flex items-center">
            <Video className="mr-2 h-4 w-4" />
            <span>Appointment completed</span>
          </div>
        )
      default:
        return (
          <div className="bg-[#1f2b42] px-4 py-3 rounded-lg text-gray-400 flex items-center">
            <Video className="mr-2 h-4 w-4" />
            <span>Not available until appointment is confirmed</span>
          </div>
        )
    }
  }

  // Get timeline icon
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "BOOKED":
        return <Calendar className="h-5 w-5 text-white" />
      case "CONFIRMED":
        return <CheckCircle className="h-5 w-5 text-white" />
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-white" />
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-white" />
      case "STATUS_UPDATED":
        return <AlertCircle className="h-5 w-5 text-white" />
      case "RESCHEDULED":
        return <Clock3 className="h-5 w-5 text-white" />
      default:
        return <AlertCircle className="h-5 w-5 text-white" />
    }
  }

  // Get timeline icon background color
  const getTimelineIconBg = (type: string) => {
    switch (type) {
      case "BOOKED":
        return "bg-blue-500"
      case "CONFIRMED":
        return "bg-green-500"
      case "CANCELLED":
        return "bg-red-500"
      case "COMPLETED":
        return "bg-purple-500"
      case "STATUS_UPDATED":
        return "bg-amber-500"
      case "RESCHEDULED":
        return "bg-indigo-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <RoleGuard requiredRole="DOCTOR">
      <div className="w-full max-w-full bg-[#0c1120] min-h-screen text-white p-4 sm:p-6">
        <Button
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white hover:bg-[#1a2236] w-full sm:w-auto justify-start"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Button>

        {loading ? (
          <AppointmentDetailSkeleton />
        ) : error ? (
          <ErrorState error={error} />
        ) : appointment ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main appointment info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Appointment Details</h1>
                  {getStatusBadge(appointment.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-400 mb-2">Date & Time</h2>
                      <div className="flex items-start gap-3">
                        <div className="bg-[#10b981]/20 p-2 rounded-lg">
                          <Calendar className="h-5 w-5 text-[#10b981]" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-white">{formatDate(appointment.appointmentTime)}</p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <p className="text-gray-300">{formatTime(appointment.appointmentTime)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-400 mb-2">Appointment ID</h2>
                      <p className="text-white bg-[#1f2b42] px-3 py-2 rounded-lg font-mono text-sm break-all">
                        {appointment.appointmentId}
                      </p>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-400 mb-2">Virtual Meeting</h2>
                      {getVirtualMeetingMessage(appointment.status)}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-400 mb-2">Patient Information</h2>
                      <div className="bg-[#1f2b42] rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-blue-500/20 h-12 w-12 rounded-full flex items-center justify-center overflow-hidden">
                            {appointment.patientImage ? (
                              <img
                                src={appointment.patientImage || "/placeholder.svg"}
                                alt={appointment.patientName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-400 font-bold text-lg">
                                {appointment.patientName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{appointment.patientName}</h3>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {appointment.patientEmail && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="break-all">{appointment.patientEmail}</span>
                            </div>
                          )}
                          {appointment.patientPhone && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span>{appointment.patientPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-400 mb-2">Doctor Information</h2>
                      <div className="bg-[#1f2b42] rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-[#10b981]/20 h-12 w-12 rounded-full flex items-center justify-center overflow-hidden">
                            {appointment.doctorImage ? (
                              <img
                                src={appointment.doctorImage || "/placeholder.svg"}
                                alt={appointment.doctorName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[#10b981] font-bold text-lg">
                                {appointment.doctorName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{appointment.doctorName}</h3>
                            <p className="text-[#10b981]">{appointment.doctorSpecialization}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="break-all">{appointment.doctorEmail}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {appointment.reason && (
                  <div className="mt-6">
                    <h2 className="text-lg font-medium text-gray-400 mb-2">Reason for Visit</h2>
                    <div className="bg-[#1f2b42] rounded-lg p-4 text-gray-300">{appointment.reason}</div>
                  </div>
                )}

                {appointment.notes && (
                  <div className="mt-6">
                    <h2 className="text-lg font-medium text-gray-400 mb-2">Notes</h2>
                    <div className="bg-[#1f2b42] rounded-lg p-4 text-gray-300">{appointment.notes}</div>
                  </div>
                )}
              </div>

              {/* Appointment actions */}
              <div className="bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-xl p-4 sm:p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Appointment Actions</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Update Status</label>
                    <Select defaultValue={appointment.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="bg-[#1f2b42] border-gray-700 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1f2b42] border-gray-700 text-white">
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isValidMeetLink(appointment.meetLink) ? (
                    <Button className="w-full bg-[#10b981] hover:bg-[#0d9668] text-white" onClick={openMeetLink}>
                      <Video className="h-4 w-4 mr-2" />
                      Join Video Consultation
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-[#10b981] hover:bg-[#0d9668] text-white"
                      disabled={appointment.status !== "CONFIRMED"}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Start Consultation
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline and additional info */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-xl p-4 sm:p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6">Appointment Timeline</h2>

                {/* Timeline UI using the API data */}
                <div className="relative">
                  {appointment.timeline && appointment.timeline.length > 0 ? (
                    appointment.timeline.map((event, index, array) => (
                      <div key={event.id} className="relative">
                        {/* Timeline connector line */}
                        {index < array.length - 1 && (
                          <div
                            className={`absolute left-[15px] top-[30px] w-[2px] h-[calc(100%-10px)] bg-gradient-to-b from-${getTimelineIconBg(
                              event.type,
                            ).replace("bg-", "")} to-gray-600`}
                          ></div>
                        )}

                        <div className="flex items-start mb-6">
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full ${getTimelineIconBg(
                              event.type,
                            )} flex items-center justify-center z-10`}
                          >
                            {getTimelineIcon(event.type)}
                          </div>

                          {/* Content */}
                          <div className="ml-4 flex-1">
                            <h3 className="text-white font-medium">{event.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">{event.description}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(event.timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400">No timeline events available</p>
                    </div>
                  )}

                  {/* Add scheduled appointment time to timeline if not cancelled */}
                  {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && (
                    <div className="relative">
                      <div className="flex items-start mb-6">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center z-10">
                          <Clock3 className="h-5 w-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="ml-4 flex-1">
                          <h3 className="text-white font-medium">Scheduled Appointment</h3>
                          <p className="text-gray-400 text-sm mt-1">
                            Upcoming appointment with {appointment.patientName}
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(appointment.appointmentTime).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-xl p-4 sm:p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  {appointment.status === "CONFIRMED" && (
                    <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                      <FileText className="mr-2 h-4 w-4" />
                      Add Medical Notes
                    </Button>
                  )}
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Patient
                  </Button>
                  {appointment.status === "COMPLETED" && (
                    <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                      <FileText className="mr-2 h-4 w-4" />
                      View Medical Records
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-xl p-8 shadow-lg text-center">
            <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Appointment Not Found</h2>
            <p className="text-gray-400 mb-6">
              The appointment you are looking for does not exist or you do not have access to it.
            </p>
            <Button
              onClick={() => router.push("/doctor/appointments")}
              className="bg-[#10b981] hover:bg-[#0d9668] text-white"
            >
              View All Appointments
            </Button>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}

const AppointmentDetailSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <Skeleton className="h-8 w-64 bg-gray-700" />
          <Skeleton className="h-8 w-32 bg-gray-700 rounded-full mt-2 md:mt-0" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-32 bg-gray-700 mb-2" />
              <div className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 bg-gray-700 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-7 w-full bg-gray-700 mb-2" />
                  <Skeleton className="h-5 w-32 bg-gray-700" />
                </div>
              </div>
            </div>

            <div>
              <Skeleton className="h-6 w-40 bg-gray-700 mb-2" />
              <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
            </div>

            <div>
              <Skeleton className="h-6 w-40 bg-gray-700 mb-2" />
              <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-40 bg-gray-700 mb-2" />
              <div className="bg-[#1f2b42] rounded-lg p-4">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-12 w-12 bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-40 bg-gray-700 mb-2" />
                    <Skeleton className="h-5 w-32 bg-gray-700" />
                  </div>
                </div>
                <Skeleton className="h-5 w-full bg-gray-700 mb-2" />
                <Skeleton className="h-5 w-full bg-gray-700" />
              </div>
            </div>

            <div>
              <Skeleton className="h-6 w-40 bg-gray-700 mb-2" />
              <div className="bg-[#1f2b42] rounded-lg p-4">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-12 w-12 bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-40 bg-gray-700 mb-2" />
                  </div>
                </div>
                <Skeleton className="h-5 w-full bg-gray-700 mb-2" />
                <Skeleton className="h-5 w-full bg-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-xl p-4 sm:p-6 shadow-lg">
        <Skeleton className="h-7 w-48 bg-gray-700 mb-4" />
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 flex-1 bg-gray-700 rounded-md" />
          <Skeleton className="h-10 flex-1 bg-gray-700 rounded-md" />
        </div>
      </div>
    </div>

    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-xl p-4 sm:p-6 shadow-lg">
        <Skeleton className="h-7 w-48 bg-gray-700 mb-4" />
        <div className="space-y-6">
          <div className="flex items-start">
            <Skeleton className="h-8 w-8 bg-gray-700 rounded-full" />
            <div className="ml-4 flex-1">
              <Skeleton className="h-6 w-40 bg-gray-700 mb-2" />
              <Skeleton className="h-4 w-full bg-gray-700 mb-1" />
              <Skeleton className="h-3 w-24 bg-gray-700" />
            </div>
          </div>
          <div className="flex items-start">
            <Skeleton className="h-8 w-8 bg-gray-700 rounded-full" />
            <div className="ml-4 flex-1">
              <Skeleton className="h-6 w-40 bg-gray-700 mb-2" />
              <Skeleton className="h-4 w-full bg-gray-700 mb-1" />
              <Skeleton className="h-3 w-24 bg-gray-700" />
            </div>
          </div>
          <div className="flex items-start">
            <Skeleton className="h-8 w-8 bg-gray-700 rounded-full" />
            <div className="ml-4 flex-1">
              <Skeleton className="h-6 w-40 bg-gray-700 mb-2" />
              <Skeleton className="h-4 w-full bg-gray-700 mb-1" />
              <Skeleton className="h-3 w-24 bg-gray-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-xl p-4 sm:p-6 shadow-lg">
        <Skeleton className="h-7 w-32 bg-gray-700 mb-4" />
        <Skeleton className="h-10 w-full bg-gray-700 rounded-md mb-3" />
        <Skeleton className="h-10 w-full bg-gray-700 rounded-md" />
      </div>
    </div>
  </div>
)

const ErrorState = ({ error }: { error: string }) => (
  <div className="bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-xl p-8 shadow-lg text-center">
    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
    <h2 className="text-xl font-bold text-white mb-2">Error</h2>
    <p className="text-gray-400 mb-6">{error}</p>
    <Button onClick={() => window.location.reload()} className="bg-[#10b981] hover:bg-[#0d9668] text-white">
      Try Again
    </Button>
  </div>
)

export default AppointmentDetailsPage
