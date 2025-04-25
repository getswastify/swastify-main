export interface DashboardResponse {
  status: boolean
  message: string
  data?: {
    isProfile?: boolean
    isProfileComplete?: boolean
    isVerified?: "PENDING" | "APPROVED" | "REJECTED"
  }
  error?: {
    issue: string
  }
}

export type PatientDashboardResponse = DashboardResponse
export type DoctorDashboardResponse = DashboardResponse
export type HospitalDashboardResponse = DashboardResponse
export type AdminDashboardResponse = DashboardResponse
