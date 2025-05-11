"use client"

import { type SetStateAction, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { ArrowLeft, ArrowUpRight, CalendarDays, ChevronRight, Info, Search, Stethoscope } from "lucide-react"
import type { TimeSlot } from "@/actions/appointments"
import { getDoctors } from "@/actions/appointments"
import { AppointmentCalendar } from "@/components/patient/appointment-booking/appointment-calendar"
import { TimeSlotPicker } from "@/components/patient/appointment-booking/time-slot-picker"
import { BookingConfirmation } from "@/components/patient/appointment-booking/booking-confirmation"
import { Skeleton } from "@/components/ui/skeleton"

interface Doctor {
  id: string
  name: string
  specialty: string
  experience: number
}

export default function BookAppointmentPage() {
  const [activeTab, setActiveTab] = useState("doctor")
  const [selectedDoctor, setSelectedDoctor] = useState<{
    id: string
    name: string
    specialty: string
  } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true)
      try {
        const response = await getDoctors()
        setDoctors(response.doctors)
        setFilteredDoctors(response.doctors)
      } catch (error) {
        console.error("Error fetching doctors:", error)
        toast.error("Failed to load doctors")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Filter doctors based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDoctors(doctors)
      return
    }

    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredDoctors(filtered)
  }, [searchTerm, doctors])

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
      <div className="w-full max-w-full bg-[#0c1120] min-h-screen text-white p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Book an Appointment</h1>
            <p className="text-gray-400">Schedule a consultation with our healthcare professionals</p>
          </div>
          <Button
            onClick={() => router.push("/patient/appointments")}
            variant="outline"
            className="mt-4 md:mt-0 bg-transparent border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Button>
        </div>

        {activeTab === "doctor" ? (
          <div className="mb-8">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search doctors by name or specialty..."
                className="pl-10 bg-[#1a2236] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-[#10b981] focus-visible:ring-offset-[#0c1120]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <DoctorCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center bg-[#1a2236] rounded-lg">
                <h3 className="text-xl font-medium text-white mb-2">No doctors found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search or browse all available doctors</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    isSelected={selectedDoctor?.id === doctor.id}
                    onSelect={() => handleDoctorSelect(doctor)}
                  />
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleNext}
                disabled={!selectedDoctor}
                className="bg-[#10b981] hover:bg-[#0d9668] text-white"
              >
                Next Step <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl mx-auto">
            <Progress value={getProgressPercentage()} className="h-2 mb-6 bg-gray-700" />

            <div className="flex justify-between mb-8 text-sm">
              <div
                className={`flex flex-col items-center ${activeTab === "doctor" ? "text-[#10b981] font-medium" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeTab === "doctor" ? "bg-[#10b981] text-white" : "bg-gray-800 text-gray-400"}`}
                >
                  1
                </div>
                Doctor
              </div>
              <div
                className={`flex flex-col items-center ${activeTab === "date" ? "text-[#10b981] font-medium" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeTab === "date" ? "bg-[#10b981] text-white" : "bg-gray-800 text-gray-400"}`}
                >
                  2
                </div>
                Date
              </div>
              <div
                className={`flex flex-col items-center ${activeTab === "time" ? "text-[#10b981] font-medium" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeTab === "time" ? "bg-[#10b981] text-white" : "bg-gray-800 text-gray-400"}`}
                >
                  3
                </div>
                Time
              </div>
              <div
                className={`flex flex-col items-center ${activeTab === "confirm" ? "text-[#10b981] font-medium" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeTab === "confirm" ? "bg-[#10b981] text-white" : "bg-gray-800 text-gray-400"}`}
                >
                  4
                </div>
                Confirm
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mt-2">
                <div className="bg-[#1a2236] rounded-xl overflow-hidden shadow-lg">
                  <div className="p-6">
                    <TabsContent value="date" className="mt-0">
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-xl font-semibold text-white">Select Date</h2>
                          <p className="text-gray-400">Choose an available date for your appointment</p>
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
                            <div className="bg-[#1e2b45] rounded-xl p-6 h-full">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[#10b981]">
                                  <CalendarDays className="h-5 w-5" />
                                  <h3 className="font-medium">Appointment Information</h3>
                                </div>

                                {selectedDate ? (
                                  <div className="space-y-4">
                                    <div className="bg-[#2c3e67] p-4 rounded-lg">
                                      <p className="font-medium text-white">Selected Date:</p>
                                      <p className="text-lg font-semibold text-white">
                                        {selectedDate.toLocaleDateString("en-US", {
                                          weekday: "long",
                                          month: "long",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </p>
                                      {selectedDoctor && (
                                        <p className="text-sm text-gray-300 mt-1">
                                          with Dr. {selectedDoctor.name}, {selectedDoctor.specialty}
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <p className="font-medium text-white">What to expect:</p>
                                      <ul className="space-y-1 text-sm text-gray-400">
                                        <li className="flex items-start gap-2">
                                          <span className="bg-[#10b981]/20 text-[#10b981] rounded-full p-1 mt-0.5">
                                            <ChevronRight className="h-3 w-3" />
                                          </span>
                                          <span>Initial consultation typically lasts 30-45 minutes</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="bg-[#10b981]/20 text-[#10b981] rounded-full p-1 mt-0.5">
                                            <ChevronRight className="h-3 w-3" />
                                          </span>
                                          <span>Please arrive 15 minutes before your appointment</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                          <span className="bg-[#10b981]/20 text-[#10b981] rounded-full p-1 mt-0.5">
                                            <ChevronRight className="h-3 w-3" />
                                          </span>
                                          <span>Bring your insurance card and ID</span>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-center p-6 bg-[#1a2236] rounded-lg">
                                    <Info className="h-10 w-10 text-gray-500 mb-2" />
                                    <p className="font-medium text-white">No date selected</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                      Please select an available date from the calendar to continue
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-400">
                                <p className="flex items-start gap-2">
                                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span>
                                    Please be ready with any relevant medical records, prescriptions, if applicable.
                                  </span>
                                </p>
                              </div>
                            </div>
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
                  </div>
                  <div className="flex justify-between p-6 border-t border-gray-700">
                    <Button
                      variant="outline"
                      onClick={activeTab === "confirm" ? handleReset : handleBack}
                      className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {activeTab === "confirm" ? "Start Over" : "Back"}
                    </Button>
                    {activeTab !== "confirm" && (
                      <Button
                        onClick={handleNext}
                        disabled={
                          (activeTab === "date" && !selectedDate) || (activeTab === "time" && !selectedTimeSlot)
                        }
                        className="bg-[#10b981] hover:bg-[#0d9668] text-white"
                      >
                        Next <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}

// Doctor Card Component
const DoctorCard = ({
  doctor,
  isSelected,
  onSelect,
}: {
  doctor: Doctor
  isSelected: boolean
  onSelect: () => void
}) => {
  return (
    <div
      className={`bg-[#1a2236] rounded-xl overflow-hidden shadow-lg cursor-pointer ${
        isSelected ? "ring-2 ring-[#10b981]" : ""
      }`}
      onClick={onSelect}
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-14 w-14 rounded-lg border-2 border-gray-700">
            <AvatarImage src={`/placeholder.svg?height=80&width=80`} alt={doctor.name} />
            <AvatarFallback className="bg-[#2c3e67] text-white rounded-lg">
              {doctor.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{doctor.name}</h3>

            <div className="flex items-center gap-1.5 text-gray-400 mt-1">
              <Stethoscope className="h-4 w-4" />
              <span className="text-sm">{doctor.specialty}</span>
            </div>

            {doctor.experience && <p className="text-sm text-gray-400 mt-1">{doctor.experience} years experience</p>}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          {isSelected ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#10b981]/20 text-[#10b981] text-sm font-medium">
              Selected
            </div>
          ) : (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-900/20 text-blue-400 text-sm font-medium">
              Available
            </div>
          )}

          <div className="w-8 h-8 rounded-full bg-[#2c3e67] flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Doctor Card Skeleton
const DoctorCardSkeleton = () => (
  <div className="bg-[#1a2236] rounded-xl p-6 shadow-md">
    <div className="flex items-start gap-4 mb-4">
      <Skeleton className="h-14 w-14 rounded-lg bg-gray-700" />
      <div className="flex-1">
        <Skeleton className="h-6 w-36 bg-gray-700 mb-2" />
        <Skeleton className="h-4 w-28 bg-gray-700 mb-1" />
        <Skeleton className="h-4 w-24 bg-gray-700" />
      </div>
    </div>

    <div className="flex justify-between items-center mt-4">
      <Skeleton className="h-6 w-20 rounded-full bg-gray-700" />
      <Skeleton className="w-8 h-8 rounded-full bg-gray-700" />
    </div>
  </div>
)
