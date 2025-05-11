"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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

  // Use a ref to track if we're already processing a month change
  const isProcessingMonthChange = useRef(false)
  const lastProcessedMonth = useRef<string>(`${new Date().getMonth()}-${new Date().getFullYear()}`)

  // Function to fetch available dates when month changes
  const fetchAvailableDates = useCallback(
    async (year: number, month: number) => {
      if (!doctorId) return

      setIsLoading(true)
      try {
        const response = await getAvailableDates(doctorId, year, month)
        const dates = response.availableDates.map((dateStr) => new Date(dateStr))
        setAvailableDates(dates)
      } catch (error) {
        console.error("Error fetching available dates:", error)
        toast.error("Failed to load available dates")
      } finally {
        setIsLoading(false)
      }
    },
    [doctorId], // dependency for useCallback
  )

  // Fetch available dates when month changes or doctor changes
  useEffect(() => {
    // Skip if we don't have a doctor ID
    if (!doctorId) return

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1

    // Create a key for the current month to avoid duplicate processing
    const monthKey = `${month}-${year}`

    // Skip if we've already processed this month
    if (monthKey === lastProcessedMonth.current) return

    // Update the last processed month
    lastProcessedMonth.current = monthKey

    // Fetch available dates
    fetchAvailableDates(year, month)
  }, [currentMonth, fetchAvailableDates, doctorId])

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

  // Handle month change with debouncing to prevent infinite loops
  const handleMonthChange = (date: Date) => {
    // Skip if we're already processing a month change
    if (isProcessingMonthChange.current) return

    // Set the processing flag
    isProcessingMonthChange.current = true

    // Update the current month
    setCurrentMonth(date)

    // Reset the processing flag after a short delay
    setTimeout(() => {
      isProcessingMonthChange.current = false
    }, 100)
  }

  return (
    <Card className="bg-[#1a2236] border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Select Date</CardTitle>
        <CardDescription className="text-gray-400">Choose an available date for your appointment</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
          </div>
        ) : (
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={isDateDisabled}
            onMonthChange={handleMonthChange}
            className="rounded-md border border-gray-700"
          />
        )}
        <p className="text-sm text-gray-500 mt-4">* Only dates with available appointment slots are selectable</p>
      </CardContent>
    </Card>
  )
}
