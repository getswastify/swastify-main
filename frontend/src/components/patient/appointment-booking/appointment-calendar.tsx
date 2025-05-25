"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
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
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate ?? new Date())

  // Fetch available dates when currentMonth or doctorId changes
  useEffect(() => {
    if (!doctorId) return

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1

    setIsLoading(true)
    getAvailableDates(doctorId, year, month)
      .then((response) => {
        const dates = response.availableDates.map((d) => new Date(d))
        setAvailableDates(dates)
      })
      .catch((err) => {
        console.error("Failed to fetch dates:", err)
        toast.error("Failed to load available dates")
      })
      .finally(() => setIsLoading(false))
  }, [currentMonth, doctorId])

  // Disable dates not in availableDates or in the past
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) return true

    return !availableDates.some(
      (availableDate) =>
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear(),
    )
  }

  // Handle month change - update currentMonth to the first day of the new month
  const handleMonthChange = (date: Date) => {
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    onDateSelect(date)
  }

  // Sync currentMonth with selectedDate when it changes from parent (optional)
  useEffect(() => {
    if (!selectedDate) return
    const newMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    if (newMonth.getTime() !== currentMonth.getTime()) {
      setCurrentMonth(newMonth)
    }
  }, [selectedDate,currentMonth])

  return (
    <div className="flex justify-center">
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
        </div>
      ) : (
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={isDateDisabled}
          onMonthChange={handleMonthChange}
          defaultMonth={currentMonth}
          className="rounded-md border border-gray-700"
        />
      )}
    </div>
  )
}
