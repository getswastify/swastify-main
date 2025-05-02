"use client"

import { useState } from "react"
import { DoctorSearch } from "@/components/patient/appointment-booking/doctor-search"
import { AppointmentCalendar } from "@/components/patient/appointment-booking/appointment-calendar"
import { TimeSlotPicker } from "@/components/patient/appointment-booking/time-slot-picker"
import { BookingConfirmation } from "@/components/patient/appointment-booking/booking-confirmation"
import { RoleGuard } from "@/components/role-guard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Calendar, Clock, CheckCircle, User } from "lucide-react"
import type { TimeSlot } from "@/actions/appointments"
import { useRouter } from "next/navigation"

export default function BookAppointmentPage() {
  const [activeTab, setActiveTab] = useState("doctor")
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const router = useRouter()

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)

    // Reset time slot when date changes
    setSelectedTimeSlot(null)
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot | null) => {
    setSelectedTimeSlot(timeSlot)
  }

  const handleReset = () => {
    setSelectedDate(undefined)
    setSelectedTimeSlot(null)
    setActiveTab("doctor")
  }

  const handleNext = () => {
    if (activeTab === "doctor" && selectedDoctor) {
      setActiveTab("date")
    } else if (activeTab === "date" && selectedDate) {
      setActiveTab("time")
    } else if (activeTab === "time" && selectedTimeSlot) {
      setActiveTab("confirm")
    }
  }

  const handleBack = () => {
    if (activeTab === "date") {
      setActiveTab("doctor")
    } else if (activeTab === "time") {
      setActiveTab("date")
    } else if (activeTab === "confirm") {
      setActiveTab("time")
    }
  }

  return (
    <RoleGuard requiredRole="USER">
      <div className="w-full max-w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Book an Appointment</h1>
            <p className="text-muted-foreground">Schedule an appointment with a doctor</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="mt-4 md:mt-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="doctor" disabled={activeTab !== "doctor"}>
              <span className="hidden sm:inline">1. Select Doctor</span>
              <span className="sm:hidden">1. Doctor</span>
            </TabsTrigger>
            <TabsTrigger value="date" disabled={!selectedDoctor || activeTab === "doctor"}>
              <span className="hidden sm:inline">2. Choose Date</span>
              <span className="sm:hidden">2. Date</span>
            </TabsTrigger>
            <TabsTrigger value="time" disabled={!selectedDate || activeTab === "doctor" || activeTab === "date"}>
              <span className="hidden sm:inline">3. Select Time</span>
              <span className="sm:hidden">3. Time</span>
            </TabsTrigger>
            <TabsTrigger
              value="confirm"
              disabled={!selectedTimeSlot || activeTab === "doctor" || activeTab === "date" || activeTab === "time"}
            >
              <span className="hidden sm:inline">4. Confirm</span>
              <span className="sm:hidden">4. Confirm</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="doctor" className="space-y-4">
              <DoctorSearch onDoctorSelect={handleDoctorSelect} selectedDoctorId={selectedDoctor?.id || null} />
              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={!selectedDoctor}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="date" className="space-y-4">
              <AppointmentCalendar
                doctorId={selectedDoctor?.id}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!selectedDate}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="time" className="space-y-4">
              <TimeSlotPicker
                doctorId={selectedDoctor?.id}
                selectedDate={selectedDate}
                onTimeSlotSelect={handleTimeSlotSelect}
                selectedTimeSlot={selectedTimeSlot}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!selectedTimeSlot}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="confirm" className="space-y-4">
              <BookingConfirmation
                doctorId={selectedDoctor?.id}
                doctorName={selectedDoctor?.name}
                doctorSpecialty={selectedDoctor?.specialty}
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
                onReset={handleReset}
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === "doctor" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <User className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Doctor</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === "date" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <Calendar className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Date</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === "time" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Time</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === "confirm" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Confirm</span>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
