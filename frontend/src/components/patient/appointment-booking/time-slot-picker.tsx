"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getAvailableSlots, formatTimeSlot, type TimeSlot } from "@/actions/appointments"
import { toast } from "sonner"
import { Loader2, Clock, Calendar, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getTimezoneName } from "@/types/availability"

interface TimeSlotPickerProps {
  doctorId: string
  selectedDate: Date | undefined
  onTimeSlotSelect: (timeSlot: TimeSlot | null) => void
  selectedTimeSlot: TimeSlot | null
}

export function TimeSlotPicker({ doctorId, selectedDate, onTimeSlotSelect, selectedTimeSlot }: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [timeGroups, setTimeGroups] = useState<{ morning: TimeSlot[]; afternoon: TimeSlot[]; evening: TimeSlot[] }>({
    morning: [],
    afternoon: [],
    evening: [],
  })
  const [timezoneName, setTimezoneName] = useState("")

  useEffect(() => {
    // Get the timezone name on component mount
    setTimezoneName(getTimezoneName())
  }, [])

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!doctorId || !selectedDate) return

      setIsLoading(true)
      try {
        // Format date as YYYY-MM-DD without timezone conversion
        const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
        const response = await getAvailableSlots(doctorId, formattedDate)
        setAvailableSlots(response.availableSlots)

        // Group time slots by time of day
        groupTimeSlots(response.availableSlots)
      } catch (error) {
        console.error("Error fetching available slots:", error)
        toast.error("Failed to load available time slots")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailableSlots()
  }, [doctorId, selectedDate])

  // Group time slots into morning, afternoon, and evening
  const groupTimeSlots = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = []
    const afternoon: TimeSlot[] = []
    const evening: TimeSlot[] = []

    slots.forEach((slot) => {
      // Create a date object from the ISO string
      const startDate = new Date(slot.startTime)
      const startHour = startDate.getHours()

      if (startHour < 12) {
        morning.push(slot)
      } else if (startHour < 17) {
        afternoon.push(slot)
      } else {
        evening.push(slot)
      }
    })

    setTimeGroups({ morning, afternoon, evening })
  }

  const handleSelectTimeSlot = (slot: TimeSlot) => {
    onTimeSlotSelect(slot)
  }

  // Check if two time slots are the same
  const isSameTimeSlot = (slot1: TimeSlot, slot2: TimeSlot | null) => {
    if (!slot2) return false
    return slot1.startTime === slot2.startTime && slot1.endTime === slot2.endTime
  }

  // Format the date for display
  const formatDate = (date?: Date) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Render a time slot group
  const renderTimeGroup = (title: string, slots: TimeSlot[], icon: React.ReactNode) => {
    if (slots.length === 0) return null

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {slots.map((slot, index) => {
            const { startTime, endTime } = formatTimeSlot(slot)
            return (
              <Button
                key={index}
                variant={isSameTimeSlot(slot, selectedTimeSlot) ? "default" : "outline"}
                className={`h-auto py-3 ${isSameTimeSlot(slot, selectedTimeSlot) ? "bg-[#10b981] hover:bg-[#0d9668] text-white" : "bg-[#2c3e67] border-gray-700 text-white hover:bg-[#3a4d7a]"}`}
                onClick={() => handleSelectTimeSlot(slot)}
              >
                <div className="text-center">
                  <div className="font-medium">{startTime}</div>
                  <div className="text-xs text-gray-300">to {endTime}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">Select Time</h3>
          {selectedDate && (
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(selectedDate)}</span>
            </p>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>All times are shown in your local timezone ({timezoneName})</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-8 bg-[#1a2236] rounded-lg">
          <Clock className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-4 text-lg font-semibold text-white">No Available Slots</h3>
          <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
            There are no available appointment slots for this date. Please select another date from the calendar.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderTimeGroup("Morning", timeGroups.morning, <span className="text-amber-500">☀️</span>)}
          {renderTimeGroup("Afternoon", timeGroups.afternoon, <span className="text-orange-500">🌤️</span>)}
          {renderTimeGroup("Evening", timeGroups.evening, <span className="text-indigo-500">🌙</span>)}

          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <Info className="h-3 w-3" />
            All appointment times are displayed in your local timezone ({timezoneName})
          </p>
        </div>
      )}
    </div>
  )
}
