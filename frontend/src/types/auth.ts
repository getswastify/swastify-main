export interface ApiResponse<T = unknown> {
  status: boolean
  message: string
  data?: T
  error?: {
    code: string
    issue: string
  }
}

export type LoginData = {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
  dob: string
  gender: string
}

export type ResetPasswordData = {
  newPassword: string
  token: string
}

// User Interface
export interface User {
  phone: string
  role: string
  id: string
  email: string
  lastName: string
  firstName: string
  hasProfile?: boolean
  isVerified?: "PENDING" | "APPROVED" | "REJECTED"
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    role: "USER" | "DOCTOR" | "HOSPITAL"
    createdAt?: string
    hasProfile?: boolean
    isVerified?: "PENDING" | "APPROVED" | "REJECTED"
  }
}

// Register OTP Response (Success)
export interface RegisterOtpResponse {
  otpVerificationRequired: boolean
}

export type RegisterResponse = ApiResponse<RegisterOtpResponse>

// Verify OTP Response (Success)
export interface VerifyOtpResponse {
  user: User
  token: string
}

export type VerifyOtpApiResponse = ApiResponse<VerifyOtpResponse>

// Login Response
export interface LoginResponse {
  user: User
  token: string
}

export type LoginApiResponse = ApiResponse<LoginResponse>

// Error Response for OTP-related issues
export type ErrorOtpResponse = ApiResponse<{
  code: "OTP_NOT_FOUND" | "INVALID_OTP"
  issue: string
}>

// Auth State Interface
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ status: boolean; message: string }>
  logout: () => Promise<void>
}
