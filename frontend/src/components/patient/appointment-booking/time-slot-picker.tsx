"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAvailableSlots, formatTimeSlot, type TimeSlot } from "@/actions/appointments"
import { toast } from "sonner"
import { Loader2, Clock } from "lucide-react"

interface TimeSlotPickerProps {
  doctorId: string
  selectedDate: Date | undefined
  onTimeSlotSelect: (timeSlot: TimeSlot | null) => void
  selectedTimeSlot: TimeSlot | null
}

export function TimeSlotPicker({ doctorId, selectedDate, onTimeSlotSelect, selectedTimeSlot }: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!doctorId || !selectedDate) return

      setIsLoading(true)
      try {
        // Format date as YYYY-MM-DD without timezone conversion
        const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
        const response = await getAvailableSlots(doctorId, formattedDate)
        setAvailableSlots(response.availableSlots)
      } catch (error) {
        console.error("Error fetching available slots:", error)
        toast.error("Failed to load available time slots")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailableSlots()
  }, [doctorId, selectedDate])

  const handleSelectTimeSlot = (slot: TimeSlot) => {
    onTimeSlotSelect(slot)
  }

  // Check if two time slots are the same
  const isSameTimeSlot = (slot1: TimeSlot, slot2: TimeSlot | null) => {
    if (!slot2) return false
    return slot1.startTime === slot2.startTime && slot1.endTime === slot2.endTime
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Time</CardTitle>
        <CardDescription>Choose an available time slot for your appointment</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Available Slots</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no available appointment slots for this date. Please select another date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableSlots.map((slot, index) => {
              const { startTime, endTime } = formatTimeSlot(slot)
              return (
                <Button
                  key={index}
                  variant={isSameTimeSlot(slot, selectedTimeSlot) ? "default" : "outline"}
                  className="h-auto py-3"
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
        )}
      </CardContent>
    </Card>
  )
}
