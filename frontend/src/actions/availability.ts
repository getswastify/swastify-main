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
export const createDoctorAvailability = async (
  data: Omit<Availability, "id" | "doctorId" | "createdAt" | "updatedAt">,
): Promise<AvailabilityResponse<Availability>> => {
  try {
    const response = await api.post<AvailabilityResponse<Availability>>("/availability/doctor-availability", data)
    return response.data
  } catch (error) {
    return error as AvailabilityResponse<never>
  }
}

/**
 * Update doctor availability for a specific day
 */
export const updateDoctorAvailability = async (
  data: Omit<Availability, "id" | "doctorId" | "createdAt" | "updatedAt">,
): Promise<AvailabilityResponse<Availability>> => {
  try {
    const response = await api.put<AvailabilityResponse<Availability>>("/availability/doctor-availability", data)
    return response.data
  } catch (error) {
    return error as AvailabilityResponse<never>
  }
}

/**
 * Delete a specific time slot from doctor availability
 */
export const deleteTimeSlot = async (availabilityId: string, timeSlotId: string): Promise<AvailabilityResponse<unknown>> => {
  try {
    const response = await api.delete<AvailabilityResponse<unknown>>(`/availability/doctor-availability/${availabilityId}`, {
      data: { timeSlotId },
    })
    return response.data
  } catch (error) {
    return error as AvailabilityResponse<never>
  }
}

