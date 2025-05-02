"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAvailableDates } from "@/actions/appointments"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface AppointmentCalendarProps {
  doctorId: string
  onDateSelect: (date: Date | undefined) => void
  selectedDate: Date | undefined
}

export function AppointmentCalendar({ doctorId, onDateSelect, selectedDate }: AppointmentCalendarProps) {
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Function to fetch available dates when month changes
  const fetchAvailableDates = async (year: number, month: number) => {
    if (!doctorId) return

    setIsLoading(true)
    try {
      const response = await getAvailableDates(doctorId, year, month)
      // Convert string dates to Date objects
      const dates = response.availableDates.map((dateStr) => new Date(dateStr))
      setAvailableDates(dates)
    } catch (error) {
      console.error("Error fetching available dates:", error)
      toast.error("Failed to load available dates")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch available dates when month changes or doctor changes
  useEffect(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1 // JavaScript months are 0-indexed
    fetchAvailableDates(year, month)
  }, [currentMonth, doctorId])

  // Custom function to disable dates that are not available
  const isDateDisabled = (date: Date) => {
    // Disable dates in the past
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return true
    }

    // Check if the date is in the available dates
    return !availableDates.some(
      (availableDate) =>
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear(),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Date</CardTitle>
        <CardDescription>Choose an available date for your appointment</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={isDateDisabled}
            onMonthChange={setCurrentMonth}
            className="rounded-md border"
          />
        )}
        <p className="text-sm text-muted-foreground mt-4">
          * Only dates with available appointment slots are selectable
        </p>
      </CardContent>
    </Card>
  )
}
