import api from "@/lib/axios"
import type {
  PatientDashboardResponse,
  DoctorDashboardResponse,
  HospitalDashboardResponse,
  AdminDashboardResponse,
} from "@/types/dashboard"

/**
 * Get patient dashboard data
 */
export const getPatientDashboard = async (): Promise<PatientDashboardResponse> => {
  try {
    const response = await api.get<PatientDashboardResponse>("/dashboard/patient")
    return response.data
  } catch (error) {
    return error as PatientDashboardResponse
  }
}

/**
 * Get doctor dashboard data
 */
export const getDoctorDashboard = async (): Promise<DoctorDashboardResponse> => {
  try {
    const response = await api.get<DoctorDashboardResponse>("/dashboard/doctor")
    return response.data
  } catch (error) {
    return error as DoctorDashboardResponse
  }
}

/**
 * Get hospital dashboard data
 */
export const getHospitalDashboard = async (): Promise<HospitalDashboardResponse> => {
  try {
    const response = await api.get<HospitalDashboardResponse>("/dashboard/hospital")
    return response.data
  } catch (error) {
    return error as HospitalDashboardResponse
  }
}

/**
 * Get admin dashboard data
 */
export const getAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  try {
    const response = await api.get<AdminDashboardResponse>("/dashboard/admin")
    return response.data
  } catch (error) {
    return error as AdminDashboardResponse
  }
}
