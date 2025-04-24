export interface DashboardResponse {
  status: boolean
  message: string
  data?: {
    isProfile?: boolean
    isProfileComplete?: boolean
  }
  error?: {
    issue: string
  }
}

export type PatientDashboardResponse = DashboardResponse
export type DoctorDashboardResponse = DashboardResponse
export type HospitalDashboardResponse = DashboardResponse
export type AdminDashboardResponse = DashboardResponse
