export interface TimeSlot {
  id?: string
  startTime: string // Format: "HH:MM" (24-hour)
  endTime: string // Format: "HH:MM" (24-hour)
}

export interface Availability {
  id?: string
  doctorId?: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  timeSlots: TimeSlot[]
  createdAt?: string
  updatedAt?: string
}

export interface AvailabilityResponse<T = unknown> {
  status: boolean
  message: string
  data?: T
  error?: {
    code: string
    issue: string
  }
}

// For deleting a specific time slot
export interface DeleteTimeSlotRequest {
  timeSlotId: string
}

// Day mapping constants
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// Helper function to get day name from day number
export function getDayName(dayNumber: number): string {
  return DAY_NAMES[dayNumber] || "Unknown"
}

// Helper function to get day number from day name
export function getDayNumber(dayName: string): number {
  const index = DAY_NAMES.indexOf(dayName)
  return index !== -1 ? index : 1 // Default to Monday if not found
}
