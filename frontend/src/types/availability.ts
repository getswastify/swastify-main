export interface Availability {
    id: string
    doctorId?: string
    dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    startTime: string // Format: "HH:MM" (24-hour)
    endTime: string // Format: "HH:MM" (24-hour)
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
  