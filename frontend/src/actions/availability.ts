import api from "@/lib/axios"
import type { Availability, AvailabilityResponse } from "@/types/availability"

/**
 * Fetch doctor availability
 */
export const fetchDoctorAvailability = async (): Promise<AvailabilityResponse<Availability[]>> => {
  try {
    const response = await api.get<AvailabilityResponse<Availability[]>>("/availability/doctor-availability")
    return response.data
  } catch (error) {
    return error as AvailabilityResponse<never>
  }
}

/**
 * Create doctor availability for a specific day
 */
export const createDoctorAvailability = async (data: {
  dayOfWeek: string
  timeSlots: { startTime: string; endTime: string }[]
}): Promise<AvailabilityResponse<null>> => {
  try {
    const response = await api.post<AvailabilityResponse<null>>("/availability/doctor-availability", data)
    return response.data
  } catch (error) {
    return error as AvailabilityResponse<never>
  }
}

/**
 * Update doctor availability for a specific day
 */
export const updateDoctorAvailability = async (data: {
  dayOfWeek: string
  timeSlots: { startTime: string; endTime: string }[]
}): Promise<AvailabilityResponse<null>> => {
  try {
    const response = await api.put<AvailabilityResponse<null>>("/availability/doctor-availability", data)
    return response.data
  } catch (error) {
    return error as AvailabilityResponse<never>
  }
}

/**
 * Delete a specific availability slot
 */
export const deleteAvailabilitySlot = async (availabilityId: number): Promise<AvailabilityResponse<null>> => {
  try {
    const response = await api.delete<AvailabilityResponse<null>>(`/availability/doctor-availability`, {
      data: { availabilityId },
    })
    return response.data
  } catch (error) {
    return error as AvailabilityResponse<never>
  }
}
