"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { bookAppointment, formatAppointmentTime, type TimeSlot } from "@/actions/appointments"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { Loader2, Calendar, Clock, User, CheckCircle } from "lucide-react"

interface BookingConfirmationProps {
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  selectedDate: Date | undefined
  selectedTimeSlot: TimeSlot | null
  onReset: () => void
}

export function BookingConfirmation({
  doctorId,
  doctorName,
  doctorSpecialty,
  selectedDate,
  selectedTimeSlot,
  onReset,
}: BookingConfirmationProps) {
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleBookAppointment = async () => {
    if (!user?.id || !doctorId || !selectedTimeSlot || !selectedDate) {
      toast.error("Missing required information for booking")
      return
    }

    setIsBooking(true)
    try {
      await bookAppointment(user.id, doctorId, selectedTimeSlot.startTime)
      setIsBooked(true)
      toast.success("Appointment booked successfully!")
    } catch (error) {
      console.error("Error booking appointment:", error)
      toast.error("Failed to book appointment. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  const handleViewAppointments = () => {
    router.push("/patient/appointments")
  }

  const handleBookAnother = () => {
    onReset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Appointment</CardTitle>
        <CardDescription>Review your appointment details before confirming</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isBooked ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Appointment Booked!</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Your appointment has been successfully booked. You can view all your appointments in the appointments
              section.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Doctor</h3>
                <p className="text-muted-foreground">{doctorName}</p>
                <p className="text-sm text-muted-foreground">{doctorSpecialty}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Date</h3>
                <p className="text-muted-foreground">
                  {selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Time</h3>
                <p className="text-muted-foreground">
                  {selectedTimeSlot
                    ? `${formatAppointmentTime(selectedTimeSlot.startTime)} - ${formatAppointmentTime(
                        selectedTimeSlot.endTime,
                      )}`
                    : "No time selected"}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        {isBooked ? (
          <>
            <Button onClick={handleViewAppointments} className="w-full sm:w-auto">
              View My Appointments
            </Button>
            <Button onClick={handleBookAnother} variant="outline" className="w-full sm:w-auto">
              Book Another Appointment
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleBookAppointment} disabled={isBooking} className="w-full sm:w-auto">
              {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Booking
            </Button>
            <Button onClick={onReset} variant="outline" className="w-full sm:w-auto">
              Start Over
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
