import api from "@/lib/axios"

// Types for API responses
export interface ApiResponse<T = any> {
  status: boolean
  message: string
  data?: T
  error?: any
}

export interface LoginData {
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

export interface ResetPasswordData {
  token: string
  newPassword: string
}

/**
 * Login user
 */
export const loginUser = async (data: LoginData): Promise<ApiResponse> => {
  try {
    const response = await api.post("/auth/login", data)
    return response as ApiResponse
  } catch (error) {
    return error as ApiResponse
  }
}

/**
 * Register user
 */
export const registerUser = async (data: RegisterData): Promise<ApiResponse> => {
  try {
    const response = await api.post("/auth/register", data)
    return response as ApiResponse
  } catch (error) {
    return error as ApiResponse
  }
}

/**
 * Verify OTP
 */
export const verifyOTP = async (email: string, otp: string): Promise<ApiResponse> => {
  try {
    const response = await api.post("/auth/verify-otp", { email, otp })
    return response as ApiResponse
  } catch (error) {
    return error as ApiResponse
  }
}

/**
 * Resend OTP
 */
export const resendOTP = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await api.post("/auth/resend-otp", { email })
    return response as ApiResponse
  } catch (error) {
    return error as ApiResponse
  }
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await api.post("/auth/request-password-reset", { email })
    return response as ApiResponse
  } catch (error) {
    return error as ApiResponse
  }
}

/**
 * Verify reset token
 */
export const verifyResetToken = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await api.get(`/auth/verify-reset-token?token=${token}`)
    return response as ApiResponse
  } catch (error) {
    return error as ApiResponse
  }
}

/**
 * Reset password
 */
export const resetPassword = async (data: ResetPasswordData): Promise<ApiResponse> => {
  try {
    const response = await api.post("/auth/reset-password", data)
    return response as ApiResponse
  } catch (error) {
    return error as ApiResponse
  }
}
