"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ArrowLeft, Search, MapPin, Calendar, Clock, ChevronLeft, Check, Info } from "lucide-react"
import type { Doctor, TimeSlot } from "@/actions/appointments"
import { getDoctors, formatTimeSlot } from "@/actions/appointments"
import { AppointmentCalendar } from "@/components/patient/appointment-booking/appointment-calendar"
import { TimeSlotPicker } from "@/components/patient/appointment-booking/time-slot-picker"
import { BookingConfirmation } from "@/components/patient/appointment-booking/booking-confirmation"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

type BookingStep = "doctors" | "calendar" | "time" | "confirm"

export default function BookAppointmentPage() {
  const [step, setStep] = useState<BookingStep>("doctors")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
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

  // Filter doctors based on search term only
  useEffect(() => {
    let filtered = doctors

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.clinicAddress.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredDoctors(filtered)
  }, [searchTerm, doctors])

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setStep("calendar")
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot | null) => {
    setSelectedTimeSlot(timeSlot)
  }

  const handleBack = () => {
    if (step === "calendar") {
      setStep("doctors")
    } else if (step === "time") {
      setStep("calendar")
    } else if (step === "confirm") {
      setStep("time")
    }
  }

  const handleReset = () => {
    setSelectedDate(undefined)
    setSelectedTimeSlot(null)
    setStep("doctors")
  }

  // Format time slot for display
  const formatTimeDisplay = (timeSlot: TimeSlot) => {
    const formatted = formatTimeSlot(timeSlot)
    return `${formatted.startTime} - ${formatted.endTime}`
  }

  const renderStepContent = () => {
    switch (step) {
      case "doctors":
        return (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search doctors by name, specialty or location..."
                  className="pl-10 bg-[#1a2236] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-[#10b981] focus-visible:ring-offset-[#0c1120]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <DoctorCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center bg-[#1a2236] rounded-lg">
                <h3 className="text-xl font-medium text-white mb-2">No doctors found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search to find available doctors</p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.userId} doctor={doctor} onSelect={() => handleDoctorSelect(doctor)} />
                ))}
              </div>
            )}
          </div>
        )

      case "calendar":
        return (
          selectedDoctor && (
            <div className="bg-[#1a2236] rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-6">
                  <Button variant="ghost" size="sm" className="mr-4 h-8 w-8 p-0 rounded-full" onClick={handleBack}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Button>
                  <h2 className="text-xl font-semibold text-white">Choose Appointment Date</h2>
                </div>

                {/* Mobile View - Only Calendar */}
                <div className="md:hidden">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-[#10b981] hover:bg-[#10b981] text-white">
                        ₹{selectedDoctor.consultationFee}
                      </Badge>
                      <h3 className="text-lg font-bold text-white">Dr. {selectedDoctor.name}</h3>
                    </div>
                    <p className="text-[#10b981] text-sm">{selectedDoctor.specialty}</p>
                  </div>

                  <div className="bg-[#1e2b45] rounded-xl p-4">
                    <div className="w-full flex justify-center">
                      <AppointmentCalendar
                        doctorId={selectedDoctor.userId}
                        onDateSelect={handleDateSelect}
                        selectedDate={selectedDate}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      * Only dates with available appointment slots are selectable
                    </p>

                    {selectedDate && (
                      <div className="mt-4">
                        <Button
                          className="w-full bg-[#10b981] hover:bg-[#0d9668] text-white"
                          onClick={() => setStep("time")}
                        >
                          Continue to Select Time
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop View - Three Column Layout */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-12 gap-4">
                    {/* Doctor Card */}
                    <div className="col-span-3">
                      <div className="bg-[#1e2b45] rounded-xl overflow-hidden h-full">
                        <div className="relative h-48">
                          {selectedDoctor.profilePicture ? (
                            <Image
                              src={selectedDoctor.profilePicture || "/placeholder.svg"}
                              alt={selectedDoctor.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-b from-[#1e3a8a] to-[#1a2236] flex items-center justify-center">
                              <div className="text-5xl font-bold text-white/50">
                                {selectedDoctor.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-[#10b981] hover:bg-[#10b981] text-white">
                              ₹{selectedDoctor.consultationFee}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="text-xl font-bold text-white">Dr. {selectedDoctor.name}</h3>
                          <p className="text-[#10b981] font-medium">{selectedDoctor.specialty}</p>

                          <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[#1a2236] hover:bg-[#1a2236] text-white">
                                {selectedDoctor.experience} years experience
                              </Badge>
                            </div>

                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              <span className="text-sm text-gray-300">{selectedDoctor.clinicAddress}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calendar */}
                    <div className="col-span-5">
                      <div className="bg-[#1e2b45] rounded-xl p-4 h-full flex flex-col">
                        <div className="flex-grow flex items-center justify-center">
                          <div>
                            <AppointmentCalendar
                              doctorId={selectedDoctor.userId}
                              onDateSelect={handleDateSelect}
                              selectedDate={selectedDate}
                            />
                            <p className="text-xs text-gray-400 mt-2 text-center">
                              * Only dates with available appointment slots are selectable
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Information */}
                    <div className="col-span-4">
                      <div className="bg-[#1e2b45] rounded-xl p-4 h-full">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="h-5 w-5 text-[#10b981]" />
                          <h3 className="text-lg font-semibold text-white">Appointment Information</h3>
                        </div>

                        {selectedDate ? (
                          <div className="bg-[#2c3e67] rounded-lg p-4 mb-4">
                            <h4 className="text-sm text-gray-300 mb-1">Selected Date:</h4>
                            <p className="text-white font-medium text-lg">
                              {selectedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-[#10b981] mt-1">
                              with Dr. {selectedDoctor.name}, {selectedDoctor.specialty}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-[#2c3e67] rounded-lg p-4 mb-4">
                            <p className="text-white">Please select a date from the calendar to continue.</p>
                          </div>
                        )}

                        <h4 className="text-sm font-medium text-white mt-4 mb-2">What to expect:</h4>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <div className="rounded-full bg-[#10b981] p-1 mt-0.5 flex-shrink-0">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-300">
                              consultation typically lasts 30 minutes
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="rounded-full bg-[#10b981] p-1 mt-0.5 flex-shrink-0">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-300">
                              Please arrive 15 minutes before your appointment
                            </span>
                          </li>
                          
                        </ul>

                        <div className="flex items-start gap-2 mt-4 bg-[#1a2236] p-3 rounded-lg">
                          <Info className="h-4 w-4 text-[#10b981] mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-300">
                            Please be ready with any relevant medical records, prescriptions, if applicable.
                          </p>
                        </div>

                        {selectedDate && (
                          <div className="mt-6">
                            <Button
                              className="w-full bg-[#10b981] hover:bg-[#0d9668] text-white"
                              onClick={() => setStep("time")}
                            >
                              Continue to Select Time
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )

      case "time":
        return (
          selectedDoctor &&
          selectedDate && (
            <div className="bg-[#1a2236] rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-6">
                  <Button variant="ghost" size="sm" className="mr-4 h-8 w-8 p-0 rounded-full" onClick={handleBack}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Button>
                  <h2 className="text-xl font-semibold text-white">Choose Appointment Time</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Appointment Info */}
                  <div className="lg:col-span-4 order-2 lg:order-1">
                    <div className="bg-[#2c3e67] rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-5">
                        <Avatar className="h-12 w-12 border-2 border-[#10b981]">
                          {selectedDoctor.profilePicture ? (
                            <AvatarImage
                              src={selectedDoctor.profilePicture || "/placeholder.svg"}
                              alt={selectedDoctor.name}
                            />
                          ) : (
                            <AvatarFallback className="bg-[#1a2236] text-white">
                              {selectedDoctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-white">{selectedDoctor.name}</h3>
                          <p className="text-sm text-[#10b981]">{selectedDoctor.specialty}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-[#1a2236] p-2 rounded-md">
                            <Calendar className="h-5 w-5 text-[#10b981]" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-300">Appointment Date</p>
                            <p className="text-white font-medium">
                              {selectedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-[#1a2236] p-2 rounded-md">
                            <MapPin className="h-5 w-5 text-[#10b981]" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-300">Location</p>
                            <p className="text-white">{selectedDoctor.clinicAddress}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-[#1a2236] p-2 rounded-md">
                            <Clock className="h-5 w-5 text-[#10b981]" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-300">Duration</p>
                            <p className="text-white">30 minutes</p>
                          </div>
                        </div>

                        <Separator className="bg-gray-700/50" />

                        <div>
                          <p className="text-sm text-gray-300 mb-2">Consultation Fee</p>
                          <div className="flex items-center">
                            <Badge className="bg-[#10b981] hover:bg-[#10b981] text-white text-lg px-3 py-1">
                              ₹{selectedDoctor.consultationFee}
                            </Badge>
                          </div>
                        </div>

                        {selectedTimeSlot && (
                          <div>
                            <p className="text-sm text-gray-300 mb-2">Selected Time</p>
                            <div className="bg-[#1a2236] p-3 rounded-lg">
                              <p className="text-white font-medium">{formatTimeDisplay(selectedTimeSlot)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="lg:col-span-8 order-1 lg:order-2">
                    <div className="bg-[#1e2b45] rounded-xl p-4 sm:p-6">
                      <TimeSlotPicker
                        doctorId={selectedDoctor.userId}
                        selectedDate={selectedDate}
                        onTimeSlotSelect={handleTimeSlotSelect}
                        selectedTimeSlot={selectedTimeSlot}
                      />

                      {selectedTimeSlot && (
                        <div className="mt-6">
                          <Button
                            className="w-full bg-[#10b981] hover:bg-[#0d9668] text-white"
                            onClick={() => setStep("confirm")}
                          >
                            Continue to Confirmation
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )

      case "confirm":
        return (
          selectedDoctor &&
          selectedDate &&
          selectedTimeSlot && (
            <div className="bg-[#1a2236] rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-6">
                  <Button variant="ghost" size="sm" className="mr-4 h-8 w-8 p-0 rounded-full" onClick={handleBack}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Button>
                  <h2 className="text-xl font-semibold text-white">Confirm Your Appointment</h2>
                </div>

                <BookingConfirmation
                  doctorId={selectedDoctor.userId}
                  doctorName={selectedDoctor.name}
                  doctorSpecialty={selectedDoctor.specialty}
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  onReset={handleReset}
                />
              </div>
            </div>
          )
        )

      default:
        return null
    }
  }

  return (
    <RoleGuard requiredRole="USER">
      <div className="w-full max-w-full bg-[#0c1120] min-h-screen text-white p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
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

        <div className="max-w-6xl mx-auto">{renderStepContent()}</div>
      </div>
    </RoleGuard>
  )
}

// Doctor Card Component
const DoctorCard = ({
  doctor,
  onSelect,
}: {
  doctor: Doctor
  onSelect: () => void
}) => {
  return (
    <div className="bg-[#1a2236] rounded-xl overflow-hidden shadow-lg cursor-pointer" onClick={onSelect}>
      {/* Doctor Image */}
      <div className="relative h-[180px] w-full">
        {doctor.profilePicture ? (
          <div className="h-full w-full relative">
            <Image
              src={doctor.profilePicture || "/placeholder.svg"}
              alt={doctor.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-[#1e3a8a] to-[#1a2236] flex items-center justify-center">
            <div className="text-4xl font-bold text-white/50">
              {doctor.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </div>
        )}

        {/* Fee Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-[#10b981] hover:bg-[#10b981] text-white">₹{doctor.consultationFee}</Badge>
        </div>
      </div>

      {/* Doctor Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white">{doctor.name}</h3>
        <p className="text-[#10b981] text-sm">{doctor.specialty}</p>

        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-transparent border-gray-700 text-gray-300">
            {doctor.experience} years exp.
          </Badge>
        </div>

        <div className="flex items-start gap-1.5 mt-3 text-gray-400">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs line-clamp-1">{doctor.clinicAddress}</p>
        </div>

        <Button
          className="mt-4 bg-[#2c3e67] hover:bg-[#3a4d7a] text-white w-full"
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
        >
          Book Appointment
        </Button>
      </div>
    </div>
  )
}

// Doctor Card Skeleton
const DoctorCardSkeleton = () => (
  <div className="bg-[#1a2236] rounded-xl overflow-hidden shadow-lg">
    <Skeleton className="h-[180px] w-full bg-gray-700" />
    <div className="p-4">
      <Skeleton className="h-6 w-32 bg-gray-700 mb-2" />
      <Skeleton className="h-4 w-24 bg-gray-700 mb-3" />
      <Skeleton className="h-5 w-20 bg-gray-700 mb-3" />
      <Skeleton className="h-4 w-full bg-gray-700 mb-4" />
      <Skeleton className="h-10 w-full bg-gray-700 rounded-md" />
    </div>
  </div>
)
