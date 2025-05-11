"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoleGuard } from "@/components/role-guard"
import { useRouter } from "next/navigation"
import { Calendar, Plus, ArrowUpRight, X } from "lucide-react"
import { getPatientAppointments, type Appointment } from "@/actions/appointments"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import api from "@/lib/axios"

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const router = useRouter()

  // Fetch appointments when activeTab changes
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      setAppointments([]) // Clear previous appointments when switching tabs

      try {
        const response = await getPatientAppointments(activeTab) // Fetch based on activeTab (status)
        if (response.appointments.length === 0) {
          toast.info(`No ${activeTab} appointments found.`)
        }
        setAppointments(response.appointments)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        // toast.error("Failed to load appointments");
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [activeTab]) // Trigger fetch when activeTab changes

  return (
    <RoleGuard requiredRole="USER">
      <div className="w-full max-w-full bg-[#0c1120] min-h-screen text-white p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Appointments</h1>
            <p className="text-gray-400">View and manage your appointments</p>
          </div>
          <Button
            onClick={() => router.push("/patient/book-appointment")}
            className="mt-4 md:mt-0 bg-[#10b981] hover:bg-[#0d9668] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Book New Appointment
          </Button>
        </div>

        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex justify-between bg-[#1a2236] rounded-lg p-1 mb-6">
            <TabsTrigger
              value="upcoming"
              className="flex-1 rounded-md data-[state=active]:bg-[#0c1120] data-[state=active]:text-white data-[state=inactive]:text-gray-400"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="flex-1 rounded-md data-[state=active]:bg-[#0c1120] data-[state=active]:text-white data-[state=inactive]:text-gray-400"
            >
              Past
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="flex-1 rounded-md data-[state=active]:bg-[#0c1120] data-[state=active]:text-white data-[state=inactive]:text-gray-400"
            >
              Cancelled
            </TabsTrigger>
          </TabsList>

          {/* Handle the Content for Each Tab */}
          <TabsContent value="upcoming">
            {isLoading ? (
              <AppointmentsSkeleton />
            ) : appointments.length === 0 ? (
              <EmptyState message="No upcoming appointments" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {appointments.map((appointment) => (
                  <AppointmentCard key={appointment.appointmentId} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {isLoading ? (
              <AppointmentsSkeleton />
            ) : appointments.length === 0 ? (
              <EmptyState message="No past appointments" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {appointments.map((appointment) => (
                  <AppointmentCard key={appointment.appointmentId} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {isLoading ? (
              <AppointmentsSkeleton />
            ) : appointments.length === 0 ? (
              <EmptyState message="No cancelled appointments" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {appointments.map((appointment) => (
                  <AppointmentCard key={appointment.appointmentId} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}

const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const router = useRouter()

  const handleCancelAppointment = async () => {
    try {
      await api.delete(`/patient/cancel-appointment/${appointment.appointmentId}`)
      setShowCancelDialog(false)
      toast.success("Appointment cancelled successfully")
    } catch (error) {
      console.error(error)
      // toast.error("Failed to cancel appointment");
    }
  }

  // Format date to "May 12, 2025" format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format time to "11:00 AM" format
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Get day of week
  const getDayOfWeek = () => {
    const date = new Date(appointment.appointmentTime)
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-900/50 text-green-400">Confirmed</span>
        )
      case "PENDING":
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-900/50 text-amber-400">Pending</span>
        )
      case "CANCELLED":
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-900/50 text-red-400">Cancelled</span>
      case "COMPLETED":
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-900/50 text-blue-400">Completed</span>
        )
      default:
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-800 text-gray-400">Unknown</span>
    }
  }


  return (
    <div
      className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all  relative bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67]}`}
    >
      <div className="p-5 relative">
        {/* Day of week at top */}
        <div className="flex items-center text-[#4d9fff] mb-4">
          <Calendar className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">{getDayOfWeek()}</span>
        </div>

        {/* Cancel button in top right */}
        {(appointment.status === "CONFIRMED" || appointment.status === "PENDING") && (
          <button
            className="absolute top-5 right-5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full p-1.5 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              setShowCancelDialog(true)
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Large date and time */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{formatDate(appointment.appointmentTime)}</h2>
          <p className="text-xl text-white font-medium">{formatTime(appointment.appointmentTime)}</p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-lg font-medium text-white">{appointment.doctorName}</h3>
            <p className="text-gray-400 text-sm mb-3">{appointment.doctorSpecialization}</p>
            {getStatusBadge(appointment.status)}
          </div>

          {/* Arrow button in bottom right corner - styled like the sketch */}
          <div className="relative cursor-pointer">
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full border-2 border-[#4d9fff] flex items-center justify-center bg-[#1a2236]">
              <ArrowUpRight
                className="h-5 w-5 text-[#4d9fff]"
                onClick={() => router.push(`/patient/appointments/${appointment.appointmentId}`)}
              />
            </div>
          </div>
        </div>

        {/* Cancel dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="bg-[#1a2236] text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to cancel this appointment?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                No, Keep It
              </Button>
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCancelAppointment()
                }}
              >
                Yes, Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center p-10 text-center bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-lg">
    <Calendar className="h-16 w-16 text-gray-500 mb-4" />
    <h3 className="text-xl font-medium text-white mb-2">{message}</h3>
    <p className="text-gray-400 mb-6">Schedule an appointment to get started</p>
    <Button className="bg-[#10b981] hover:bg-[#0d9668] text-white">
      <Plus className="mr-2 h-4 w-4" />
      Book an Appointment
    </Button>
  </div>
)

const AppointmentsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-gradient-to-br from-[#1a2236] via-[#1e2b45] to-[#2c3e67] rounded-xl p-5 shadow-md relative"
      >
        <Skeleton className="h-5 w-24 bg-gray-700 mb-4" />

        <Skeleton className="h-8 w-40 bg-gray-700 mb-2" />
        <Skeleton className="h-7 w-32 bg-gray-700 mb-6" />

        <div className="flex justify-between items-end">
          <div>
            <Skeleton className="h-6 w-36 bg-gray-700" />
            <Skeleton className="h-4 w-24 mt-2 mb-3 bg-gray-700" />
            <Skeleton className="h-6 w-20 rounded-full bg-gray-700" />
          </div>
          <div className="relative">
            <div className="absolute -bottom-5 -right-5 w-12 h-12 rounded-full bg-gray-700" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

export default AppointmentsPage
