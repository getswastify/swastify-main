export interface TimeSlot {
  startTime: string // Format: "HH:MM" (24-hour)
  endTime: string // Format: "HH:MM" (24-hour)
}

export interface Availability {
  id?: number
  doctorId?: number
  dayOfWeek: string // Now a string like "Monday" instead of a number
  startTime?: string // ISO string format
  endTime?: string // ISO string format
  timeSlots?: TimeSlot[] // Used for request payload only
}

export interface AvailabilityResponse<T = unknown> {
  status: boolean
  message: string
  data?: T
  error?: {
    code?: string
    issue?: string
  }
}

// Day mapping constants
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// Helper function to get day name
export function getDayName(day: string): string {
  return day
}

// Helper function to group availability by day
export function groupAvailabilityByDay(availabilities: Availability[]): Record<string, Availability[]> {
  return availabilities.reduce(
    (acc, availability) => {
      const day = availability.dayOfWeek
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(availability)
      return acc
    },
    {} as Record<string, Availability[]>,
  )
}

// Format time for display (ISO to 12h format)
export function formatTime(isoTime: string): string {
  try {
    const date = new Date(isoTime)
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  } catch (e) {
    return isoTime // Return original if parsing fails
  }
}

// Format time from HH:MM to 12h format
export function formatTimeFrom24h(time: string): string {
  try {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  } catch (e) {
    return time // Return original if parsing fails
  }
}
