"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAvailableSlots, formatTimeSlot, type TimeSlot } from "@/actions/appointments"
import { toast } from "sonner"
import { Loader2, Clock, Calendar, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
      const startHour = new Date(slot.startTime).getHours()

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
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {slots.map((slot, index) => {
            const { startTime, endTime } = formatTimeSlot(slot)
            return (
              <Button
                key={index}
                variant={isSameTimeSlot(slot, selectedTimeSlot) ? "default" : "outline"}
                className={`h-auto py-3 ${isSameTimeSlot(slot, selectedTimeSlot) ? "border-2 border-primary shadow-sm" : ""}`}
                onClick={() => handleSelectTimeSlot(slot)}
              >
                <div className="text-center">
                  <div className="font-medium">{startTime}</div>
                  <div className="text-xs text-muted-foreground">to {endTime}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className="border border-muted/60 shadow-sm">
      <CardHeader className="bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Select Time
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              {selectedDate && (
                <>
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{formatDate(selectedDate)}</span>
                </>
              )}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>All times are shown in your local timezone</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8 bg-muted/20 rounded-lg">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Available Slots</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              There are no available appointment slots for this date. Please select another date from the calendar.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {renderTimeGroup("Morning", timeGroups.morning, <span className="text-amber-500">☀️</span>)}
            {renderTimeGroup("Afternoon", timeGroups.afternoon, <span className="text-orange-500">🌤️</span>)}
            {renderTimeGroup("Evening", timeGroups.evening, <span className="text-indigo-500">🌙</span>)}
          </div>
        )}

        {availableSlots.length > 0 && (
          <div className="mt-6 pt-4 border-t border-muted">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3 w-3" />
              All appointment times are displayed in your local timezone
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
