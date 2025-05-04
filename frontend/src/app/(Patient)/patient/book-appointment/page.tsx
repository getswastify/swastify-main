"use client"

import { type SetStateAction, useState } from "react"
import { DoctorSearch } from "@/components/patient/appointment-booking/doctor-search"
import { AppointmentCalendar } from "@/components/patient/appointment-booking/appointment-calendar"
import { TimeSlotPicker } from "@/components/patient/appointment-booking/time-slot-picker"
import { BookingConfirmation } from "@/components/patient/appointment-booking/booking-confirmation"
import { RoleGuard } from "@/components/role-guard"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarDays, ChevronRight, Info } from "lucide-react"
import type { TimeSlot } from "@/actions/appointments"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function BookAppointmentPage() {
  const [activeTab, setActiveTab] = useState("doctor")
  const [selectedDoctor, setSelectedDoctor] = useState<{
    id: string
    name: string
    specialty: string
  } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const router = useRouter()

  const handleDoctorSelect = (
    doctor: SetStateAction<{
      id: string
      name: string
      specialty: string
    } | null>,
  ) => {
    setSelectedDoctor(doctor)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
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
    if (activeTab === "date") setActiveTab("doctor")
    else if (activeTab === "time") setActiveTab("date")
    else if (activeTab === "confirm") setActiveTab("time")
  }

  // Calculate progress percentage based on active tab
  const getProgressPercentage = () => {
    switch (activeTab) {
      case "doctor":
        return 25
      case "date":
        return 50
      case "time":
        return 75
      case "confirm":
        return 100
      default:
        return 0
    }
  }

  return (
    <RoleGuard requiredRole="USER">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 bg-gradient-to-b from-background to-muted/30 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>
            <p className="text-muted-foreground mt-1">Schedule a consultation with our healthcare professionals</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="mt-4 md:mt-0 rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="w-full max-w-3xl mx-auto">
          <Progress value={getProgressPercentage()} className="h-2 mb-6" />

          <div className="flex justify-between mb-8 text-sm">
            <div
              className={`flex flex-col items-center ${activeTab === "doctor" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeTab === "doctor" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                1
              </div>
              Doctor
            </div>
            <div
              className={`flex flex-col items-center ${activeTab === "date" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeTab === "date" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                2
              </div>
              Date
            </div>
            <div
              className={`flex flex-col items-center ${activeTab === "time" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeTab === "time" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                3
              </div>
              Time
            </div>
            <div
              className={`flex flex-col items-center ${activeTab === "confirm" ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeTab === "confirm" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                4
              </div>
              Confirm
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mt-2">
            <div className="max-w-3xl mx-auto">
              <Card className="border shadow-sm">
                <CardContent className="p-6">
                  <TabsContent value="doctor" className="mt-0">
                    <DoctorSearch onDoctorSelect={handleDoctorSelect} selectedDoctorId={selectedDoctor?.id || null} />
                  </TabsContent>

                  <TabsContent value="date" className="mt-0">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-semibold">Select Date</h2>
                        <p className="text-muted-foreground">Choose an available date for your appointment</p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="calendar-container">
                          <AppointmentCalendar
                            doctorId={selectedDoctor?.id || ""}
                            onDateSelect={handleDateSelect}
                            selectedDate={selectedDate}
                          />
                        </div>

                        <div className="hidden lg:block">
                          <Card className="h-full">
                            <CardContent className="p-6 flex flex-col justify-between h-full">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                  <CalendarDays className="h-5 w-5" />
                                  <h3 className="font-medium">Appointment Information</h3>
                                </div>

                                {selectedDate ? (
                                  <div className="space-y-4">
                                    <div className="bg-primary/10 p-4 rounded-lg">
                                      <p className="font-medium">Selected Date:</p>
                                      <p className="text-lg font-semibold">
                                        {selectedDate.toLocaleDateString("en-US", {
                                          weekday: "long",
                                          month: "long",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </p>
                                      {selectedDoctor && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          with Dr. {selectedDoctor.name}, {selectedDoctor.specialty}
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <p className="font-medium">What to expect:</p>
                                      <ul className="space-y-1 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                          <span className="bg-primary/20 text-primary rounded-full p-1 mt-0.5">
                                            <ChevronRight className="h-3 w-3" />
                                          </span>
                                          <span>Initial consultation typically lasts 30-45 minutes</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="bg-primary/20 text-primary rounded-full p-1 mt-0.5">
                                            <ChevronRight className="h-3 w-3" />
                                          </span>
                                          <span>Please arrive 15 minutes before your appointment</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="bg-primary/20 text-primary rounded-full p-1 mt-0.5">
                                            <ChevronRight className="h-3 w-3" />
                                          </span>
                                          <span>Bring your insurance card and ID</span>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-center p-6 bg-muted/30 rounded-lg">
                                    <Info className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="font-medium">No date selected</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Please select an available date from the calendar to continue
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                                <p className="flex items-start gap-2">
                                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>
                                  Please be ready with any relevant medical records, prescriptions, if applicable.
                                  </span>
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="time" className="mt-0">
                    <TimeSlotPicker
                      doctorId={selectedDoctor?.id || ""}
                      selectedDate={selectedDate}
                      onTimeSlotSelect={handleTimeSlotSelect}
                      selectedTimeSlot={selectedTimeSlot}
                    />
                  </TabsContent>

                  <TabsContent value="confirm" className="mt-0">
                    <BookingConfirmation
                      doctorId={selectedDoctor?.id || ""}
                      doctorName={selectedDoctor?.name || ""}
                      doctorSpecialty={selectedDoctor?.specialty || ""}
                      selectedDate={selectedDate}
                      selectedTimeSlot={selectedTimeSlot}
                      onReset={handleReset}
                    />
                  </TabsContent>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 border-t">
                  <Button
                    variant="outline"
                    onClick={activeTab === "confirm" ? handleReset : handleBack}
                    disabled={activeTab === "doctor"}
                    className="rounded-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {activeTab === "confirm" ? "Start Over" : "Back"}
                  </Button>
                  {activeTab !== "confirm" && (
                    <Button
                      onClick={handleNext}
                      disabled={
                        (activeTab === "doctor" && !selectedDoctor) ||
                        (activeTab === "date" && !selectedDate) ||
                        (activeTab === "time" && !selectedTimeSlot)
                      }
                      className="rounded-full"
                    >
                      Next <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
