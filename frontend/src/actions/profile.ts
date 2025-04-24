import api from "@/lib/axios"
import type {
  PatientProfileData,
  PatientProfileResponse,
  DoctorProfileData,
  DoctorProfileResponse,
  HospitalProfileData,
  HospitalProfileResponse,
} from "@/types/profile"

/**
 * Create patient profile
 */
export const createPatientProfile = async (data: PatientProfileData): Promise<PatientProfileResponse> => {
  try {
    const response = await api.post<PatientProfileResponse>("/profile/patient", data)
    return response.data
  } catch (error) {
    return error as PatientProfileResponse
  }
}

/**
 * Update patient profile
 */
export const updatePatientProfile = async (data: PatientProfileData): Promise<PatientProfileResponse> => {
  try {
    const response = await api.patch<PatientProfileResponse>("/profile/patient", data)
    return response.data
  } catch (error) {
    return error as PatientProfileResponse
  }
}

/**
 * Create doctor profile
 */
export const createDoctorProfile = async (data: DoctorProfileData): Promise<DoctorProfileResponse> => {
  try {
    const response = await api.post<DoctorProfileResponse>("/profile/doctor", data)
    return response.data
  } catch (error) {
    return error as DoctorProfileResponse
  }
}

/**
 * Update doctor profile
 */
export const updateDoctorProfile = async (data: DoctorProfileData): Promise<DoctorProfileResponse> => {
  try {
    const response = await api.patch<DoctorProfileResponse>("/profile/doctor", data)
    return response.data
  } catch (error) {
    return error as DoctorProfileResponse
  }
}

/**
 * Create hospital profile
 */
export const createHospitalProfile = async (data: HospitalProfileData): Promise<HospitalProfileResponse> => {
  try {
    const response = await api.post<HospitalProfileResponse>("/profile/hospital", data)
    return response.data
  } catch (error) {
    return error as HospitalProfileResponse
  }
}

/**
 * Update hospital profile
 */
export const updateHospitalProfile = async (data: HospitalProfileData): Promise<HospitalProfileResponse> => {
  try {
    const response = await api.patch<HospitalProfileResponse>("/profile/hospital", data)
    return response.data
  } catch (error) {
    return error as HospitalProfileResponse
  }
}

/**
 * Get patient profile
 */
export const getPatientProfile = async (): Promise<PatientProfileResponse> => {
  try {
    const response = await api.get<PatientProfileResponse>("/profile/patient")
    return response.data
  } catch (error) {
    return error as PatientProfileResponse
  }
}

/**
 * Get doctor profile
 */
export const getDoctorProfile = async (): Promise<DoctorProfileResponse> => {
  try {
    const response = await api.get<DoctorProfileResponse>("/profile/doctor")
    return response.data
  } catch (error) {
    return error as DoctorProfileResponse
  }
}

/**
 * Get hospital profile
 */
export const getHospitalProfile = async (): Promise<HospitalProfileResponse> => {
  try {
    const response = await api.get<HospitalProfileResponse>("/profile/hospital")
    return response.data
  } catch (error) {
    return error as HospitalProfileResponse
  }
}
