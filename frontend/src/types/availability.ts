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

// Improved function to convert UTC ISO string to local time display
export function formatTime(isoTime: string): string {
  try {
    // Create a date object from the ISO string (which is in UTC)
    const date = new Date(isoTime)

    // Format the time in the user's local timezone
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  } catch (e) {
    console.error("Error formatting time:", e)
    return isoTime // Return original if parsing fails
  }
}

// Format time from HH:MM to 12h format
export function formatTimeFrom24h(time: string): string {
  try {
    // If it's an ISO string, use formatTime instead
    if (time.includes("T")) {
      return formatTime(time)
    }

    // Otherwise handle HH:MM format
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  } catch (e) {
    console.error("Error formatting 24h time:", e)
    return time // Return original if parsing fails
  }
}

// Update the utcToLocalTimeHHMM function to properly handle IST conversion
export function utcToLocalTimeHHMM(utcTimeStr: string): string {
  try {
    // Create a date object from the UTC ISO string
    const date = new Date(utcTimeStr)

    // For debugging
    console.log("Original UTC string:", utcTimeStr)
    console.log("Parsed date object:", date.toString())

    // Get hours and minutes in the local timezone
    const hours = date.getHours()
    const minutes = date.getMinutes()

    // Format as HH:MM
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  } catch (e) {
    console.error("Error converting UTC to local HH:MM:", e)
    return utcTimeStr
  }
}

// Add a new function to convert UTC to IST (India Standard Time)
export function utcToISTTimeHHMM(utcTimeStr: string): string {
  try {
    // Create a date object from the UTC ISO string
    const date = new Date(utcTimeStr)

    // Convert to IST (UTC+5:30)
    // First get UTC hours and minutes
    const utcHours = date.getUTCHours()
    const utcMinutes = date.getUTCMinutes()

    // Add 5 hours and 30 minutes for IST
    let istHours = utcHours + 5
    let istMinutes = utcMinutes + 30

    // Handle minute overflow
    if (istMinutes >= 60) {
      istHours += 1
      istMinutes -= 60
    }

    // Handle hour overflow
    istHours = istHours % 24

    // Format as HH:MM
    return `${String(istHours).padStart(2, "0")}:${String(istMinutes).padStart(2, "0")}`
  } catch (e) {
    console.error("Error converting UTC to IST HH:MM:", e)
    return utcTimeStr
  }
}

// Ensure time is in HH:MM format regardless of input format
export function normalizeTimeFormat(time: string): string {
  // If it's already in HH:MM format
  if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    // Ensure it's padded properly
    const [hours, minutes] = time.split(":").map(Number)
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  }

  // If it's an ISO string
  if (time.includes("T")) {
    return utcToLocalTimeHHMM(time)
  }

  // If it's in 12-hour format (e.g., "2:30 PM")
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (match) {
    const [, hours, minutes, ampm] = match
    let hour = Number.parseInt(hours, 10)

    // Convert to 24-hour format
    if (ampm.toUpperCase() === "PM" && hour < 12) {
      hour += 12
    } else if (ampm.toUpperCase() === "AM" && hour === 12) {
      hour = 0
    }

    return `${String(hour).padStart(2, "0")}:${minutes.padStart(2, "0")}`
  }

  // Return original if we can't parse it
  console.warn("Could not normalize time format:", time)
  return time
}

// Get the current timezone offset in minutes
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset()
}

// Get the current timezone name
export function getTimezoneName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// Debug function to log timezone information
export function logTimezoneInfo(): void {
  const now = new Date()
  console.log({
    currentTime: now.toString(),
    timezoneOffset: now.getTimezoneOffset(),
    timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isoString: now.toISOString(),
    localString: now.toLocaleString(),
  })
}
