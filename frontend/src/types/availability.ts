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

// Update the formatTime function to properly handle timezone conversion
export function formatTime(isoTime: string): string {
  try {
    // Create a date object that properly handles the timezone
    const date = new Date(isoTime)
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  } catch (e) {
    console.error(e)
    return isoTime // Return original if parsing fails
  }
}

// Update the formatTimeFrom24h function to better handle UTC conversion
export function formatTimeFrom24h(time: string): string {
  try {
    // If it's an ISO string, convert to local time
    if (time.includes("T")) {
      const date = new Date(time)
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    }

    // Otherwise handle HH:MM format
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  } catch (e) {
    console.error(e)
    return time // Return original if parsing fails
  }
}

// Add a new function to convert local time to UTC for API requests
export function localToUTC(dateStr: string, timeStr: string): string {
  try {
    // Combine date and time
    const localDateTime = new Date(`${dateStr}T${timeStr}`)
    // Convert to ISO string (which will be in UTC)
    return localDateTime.toISOString()
  } catch (e) {
    console.error(e)
    return `${dateStr}T${timeStr}` // Return original if parsing fails
  }
}

// Add a function to convert UTC to local time
export function utcToLocal(utcTimeStr: string): string {
  try {
    const date = new Date(utcTimeStr)
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  } catch (e) {
    console.error(e)
    return utcTimeStr
  }
}

// Add a new function to convert UTC ISO string to local time HH:MM format
export function utcToLocalTimeString(utcTimeStr: string): string {
  try {
    const date = new Date(utcTimeStr)
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  } catch (e) {
    console.error(e)
    return utcTimeStr
  }
}
