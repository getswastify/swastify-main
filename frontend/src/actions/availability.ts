import api from "@/lib/axios"
import type { Availability, AvailabilityResponse } from "@/types/availability"

/**
 * Fetch doctor availability
 */
export const fetchDoctorAvailability = async (): Promise<AvailabilityResponse<Availability[]>> => {
  try {
    const response = await api.get<AvailabilityResponse<Availability[]>>("/appointment/doctor-availability")
    return response.data
  } catch (error) {
    return error as AvailabilityResponse<never>
  }
}

/**
 * Create doctor availability
 */
export const createDoctorAvailability = async (
  data: Omit<Availability, "id">,
): Promise<AvailabilityResponse<Availability>> => {
  try {
    const response = await api.post<AvailabilityResponse<Availability>>("/appointment/doctor-availability", data)
    return response.data
  } catch (error) {
    return error as AvailabilityResponse<never>
  }
}

/**
 * Update doctor availability
 */
export const updateDoctorAvailability = async (data: Availability): Promise<AvailabilityResponse<Availability>> => {
  try {
    const response = await api.put<AvailabilityResponse<Availability>>("/appointment/doctor-availability", data)
    return response.data
  } catch (error) {
    return error as AvailabilityResponse<never>
  }
}

/**
 * Delete doctor availability
 */
export const deleteDoctorAvailability = async (id: string): Promise<AvailabilityResponse<{ deleted: boolean }>> => {
  try {
    const response = await api.delete<AvailabilityResponse<{ deleted: boolean }>>(
      `/appointment/doctor-availability/${id}`,
    )
    return response.data
  } catch (error) {
    return error as AvailabilityResponse<never>
  }
}
